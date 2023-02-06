const { WebSocketServer } = require('ws')

function onError (x, error) {
  if (error.length > 0) console.error('error: ', error.toString())
}

module.exports = class WebSocket extends WebSocketServer {
  // 更多options: https://github.com/websockets/ws/blob/HEAD/doc/ws.md#new-websocketserveroptions-callback
  constructor (port, options = {}) {
    super({ ...options, port })

    this.connect = new Map()
    this.connectHistoryCount = 0

    this.onError = (...args) => onError.apply(this, args)

    this.on('connection', function (client) {
      this.onConnection(client)
      client.on('error', this.onError)
      client.on('message', this.onMessage(client))
      client.on('close', this.onClose(client))
    })
  }

  use () {}

  onConnection (client) {
    this.connectHistoryCount++
    // 用数量作为ID，保证不会重复
    this.connect.set(this.connectHistoryCount, client)
  }

  onMessage (client) {
    return msg => {
      console.log(msg.toString())
    }
  }

  onClose (client) {
    return () => {}
  }
}
