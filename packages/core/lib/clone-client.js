const Client = require('../client')

module.exports = (client) => {
  const clone = new Client({}, {}, client._notifier)

  clone._config = client._config
  clone._context = client._context
  clone._depth = client._depth

  // TODO: how much do we clone this?
  clone._metadata = { ...client._metadata }

  // changes to these properties should not be reflected in the original client,
  // so ensure they are are (shallow) cloned
  clone._breadcrumbs = client._breadcrumbs.slice()
  clone._user = { ...client._user }

  clone.__logger = client.__logger
  clone.__delivery = client.__delivery
  clone.__sessionDelegate = client.__sessionDelegate

  clone._plugins = client._plugins

  clone._callbacks = {
    onError: client._callbacks.onError.slice(),
    onSessionPayload: client._callbacks.onSessionPayload.slice(),
    onBreadcrumb: client._callbacks.onBreadcrumb.slice()
  }

  return clone
}
