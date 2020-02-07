import Client from '@bugsnag/core/client'
import plugin from '../'

// @ts-ignore
import { AppState } from 'react-native'

jest.mock('react-native', () => ({
  AppState: {
    addEventListener: jest.fn()
  }
}))

const MockAddEventListener = AppState.addEventListener as jest.MockedFunction<typeof AppState.addEventListener>

describe('plugin: react native app state breadcrumbs', () => {
  beforeEach(() => {
    MockAddEventListener.mockReset()
  })

  it('should create a breadcrumb when the AppState#change event happens', () => {
    const client = new Client({ apiKey: 'aaaa-aaaa-aaaa-aaaa' })
    client.use(plugin)

    expect(MockAddEventListener).toHaveBeenCalledWith('change', expect.any(Function))
    const _cb = MockAddEventListener.mock.calls[0][1]

    expect(client._breadcrumbs.length).toBe(0)

    _cb('background')
    expect(client._breadcrumbs.length).toBe(1)
    expect(client._breadcrumbs[0].type).toBe('state')
    expect(client._breadcrumbs[0].message).toBe('App state changed')
    expect(client._breadcrumbs[0].metadata).toEqual({ state: 'background' })

    _cb('active')
    expect(client._breadcrumbs.length).toBe(2)
    expect(client._breadcrumbs[1].type).toBe('state')
    expect(client._breadcrumbs[1].message).toBe('App state changed')
    expect(client._breadcrumbs[1].metadata).toEqual({ state: 'active' })
  })

  it('should not be enabled when enabledBreadcrumbTypes=null', () => {
    // @ts-ignore
    const client = new Client({ apiKey: 'aaaa-aaaa-aaaa-aaaa', enabledBreadcrumbTypes: null })
    client.use(plugin)

    expect(AppState.addEventListener).not.toHaveBeenCalled()
  })

  it('should not be enabled when enabledBreadcrumbTypes=[]', () => {
    const client = new Client({ apiKey: 'aaaa-aaaa-aaaa-aaaa', enabledBreadcrumbTypes: [] })
    client.use(plugin)

    expect(AppState.addEventListener).not.toHaveBeenCalled()
  })

  it('should be enabled when enabledBreadcrumbTypes=["state"]', () => {
    const client = new Client({ apiKey: 'aaaa-aaaa-aaaa-aaaa', enabledBreadcrumbTypes: ['state'] })
    client.use(plugin)

    expect(AppState.addEventListener).toHaveBeenCalledWith('change', expect.any(Function))
  })
})