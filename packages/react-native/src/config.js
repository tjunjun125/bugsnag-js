/* global __DEV__ */

const { schema } = require('@bugsnag/core/config')
const { map } = require('@bugsnag/core/lib/es-utils')

module.exports = {
  logger: {
    ...schema.logger,
    defaultValue: () => getPrefixedConsole()
  },
  releaseStage: {
    ...schema.releaseStage,
    defaultValue: () => __DEV__ ? 'development' : 'production'
  }
}

const getPrefixedConsole = () => {
  const logger = {}
  const consoleLog = console['log']
  map([ 'debug', 'info', 'warn', 'error' ], (method) => {
    const consoleMethod = console[method]
    logger[method] = typeof consoleMethod === 'function'
      ? consoleMethod.bind(console, '[bugsnag]')
      : consoleLog.bind(console, '[bugsnag]')
  })
  return logger
}
