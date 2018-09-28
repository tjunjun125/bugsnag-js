const createReportFromErr = require('@bugsnag/core/lib/report-from-error')

module.exports = {
  init: (client) => {
    if (ErrorUtils) {
      const prevHandler = ErrorUtils.getGlobalHandler()
      const handler = (error, isFatal) => {
        client.notify(createReportFromErr(error, {
          severity: 'error',
          unhandled: true,
          severityReason: { type: 'unhandledException' }
        }), {}, (e, report) => {
          if (e) return client._logger('Failed to send report to Bugsnag')
          if (typeof prevHandler === 'function') {
            prevHandler(error, isFatal)
          }
        })
      }

      ErrorUtils.setGlobalHandler(handler)
    }
  }
}
