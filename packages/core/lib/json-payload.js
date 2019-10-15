const jsonStringify = require('@bugsnag/safe-json-stringify')
const REPORT_FILTER_PATHS = [
  'events.[].metaData',
  'events.[].breadcrumbs.metaData',
  'events.[].request'
]
module.exports.event = (event, filterKeys) => {
  let payload = jsonStringify(event, null, null, { filterPaths: REPORT_FILTER_PATHS, filterKeys })
  if (payload.length > 10e5) {
    delete event.events[0]._metaData
    event.events[0].metaData = {
      notifier: {
        warning:
`WARNING!
Serialized payload was ${payload.length / 10e5}MB (limit = 1MB)
metadata was removed`
      }
    }
    payload = jsonStringify(event, null, null, { filterPaths: REPORT_FILTER_PATHS, filterKeys })
    if (payload.length > 10e5) throw new Error('payload exceeded 1MB limit')
  }
  return payload
}

module.exports.session = (session, filterKeys) => {
  const payload = jsonStringify(session, null, null)
  if (payload.length > 10e5) throw new Error('payload exceeded 1MB limit')
  return payload
}
