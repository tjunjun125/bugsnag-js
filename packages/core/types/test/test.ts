import * as BugsnagCore from '../..'
import "jasmine"

describe('Type definitions', () => {
  it('has all the classes matching the types available at runtime', () => {
    expect(BugsnagCore.Client).toBeDefined()
    expect(BugsnagCore.Breadcrumb).toBeDefined()
    expect(BugsnagCore.Event).toBeDefined()
    expect(BugsnagCore.Session).toBeDefined()
  })

  it('works for reporting errors', done => {
    const client = createClient({ apiKey: 'API_KEY' })
    client.notify(new Error('uh oh'), (event) => {
      expect(event.apiKey).toBe(undefined)
      expect(event.context).toBe(undefined)
      expect(event.errors[0].message).toBe('uh oh')
      expect(event.errors[0].stacktrace.length > 0).toBe(true)
      event.addMetadata('abc', { def: 'ghi' })
      event.addMetadata('jkl', 'mno', 'pqr')
      event.clearMetadata('jkl')
      const val: any = event.getMetadata('jkl')
    }, (err, event) => {
      expect(err).toBe(undefined)
      done()
    })
  })

  it('works for reporting sessions', () => {
    const client = createClient({ apiKey: 'API_KEY' })
    const sessionClient = client.startSession()
    sessionClient.notify(new Error('oh'))
    client.pauseSession()
    client.resumeSession()
  })

  it('works for leaving breadcrumbs', () => {
    const client = createClient({ apiKey: 'API_KEY' })
    client.leaveBreadcrumb('testing 123')
    expect((client as any)._breadcrumbs.length).toBe(1)
    expect((client as any)._breadcrumbs[0].message).toBe('testing 123')
  })

  it('works adding and removing onError callbacks', () => {
    const client = createClient({ apiKey: 'API_KEY' })
    client.addOnError(() => {})
    client.removeOnError(() => {})
  })

  it('works adding and removing onSession callbacks', () => {
    const client = createClient({ apiKey: 'API_KEY' })
    client.addOnSession(() => {})
    client.removeOnSession(() => {})
  })

  it('works adding and removing onBreadcrumb callbacks', () => {
    const client = createClient({ apiKey: 'API_KEY' })
    client.addOnBreadcrumb(() => {})
    client.removeOnBreadcrumb(() => {})
  })

  it('works manipulating metadata on client', () => {
    const client = createClient({ apiKey: 'API_KEY' })
    client.addMetadata('abc', { def: 'ghi' })
    client.addMetadata('jkl', 'mno', 'pqr')
    client.clearMetadata('jkl')
    const val: any = client.getMetadata('jkl')
    expect(client.getMetadata('abc', 'def')).toBe('ghi')
  })

  it('works setting context', () => {
    const client = createClient({ apiKey: 'API_KEY' })
    client.setContext('foo')
    expect(client.getContext()).toBe('foo')
  })

  it('works setting user', () => {
    const client = createClient({ apiKey: 'API_KEY' })
    client.setUser('123', 'Ben', 'ben.gourley@bugsnag.com')
    expect(client.getUser()).toEqual({ id: '123', name: 'Ben', email: 'ben.gourley@bugsnag.com' })
    client.clearUser()
    expect(client.getUser()).toEqual({})
  })
})

// the client's constructor isn't public in TS so this drops down to JS to create one for the tests
function createClient (opts: BugsnagCore.IConfig): BugsnagCore.Client {
  const c = new (BugsnagCore.Client as any)(opts, undefined, { name: 'Type Tests', version: 'nope', url: 'https://github.com/bugsnag/bugsnag-js' })
  c._delivery(() => ({
    sendSession: (p: any, cb: () => void) => { cb() },
    sendEvent: (p: any, cb: () => void) => { cb() }
  }))
  c._sessionDelegate({ startSession: () => c, pauseSession: () => {}, resumeSession: () => {} })
  return (c as BugsnagCore.Client)
}
