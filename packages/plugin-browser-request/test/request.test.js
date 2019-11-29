const { describe, it, expect } = global

const plugin = require('../')

const Client = require('@bugsnag/core/client')

const window = { location: { href: 'http://xyz.abc/foo/bar.html' } }

describe('plugin: request', () => {
  it('sets event.request to window.location.href', () => {
    const client = new Client({ apiKey: 'API_KEY_YEAH' })
    const payloads = []
    client.use(plugin, window)

    client.delivery(client => ({ sendEvent: (payload) => payloads.push(payload) }))
    client.notify(new Error('noooo'))

    expect(payloads.length).toEqual(1)
    expect(payloads[0].events[0].request).toEqual({ url: window.location.href })
  })

  it('sets doesn’t overwrite an existing request', () => {
    const client = new Client({ apiKey: 'API_KEY_YEAH' })
    const payloads = []
    client.use(plugin, window)

    client.request = { url: 'foobar' }

    client.delivery(client => ({ sendEvent: (payload) => payloads.push(payload) }))
    client.notify(new Error('noooo'))

    expect(payloads.length).toEqual(1)
    expect(payloads[0].events[0].request).toEqual({ url: 'foobar' })
  })
})
