/* global describe, expect, it */

const proxyquire = require('proxyquire').noCallThru().noPreserveCache()
const Client = require('@bugsnag/core/client')

const VALID_NOTIFIER = { name: 't', version: '0', url: 'http://' }

describe('@bugsnag/plugin-react-native-native-client', () => {
  it('should throw if native module is not linked', (done) => {
    const NativeClient = proxyquire('../src/native-client', {
      'react-native': { NativeModules: {} }
    })
    const client = new Client(VALID_NOTIFIER)
    client.setOptions({ apiKey: 'API_KEY_YEAH' })
    client.configure()
    try {
      client.use(NativeClient)
    } catch (e) {
      expect(e.message).toEqual('cannot find native BugsnagReactNative module')
      done()
    }
  })

  it('should update NativeClient with changes to client.app', done => {
    const changes = []
    const NativeClient = proxyquire('../src/native-client', {
      'react-native': {
        NativeModules: {
          BugsnagReactNative: {
            setClientProps: (change) => { changes.push(change) },
            configureJSLayer: (config) => config
          }
        }
      }
    })
    const client = new Client(VALID_NOTIFIER)
    client.setOptions({ apiKey: 'API_KEY_YEAH' })
    client.configure()
    client.use(NativeClient)
    client.app.foo = 'something'
    expect(changes.length).toBe(1)
    expect(Object.keys(changes[0]).length).toBe(2)
    expect(changes[0].name).toEqual('app')
    expect(Object.keys(changes[0].value).length).toBe(1)
    expect(changes[0].value.foo).toEqual({type: 'string', value: 'something'})

    const proxy = client._proxy
    delete proxy.app
    expect(changes.length).toBe(2)
    expect(changes[1]).toEqual({name: 'app', value: {}})

    proxy.app = {bagel: 'everything'}
    expect(changes.length).toBe(3)
    expect(changes[2]).toEqual({name: 'app', value: {bagel: {type: 'string', value: 'everything'}}})
    done()
  })

  it('should update NativeClient with changes to client.device', done => {
    const changes = []
    const NativeClient = proxyquire('../src/native-client', {
      'react-native': {
        NativeModules: {
          BugsnagReactNative: {
            setClientProps: (change) => { changes.push(change) },
            configureJSLayer: (config) => config
          }
        }
      }
    })
    const client = new Client(VALID_NOTIFIER)
    client.setOptions({ apiKey: 'API_KEY_YEAH' })
    client.configure()
    client.use(NativeClient)
    client.device.foo = 'something'
    expect(changes.length).toBe(1)
    expect(Object.keys(changes[0]).length).toBe(2)
    expect(changes[0].name).toEqual('device')
    expect(Object.keys(changes[0].value).length).toBe(1)
    expect(changes[0].value.foo).toEqual({type: 'string', value: 'something'})

    const proxy = client._proxy
    delete proxy.device
    expect(changes.length).toBe(2)
    expect(changes[1]).toEqual({name: 'device', value: {}})

    proxy.device = {bagel: 'everything'}
    expect(changes.length).toBe(3)
    expect(changes[2]).toEqual({name: 'device', value: {bagel: {type: 'string', value: 'everything'}}})
    done()
  })

  it('should update NativeClient with changes to client.metaData', done => {
    const changes = []
    const NativeClient = proxyquire('../src/native-client', {
      'react-native': {
        NativeModules: {
          BugsnagReactNative: {
            setClientProps: (change) => { changes.push(change) },
            configureJSLayer: (config) => config
          }
        }
      }
    })
    const client = new Client(VALID_NOTIFIER)
    client.setOptions({ apiKey: 'API_KEY_YEAH' })
    client.configure()
    client.use(NativeClient)
    client.metaData.account = {no: 1232412}
    client.metaData.runtime = {version: '40.6.1'}
    delete client.metaData.runtime
    expect(changes.length).toBe(3)
    expect(Object.keys(changes[0]).length).toBe(2)
    expect(changes[0].name).toEqual('metaData')
    expect(Object.keys(changes[0].value).length).toBe(1)
    expect(changes[0].value.account).toEqual({
      type: 'map', value: {no: {type: 'number', value: 1232412}}
    })
    expect(changes[1].name).toEqual('metaData')
    expect(Object.keys(changes[1].value).length).toBe(2)
    expect(changes[1].value).toEqual({
      account: {type: 'map', value: {no: {type: 'number', value: 1232412}}},
      runtime: {type: 'map', value: {version: {type: 'string', value: '40.6.1'}}}
    })
    expect(changes[2].name).toEqual('metaData')
    expect(Object.keys(changes[2].value).length).toBe(1)
    expect(changes[2].value).toEqual({
      account: {type: 'map', value: {no: {type: 'number', value: 1232412}}}
    })

    const proxy = client._proxy
    delete proxy.metaData
    expect(changes.length).toBe(4)
    expect(changes[3]).toEqual({name: 'metaData', value: {}})

    proxy.metaData = {bagel: 'everything'}
    expect(changes.length).toBe(5)
    expect(changes[4]).toEqual({name: 'metaData', value: {bagel: {type: 'string', value: 'everything'}}})
    done()
  })

  it('should update NativeClient with changes to client.user', done => {
    const changes = []
    const NativeClient = proxyquire('../src/native-client', {
      'react-native': {
        NativeModules: {
          BugsnagReactNative: {
            setClientProps: (change) => { changes.push(change) },
            configureJSLayer: (config) => config
          }
        }
      }
    })
    const client = new Client(VALID_NOTIFIER)
    client.setOptions({ apiKey: 'API_KEY_YEAH' })
    client.configure()
    client.use(NativeClient)
    client.user.email = 'something@example.com'
    expect(changes.length).toBe(1)
    expect(Object.keys(changes[0]).length).toBe(2)
    expect(changes[0].name).toEqual('user')
    expect(Object.keys(changes[0].value).length).toBe(1)
    expect(changes[0].value.email).toEqual({type: 'string', value: 'something@example.com'})

    const proxy = client._proxy
    delete proxy.user
    expect(changes.length).toBe(2)
    expect(changes[1]).toEqual({name: 'user', value: {}})

    proxy.user = {account: 124342}
    expect(changes.length).toBe(3)
    expect(changes[2]).toEqual({name: 'user', value: {account: {type: 'number', value: 124342}}})
    done()
  })

  it('should update NativeClient with changes to client.context', done => {
    const changes = []
    const NativeClient = proxyquire('../src/native-client', {
      'react-native': {
        NativeModules: {
          BugsnagReactNative: {
            setClientProps: (change) => { changes.push(change) },
            configureJSLayer: (config) => config
          }
        }
      }
    })

    var client = new Client(VALID_NOTIFIER)
    client.setOptions({ apiKey: 'API_KEY_YEAH' })
    client.configure()
    client = client.use(NativeClient)._proxy
    client.context = 'Launch Screen'
    expect(client.context).toEqual('Launch Screen')
    client.context = 'Pop-up Menu'
    expect(client.context).toEqual('Pop-up Menu')
    delete client.context
    expect(client.context).toEqual(undefined)
    expect(changes.length).toBe(3)
    expect(changes[0]).toEqual({name: 'context', value: 'Launch Screen'})
    expect(changes[1]).toEqual({name: 'context', value: 'Pop-up Menu'})
    expect(changes[2]).toEqual({name: 'context', value: undefined})

    done()
  })

  it('should allow changing arbitrary properties on client without notifying NativeClient', done => {
    const changes = []
    const NativeClient = proxyquire('../src/native-client', {
      'react-native': {
        NativeModules: {
          BugsnagReactNative: {
            setClientProps: (change) => { changes.push(change) },
            configureJSLayer: (config) => config
          }
        }
      }
    })

    var client = new Client(VALID_NOTIFIER)
    client.setOptions({ apiKey: 'API_KEY_YEAH' })
    client.configure()
    client = client.use(NativeClient)._proxy
    client.somenonsense = 'foo'
    expect(changes.length).toBe(0)
    expect(client.somenonsense).toEqual('foo')

    delete client.somenonsense
    expect(changes.length).toBe(0)
    expect(client.somenonsense).toEqual(undefined)

    done()
  })

  it('should proxy startSession to the NativeClient', done => {
    var sessionsStarted = 0
    const NativeClient = proxyquire('../src/native-client', {
      'react-native': {
        NativeModules: {
          BugsnagReactNative: {
            configureJSLayer: (config) => config,
            startSession: () => { sessionsStarted += 1 }
          }
        }
      }
    })
    const client = new Client(VALID_NOTIFIER)
    client.setOptions({ apiKey: 'API_KEY_YEAH' })
    client.configure()
    client.use(NativeClient)
    client.startSession()
    expect(sessionsStarted).toBe(1)
    client.startSession()
    expect(sessionsStarted).toBe(2)
    done()
  })

  it('should proxy stopSession to the NativeClient', done => {
    var sessionsStopped = 0
    const NativeClient = proxyquire('../src/native-client', {
      'react-native': {
        NativeModules: {
          BugsnagReactNative: {
            configureJSLayer: (config) => config,
            stopSession: () => { sessionsStopped += 1 }
          }
        }
      }
    })
    const client = new Client(VALID_NOTIFIER)
    client.setOptions({ apiKey: 'API_KEY_YEAH' })
    client.configure()
    client.use(NativeClient)
    client.stopSession()
    expect(sessionsStopped).toBe(1)
    client.stopSession()
    expect(sessionsStopped).toBe(2)
    done()
  })

  it('should proxy resumeSession to the NativeClient', done => {
    var sessionsResumed = 0
    const NativeClient = proxyquire('../src/native-client', {
      'react-native': {
        NativeModules: {
          BugsnagReactNative: {
            configureJSLayer: (config) => config,
            resumeSession: () => { sessionsResumed += 1 }
          }
        }
      }
    })
    const client = new Client(VALID_NOTIFIER)
    client.setOptions({ apiKey: 'API_KEY_YEAH' })
    client.configure()
    client.use(NativeClient)
    client.resumeSession()
    expect(sessionsResumed).toBe(1)
    client.resumeSession()
    expect(sessionsResumed).toBe(2)
    done()
  })

  it('should proxy leaveBreadcrumb to the NativeClient', done => {
    const crumbs = []
    const NativeClient = proxyquire('../src/native-client', {
      'react-native': {
        NativeModules: {
          BugsnagReactNative: {
            configureJSLayer: (config) => config,
            leaveBreadcrumb: (crumb) => crumbs.push(crumb)
          }
        }
      }
    })
    const client = new Client(VALID_NOTIFIER)
    client.setOptions({ apiKey: 'API_KEY_YEAH' })
    client.configure()
    client.use(NativeClient)
    client.leaveBreadcrumb('Init', {foo: 'bar'})
    client.leaveBreadcrumb('Teardown', null, 'state')
    expect(crumbs.length).toBe(2)
    expect(crumbs[0].name).toEqual('Init')
    expect(crumbs[0].metadata).toEqual({foo: {type: 'string', value: 'bar'}})
    expect(crumbs[0].type).toEqual(undefined)
    expect(crumbs[0].timestamp).toEqual(undefined)
    expect(crumbs[1].name).toEqual('Teardown')
    expect(crumbs[1].metadata).toEqual({})
    expect(crumbs[1].type).toEqual('state')
    expect(crumbs[1].timestamp).toEqual(undefined)
    done()
  })

  it('delivers reports via the NativeClient', done => {
    const reports = []
    const NativeClient = proxyquire('../src/native-client', {
      'react-native': {
        NativeModules: {
          BugsnagReactNative: {
            configureJSLayer: (config) => config,
            nativePayloadInfo: (report) => new Promise(resolve => setTimeout(() => resolve(report), 1)),
            leaveBreadcrumb: (crumb) => {},
            deliver: (report) => {
              reports.push(report)
              return new Promise(resolve => setTimeout(() => resolve(), 1))
            }
          }
        }
      }
    })
    const client = new Client(VALID_NOTIFIER)
    client.setOptions({ apiKey: 'API_KEY_YEAH' })
    client.configure()
    client.use(NativeClient)
    client.notify(new TypeError('Oh dear'), null, () => {
      expect(reports.length).toBe(1)
      done()
    })
  })

  it('updates reports with info from native layer', done => {
    const reports = []
    const NativeClient = proxyquire('../src/native-client', {
      'react-native': {
        NativeModules: {
          BugsnagReactNative: {
            configureJSLayer: (config) => config,
            leaveBreadcrumb: (crumb) => {},
            deliver: (report) => {
              reports.push(report)
              return new Promise(resolve => setTimeout(() => resolve(), 1))
            },
            nativePayloadInfo: (report) => {
              const update = {
                app: { version: '3.1', releaseStage: 'prod' },
                device: { os: 'peaOS' },
                user: { name: 'Egg', email: 'mcmuffin@example.com' },
                context: 'Pop-up Menu',
                session: { id: '16262', startedAt: 'sometime', handled: 2, unhandled: 0 }
              }
              return new Promise(resolve => setTimeout(() => resolve(update), 1))
            }
          }
        }
      }
    })
    const client = new Client(VALID_NOTIFIER)
    client.setOptions({ apiKey: 'API_KEY_YEAH' })
    client.configure()
    client.use(NativeClient)
    client.notify(new TypeError('Oh dear'), null, () => {
      const report = reports[0]
      expect(reports.length).toBe(1)
      expect(report.app).toEqual({ version: '3.1', releaseStage: 'prod' })
      done()
    })
  })

  it('updates config with changes from the NativeClient', done => {
    const NativeClient = proxyquire('../src/native-client', {
      'react-native': {
        NativeModules: {
          BugsnagReactNative: {
            configureJSLayer: (config) => {
              return {
                releaseStage: 'beta',
                appVersion: '2',
                apiKey: config.apiKey
              }
            }
          }
        }
      }
    })
    const client = new Client(VALID_NOTIFIER)
    client.setOptions({ apiKey: 'API_KEY_YEAH' })
    client.configure()
    client.use(NativeClient)
    expect(client.config.releaseStage).toEqual('beta')
    expect(client.config.appVersion).toEqual('2')
    done()
  })

  it('chains proxies if needed', done => {
    const NativeClient = proxyquire('../src/native-client', {
      'react-native': {
        NativeModules: {
          BugsnagReactNative: {
            setClientProps: (change) => { },
            configureJSLayer: (config) => config
          }
        }
      }
    })
    const client = new Client(VALID_NOTIFIER)
    client.setOptions({ apiKey: 'API_KEY_YEAH' })
    client.configure()
    var called = false
    client._proxy = new Proxy(client, {
      set: (obj, prop, value) => {
        obj[prop] = value
        called = true
      }
    })
    client.use(NativeClient)
    client._proxy.app = { version: '4' }
    expect(called).toBeTruthy()

    done()
  })
})
