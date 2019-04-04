const name = 'Bugsnag for React Native'
const { version } = require('../package.json')
const url = 'https://github.com/bugsnag/bugsnag-js'

const React = require('react')

const Client = require('@bugsnag/core/client')

const schema = { ...require('@bugsnag/core/config').schema, ...require('./config') }

const plugins = [
  require('@bugsnag/plugin-react-native-global-error-handler'),
  require('@bugsnag/plugin-react-native-unhandled-rejection'),
  require('@bugsnag/plugin-console-breadcrumbs'),
  require('@bugsnag/plugin-react-native-app-state-breadcrumbs'),
  require('@bugsnag/plugin-react-native-connectivity-breadcrumbs'),
  require('@bugsnag/plugin-react-native-orientation-breadcrumbs'),
  require('./native-client') // TODO: '@bugsnag/plugin-react-native-native-client'
]

const bugsnagReact = require('@bugsnag/plugin-react')

module.exports = (opts) => {
  // handle very simple use case where user supplies just the api key as a string
  if (typeof opts === 'string') opts = { apiKey: opts }

  // ensure opts is actually an object (at this point it
  // could be null, undefined, a number, a boolean etc.)
  opts = { ...opts }

  const bugsnag = new Client({ name, version, url })

  bugsnag.setOptions(opts)
  bugsnag.configure(schema)
  plugins.forEach(pl => { bugsnag.use(pl) })

  bugsnag.use(bugsnagReact, React)

  bugsnag._logger.debug(`Loaded!`)

  if (bugsnag.config.autoCaptureSessions) {
    bugsnag.startSession()
  }
  return bugsnag._proxy
}

module.exports['default'] = module.exports
