const config = require('./config')
const Event = require('./event')
const Breadcrumb = require('./breadcrumb')
const { map, includes, isArray } = require('./lib/es-utils')
const isError = require('./lib/iserror')
const some = require('./lib/async-some')
const createCallbackRunner = require('./lib/run-on-error-callbacks')
const noop = () => {}
const metadataDelegate = require('./lib/metadata-delegate')

const LOG_USAGE_ERR_PREFIX = `Usage error.`
const REPORT_USAGE_ERR_PREFIX = `Bugsnag usage error.`

class BugsnagClient {
  constructor (configuration, schema = config.schema, notifier) {
    this._notifier = notifier

    // intialise opts and config
    this._opts = configuration
    this._config = {}
    this._schema = schema

    this.__delivery = { sendSession: noop, sendEvent: noop }
    this.__logger = { debug: noop, info: noop, warn: noop, error: noop }
    this.__sessionDelegate = { startSession: noop, pauseSession: noop, resumeSession: noop }

    this._session = null
    this._breadcrumbs = []
    this._context = undefined
    this._metadata = {}
    this._user = {}

    this._callbacks = {
      onError: [],
      onSessionPayload: [],
      onBreadcrumb: []
    }

    this._plugins = {}

    this._extractConfiguration()

    var self = this
    var notify = this.notify
    this.notify = function () {
      return notify.apply(self, arguments)
    }
  }

  addMetadata (section, ...args) {
    return metadataDelegate.add.call(this, section, ...args)
  }

  getMetadata (section, key) {
    return metadataDelegate.get.call(this, section, key)
  }

  clearMetadata (section, key) {
    return metadataDelegate.clear.call(this, section, key)
  }

  getContext () {
    return this._context
  }

  setContext (c) {
    this._context = c
  }

  getUser () {
    return this._user
  }

  setUser (id, name, email) {
    this._user = { id, name, email }
  }

  clearUser () {
    this._user = {}
  }

  _extractConfiguration (partialSchema = this._schema) {
    const conf = config.mergeDefaults(this._opts, partialSchema)
    const validity = config.validate(conf, partialSchema)

    if (!validity.valid === true) throw new Error(generateConfigErrorMessage(validity.errors))

    if (typeof conf.onError === 'function') conf.onError = [ conf.onError ]
    if (conf.onError && conf.onError.length) this._callbacks.onError = this._callbacks.onError.concat(conf.onError)
    if (conf.logger) this._logger(conf.logger)

    // merge with existing config
    this._config = { ...this._config, ...conf }

    return this
  }

  use (plugin, ...args) {
    if (plugin.configSchema) this._extractConfiguration(plugin.configSchema)
    const result = plugin.init(this, ...args)
    if (plugin.name) this._plugins[`~${plugin.name}~`] = result
    return this
  }

  getPlugin (name) {
    return this._plugins[`~${name}~`]
  }

  _delivery (d) {
    this.__delivery = d(this)
    return this
  }

  _logger (l, sid) {
    this.__logger = l
    return this
  }

  _sessionDelegate (s) {
    this.__sessionDelegate = s
    return this
  }

  _addAppData (entity) {
    entity.app.version = this._config.appVersion
    entity.app.releaseStage = this._config.releaseStage
    entity.app.type = this._config.appType
  }

  startSession () {
    return this.__sessionDelegate.startSession(this)
  }

  pauseSession () {
    return this.__sessionDelegate.pauseSession(this)
  }

  resumeSession () {
    return this.__sessionDelegate.resumeSession(this)
  }

  addOnError (fn, front = false) {
    this._callbacks.onError[front ? 'unshift' : 'push'](fn)
  }

  // TODO: add removeOnError

  _addOnSessionPayload (fn) {
    this._callbacks.onSessionPayload.push(fn)
  }

  // TODO: add removeOnSession

  addOnBreadcrumb (fn) {
    this._callbacks.onBreadcrumb.push(fn)
  }

  // TODO: add removeOnBreadcrumb

  leaveBreadcrumb (message, metadata, type, timestamp) {
    // coerce bad values so that the defaults get set
    message = message || undefined
    type = typeof type === 'string' ? type : undefined
    timestamp = typeof timestamp === 'string' ? timestamp : undefined
    metadata = typeof metadata === 'object' && metadata !== null ? metadata : undefined

    // if no message and no metadata, usefulness of this crumb is questionable at best so discard
    if (typeof message !== 'string' && !metadata) return

    const crumb = new Breadcrumb(message, metadata, type, timestamp)
    if (!isArray(this._config.enabledBreadcrumbTypes) || !includes(this._config.enabledBreadcrumbTypes, crumb.type)) return

    // run synchronous onBreadcrumb callbacks
    let ignore = false
    const cbs = this._callbacks.onSessionPayload.slice(0)
    while (!ignore) {
      if (!cbs.length) {
        break
      }
      try {
        ignore = cbs.pop()(crumb) === false
      } catch (e) {
        this.__logger.error(`Error occurred in onBreadcrumb callback, continuing anyway…`)
        this.__logger.error(e)
      }
    }

    if (ignore) {
      this.__logger.debug(`Breadcrumb not attached due to onBreadcrumb callback`)
      return this
    }

    // push the valid crumb onto the queue and maintain the length
    this._breadcrumbs.push(crumb)
    if (this._breadcrumbs.length > this._config.maxBreadcrumbs) {
      this._breadcrumbs = this._breadcrumbs.slice(this._breadcrumbs.length - this._config.maxBreadcrumbs)
    }
  }

