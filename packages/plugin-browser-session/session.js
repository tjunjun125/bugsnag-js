const { reduce, isArray, includes } = require('@bugsnag/core/lib/es-utils')
const Session = require('@bugsnag/core/session')

module.exports = {
  init: client => client._sessionDelegate(sessionDelegate)
}

const sessionDelegate = {
  startSession: (client, session) => {
    const sessionClient = client

    sessionClient._session = new Session()
    sessionClient._pausedSession = null

    const releaseStage = sessionClient._config.releaseStage

    // exit early if the reports should not be sent on the current releaseStage
    if (isArray(sessionClient._config.enabledReleaseStages) && !includes(sessionClient._config.enabledReleaseStages, releaseStage)) {
      sessionClient.__logger.warn(`Session not sent due to releaseStage/enabledReleaseStages configuration`)
      return sessionClient
    }

    if (!sessionClient._config.endpoints.sessions) {
      sessionClient.__logger.warn(`Session not sent due to missing endpoints.sessions configuration`)
      return sessionClient
    }

    const payload = {
      notifier: sessionClient._notifier,
      device: {},
      app: {},
      sessions: [
        {
          id: sessionClient._session.id,
          startedAt: sessionClient._session.startedAt,
          user: sessionClient.user
        }
      ]
    }
    client._addAppData(payload)
    const cbs = client._callbacks.onSessionPayload.slice(0)
    sessionClient.__delivery.sendSession(
      reduce(cbs, (accum, cb) => {
        cb(accum)
        return accum
      }, payload)
    )

    return sessionClient
  },
  pauseSession: client => {
    client._pausedSession = client._session
  },
  resumeSession: client => {
    client._session = client._pausedSession
    client._pausedSession = null
  }
}
