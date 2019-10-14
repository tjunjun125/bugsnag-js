const createReportFromErr = require('@bugsnag/core/lib/report-from-error')

let _handler
module.exports = {
  init: client => {
    if (!client.config.autoNotify) return
    _handler = err => {
      client.notify(createReportFromErr(err, {
        severity: 'error',
        unhandled: true,
        severityReason: { type: 'unhandledPromiseRejection' }
      }), {}, (e, report) => {
        if (e) client.__logger.error('Failed to send report to Bugsnag')
        client.config.onUnhandledRejection(err, report, client.__logger)
      })
    }
    process.on('unhandledRejection', _handler)
  },
  destroy: () => {
    process.removeListener('unhandledRejection', _handler)
  }
}
