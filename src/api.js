import logger from 'loglevel'
import feathers from 'feathers-client'
import hooks from 'feathers-hooks'
import io from 'socket.io-client'
import config from 'config'

export default function weacast () {
  let api = feathers()
  // Setup log level
  if (config.logs && config.logs.level) {
    logger.setLevel(config.logs.level, false)
  } else {
    logger.setLevel('info')
  }
  api.configure(hooks())
  if (config.transport === 'http') {
    api.configure(feathers.rest(window.location.origin).fetch(window.fetch.bind(window)))
  } else {
    let socket = io(window.location.origin, {
      transports: ['websocket'],
      path: config.apiPath + 'ws'
    })
    api.configure(feathers.socketio(socket))
  }
  api.configure(feathers.authentication({
    storage: window.localStorage,
    path: config.apiPath + '/authentication'
  }))

  // This avoid managing the API path before each service name
  api.getService = function (path) {
    return api.service(config.apiPath + '/' + path)
  }

  return api
}
