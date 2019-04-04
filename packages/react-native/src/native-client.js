/*
   plugin-react-native-native-client
     android/
       +- build.gradle
       +- {...}/AndroidManifest.xml
       +- {...}/BugsnagReactNative.java
     ios/
       +- BugsnagReactNative.h
       +- BugsnagReactNative.m
       +- BugsnagReactNative.xcodeproj
     src/
       +- native-client.js
       +- native-serializer.js
     test/
       +- native-client.test.js
       +- native-serializer.test.js

   package.json must include:
      "rnpm": {
        "ios": {
          "project": "ios/BugsnagReactNative.xcodeproj",
          "sharedLibraries": [
            "libz"
          ]
        },
        "android": {
          "packageInstance": "BugsnagReactNative.getPackage()",
          "packageImportPath": "import com.bugsnag.reactnative.BugsnagReactNative;"
        }
      },
      "peerDependencies": {
        "react-native": "^0.45.0" <-- needed for sync native methods
      }
 */
const NativeModules = require('react-native').NativeModules

const NativeClient = NativeModules.BugsnagReactNative

const serializeForNativeLayer = require('./native-serializer')

module.exports = {
  init: (client) => {
    if (!NativeClient) throw new Error('cannot find native BugsnagReactNative module')
    // TODO: read default API key from NativeClient.apiKey

    // Forward session delegate requests to the native client
    const delegate = {
      startSession: client => {
        NativeClient.startSession()
      },
      stopSession: client => {
        NativeClient.stopSession()
      },
      resumeSession: client => {
        NativeClient.resumeSession()
      }
    }

    client.sessionDelegate(delegate)
    if (client.stopSession === undefined) {
      client.stopSession = delegate.stopSession
    }
    if (client.resumeSession === undefined) {
      client.resumeSession = delegate.resumeSession
    }

    configureProxies(client)

    installNativePayloadInfoCallback(client)

    // Forward breadcrumbs to the native client for storage
    client.leaveBreadcrumb = (name, metaData, type, timestamp) => {
      const metadata = serializeForNativeLayer(metaData, client._logger)
      NativeClient.leaveBreadcrumb({name, metadata, type, timestamp})
    }

    client.delivery((client) => ({
      sendReport: (payload, cb = () => {}) => {
        const event = payload.events[0]
        const report = event.toJSON()
        report.threads = event.threads
        delete report.request
        NativeClient.deliver(report).then(cb)
      }
    }))

    // Synchronous call to the native layer to initialize crash reporting
    // and return the completed configuration
    const updated = NativeClient.configureJSLayer(client.config)
    // Merges in any metadata set on the native side
    client.config.metaData = updated.metaData
    // The native client generates an ID if user ID is undefined
    client.config.user = updated.user
    // The native client generates a release stage based on debug info if undefined
    client.config.releaseStage = updated.releaseStage
    // Purely for cosmetic reasons
    client.config.endpoints = updated.endpoints
    // If notifyReleaseStages has been explicitly set on the native side
    client.config.notifyReleaseStages = updated.notifyReleaseStages
    // If apiKey is undefined, the native side searches possible locations
    client.config.apiKey = updated.apiKey
    // If unspecified, uses the native version
    client.config.appVersion = updated.appVersion
  },
  configSchema: {
    attachThreads: {
      defaultValue: () => true,
      message: 'should be true|false',
      validate: value => value === true || value === false
    }
  }
}

// Appends any native info available to the report
function installNativePayloadInfoCallback (client) {
  client.config.beforeSend.unshift(report => {
    return new Promise((resolve) => {
      NativeClient.nativePayloadInfo(report).then((info) => {
        report.threads = info.threads
        report.breadcrumbs = info.breadcrumbs
        report.app = info.app
        report.device = info.device
        report.metaData = info.metaData
        report.user = info.user
        report.context = info.context
        if (info.session) {
          report.session = new client.BugsnagSession()
          report.session.id = info.session.id
          report.session.startedAt = info.session.startedAt
          report.session._handled = info.session.handled
          report.session._unhandled = info.session.unhandled
        }
        resolve(true)
      })
    })
  })
}

// Replace client properties with proxies to synchronize with the native layer
// The top-level client proxy is client._proxy
function configureProxies (client) {
  const serialize = (name, value) => {
    return {name: name, value: serializeForNativeLayer(value, client._logger)}
  }
  const clientPropHandler = (name) => {
    return {
      set: (obj, prop, value) => {
        obj[prop] = value
        NativeClient.setClientProps(serialize(name, obj))
      },
      deleteProperty: (obj, prop) => {
        delete obj[prop]
        NativeClient.setClientProps(serialize(name, obj))
      }
    }
  }

  const clientHandler = {
    set: (obj, prop, value) => {
      switch (prop) {
        case 'app':
        case 'user':
        case 'device':
        case 'metaData':
          obj[prop] = new Proxy(value, clientPropHandler)
          NativeClient.setClientProps(serialize(prop, value))
          break
        case 'context':
          NativeClient.setClientProps({name: prop, value: value})
          obj[prop] = value
          break
        default:
          obj[prop] = value
      }
    },
    deleteProperty: (obj, prop) => {
      delete obj[prop]
      switch (prop) {
        case 'app':
        case 'user':
        case 'device':
        case 'metaData':
          NativeClient.setClientProps(serialize(prop, undefined))
          break
        case 'context':
          NativeClient.setClientProps({name: prop, value: undefined})
          break
        default:
          break
      }
    }
  }

  client._proxy = new Proxy(client._proxy || client, clientHandler)
  client.app = new Proxy(client.app || {}, clientPropHandler('app'))
  client.device = new Proxy(client.device || {}, clientPropHandler('device'))
  client.metaData = new Proxy(client.metaData || {}, clientPropHandler('metaData'))
  client.user = new Proxy(client.user || {}, clientPropHandler('user'))
}
