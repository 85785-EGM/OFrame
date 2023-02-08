const WebSocketServer = require('./WebSocket')

const server = new WebSocketServer(8080)
server.use('console.log', function (data, options) {
  return '123'
})
