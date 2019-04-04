const expoClient = require('@bugsnag/expo')

const nativeClient = require('@bugsnag/plugin-react-native-native-client')

module.exports = (opts) => {
  const bugsnag = expoClient(opts)
  bugsnag.use(nativeClient)

  return bugsnag._proxy // gotta deal with sending the first session though
}

module.exports['default'] = module.exports
