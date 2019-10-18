const { describe, it, expect } = global

const plugin = require('../device')

const Client = require('@bugsnag/core/client')
const VALID_NOTIFIER = { name: 't', version: '0', url: 'http://' }

const navigator = { locale: 'en_GB', userAgent: 'testing browser 1.2.3' }

describe('plugin: device', () => {
  it('should add a beforeSend callback which captures device information', done => {
    const client = new Client({ apiKey: 'API_KEY_YEAH' }, undefined, VALID_NOTIFIER)
    const payloads = []
    client.use(plugin, navigator)

    expect(client._callbacks.onError.length).toBe(1)

    client._delivery(client => ({
      sendEvent: (payload, cb) => {
        payloads.push(payload)
        cb()
      }
    }))
    client.notify(new Error('noooo'), () => {}, () => {
      const ISO_8601 = /^\d{4}(-\d\d(-\d\d(T\d\d:\d\d(:\d\d)?(\.\d+)?(([+-]\d\d:\d\d)|Z)?)?)?)?$/i
      expect(payloads.length).toEqual(1)
      expect(payloads[0].events[0].device).toBeDefined()
      expect(payloads[0].events[0].device.time).toMatch(ISO_8601)
      expect(payloads[0].events[0].device.locale).toBe(navigator.browserLanguage)
      expect(payloads[0].events[0].device.userAgent).toBe(navigator.userAgent)
      done()
    })
  })
})