  notify (error, onError, cb) {
    // ensure we have an error (or a reasonable object representation of an error)
    let { err, errorFramesToSkip } = normaliseError(error, this.__logger)
    const event = new Event(err.name, err.message, Event.getStacktrace(err, errorFramesToSkip, 2), error)
    // this._notify(Event.create(err, errorFramesToSkip, 2), onError, cb)
    return this._notify(event, onError, cb)
  }

  _notify (event, onError = noop, cb = noop) {
    event.context = this.context

    event._user = { ...this._user }

    // TODO: how deep should we clone this metadata?
    event._metadata = { ...this._metadata }

    event._breadcrumbs = this._breadcrumbs.slice(0)

    this._addAppData(event)

    if (this._session) {
      this._session.track(event)
      event.session = this._session
    }

    // exit early if the reports should not be sent on the current releaseStage
    if (isArray(this._config.enabledReleaseStages) && !includes(this._config.enabledReleaseStages, this._config.releaseStage)) {
      this.__logger.warn(`Event not sent due to releaseStage/enabledReleaseStages configuration`)
      return cb(null, event)
    }

    const originalSeverity = event.severity

    const beforeSend = [].concat(this._callbacks.onError).concat(onError)
    const onCallbackError = err => {
      this.__logger.error(`Error occurred in onError callback, continuing anyway…`)
      this.__logger.error(err)
    }

    some(beforeSend, createCallbackRunner(event, onCallbackError), (err, ignore) => {
      if (err) onCallbackError(err)

      if (ignore) {
        this.__logger.debug(`Event not sent due to onError callback`)
        return cb(null, event)
      }

      // TODO: ensure some centralised logic goes in place for enabledBreadcrumbTypes
      BugsnagClient.prototype.leaveBreadcrumb.call(this, event.errors[0].class, {
        class: event.errors[0].class,
        message: event.errors[0].message,
        severity: event.severity
      }, 'error')

      if (originalSeverity !== event.severity) {
        event._handledState.severityReason = { type: 'userCallbackSetSeverity' }
      }

      this.__delivery.sendEvent({
        apiKey: event.apiKey || this._config.apiKey,
        notifier: this._notifier,
        events: [ event ]
      }, (err) => cb(err, event))
    })
  }
}

const normaliseError = (error, logger) => {
  const synthesizedErrorFramesToSkip = 3

  const createAndLogUsageError = reason => {
    const msg = generateNotifyUsageMessage(reason)
    logger.warn(`${LOG_USAGE_ERR_PREFIX} ${msg}`)
    return new Error(`${REPORT_USAGE_ERR_PREFIX} ${msg}`)
  }

  let err
  let errorFramesToSkip = 0
  switch (typeof error) {
    case 'string':
      err = new Error(String(error))
      errorFramesToSkip = synthesizedErrorFramesToSkip
      break
    case 'number':
    case 'boolean':
      err = new Error(String(error))
      break
    case 'function':
      err = createAndLogUsageError('function')
      break
    case 'object':
      if (error !== null && isError(error)) {
        err = error
      } else if (error !== null && hasNecessaryFields(error)) {
        err = new Error(error.message || error.errorMessage)
        err.name = error.name || error.errorClass
        errorFramesToSkip = synthesizedErrorFramesToSkip
      } else {
        err = createAndLogUsageError(error === null ? 'null' : 'unsupported object')
      }
      break
    default:
      err = createAndLogUsageError('nothing')
  }
  return { err, errorFramesToSkip }
}

const hasNecessaryFields = error =>
  (typeof error.name === 'string' || typeof error.errorClass === 'string') &&
  (typeof error.message === 'string' || typeof error.errorMessage === 'string')

const generateConfigErrorMessage = errors =>
  `Bugsnag configuration error\n${map(errors, (err) => `"${err.key}" ${err.message} \n    got ${stringify(err.value)}`).join('\n\n')}`

const generateNotifyUsageMessage = actual =>
  `notify() expected error/opts parameters, got ${actual}`

const stringify = val => typeof val === 'object' ? JSON.stringify(val) : String(val)

module.exports = BugsnagClient
