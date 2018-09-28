const name = 'Bugsnag Expo'
const version = '__VERSION__'
const url = 'https://github.com/bugsnag/bugsnag-js'

const Client = require('@bugsnag/core/client')

const schema = require('@bugsnag/core/config').schema
const pluginGlobalErrorHandler = require('@bugsnag/plugin-reactnative-errorhandler')
const dXMLHttpRequest = require('@bugsnag/delivery-xml-http-request')


module.exports = (opts) => {
  const bugsnag = new Client({ name, version, url })

  // handle very simple use case where user supplies just the api key as a string
  if (typeof opts === 'string') opts = { apiKey: opts }

  if (typeof opts.releaseStage !== 'string') {
    opts.releaseStage = __DEV__ ? 'development' : 'production'
  }

  bugsnag.setOptions(opts)
  bugsnag.delivery(dXMLHttpRequest())
  bugsnag.configure(schema)

  bugsnag.use(pluginGlobalErrorHandler)

  return bugsnag
}
