const { WebSocketServer } = require('ws')

function onError (x, error) {
  if (error.length > 0) console.error('error: ', error.toString())
}

module.exports = class WebSocket extends WebSocketServer {
  // 更多options: https://github.com/websockets/ws/blob/HEAD/doc/ws.md#new-websocketserveroptions-callback
  constructor (port, options = {}) {
    super({ ...options, port })

    this.connect = new Map()
    this.processFuncs = new Map()
    this.connectHistoryCount = 0

    this.onError = (...args) => onError.apply(this, args)

    this.on('connection', function (client) {
      this.onConnection(client)
      client.on('error', this.onError)
      client.on('message', this.onMessage(client))
      client.on('close', this.onClose(client))
    })
  }

  /** 绑定事件处理函数
   * @param {string} name 事件名称
   * @param {function} processFunc 函数接收两个参数(data,options)
   *
   * @returns {WebSocket}
   */
  use (name, processFunc = function () {}) {
    if (!name || !processFunc) throw new Error('need name and process')
    if (this.processFuncs.has(name)) {
      throw new Error(`name ${name} has been set`)
    }
    this.processFuncs.set(name, processFunc)
    return this
  }

  /** @private 客户端连接时触发，分配ID */
  onConnection (client) {
    this.connectHistoryCount++
    // 用数量作为ID，保证不会重复
    this.connect.set(this.connectHistoryCount, client)
    client.connectId = this.connectHistoryCount
  }

  /** @private 收到消息时触发，分配ID */
  onMessage (client) {
    const messageTrigger = this.messageTrigger.bind(this, client)

    return msg => {
      const { type = 'trigger', ...objs } = JSON.parse(msg.toString())

      switch (type) {
        case 'trigger':
          messageTrigger({ ...objs, type })
          break
      }
    }
  }

  /** @private 客户端关闭连接 */
  onClose (client) {
    return () => this.connect.delete(client.connectId)
  }

  /** @private 客户端消息触发事件 */
  async messageTrigger (client, { id, type, name, data, options }) {
    const callbackData = { type: `callback:${type}`, id }
    let result = null
    let statusCode = 404

    if (this.processFuncs.has(name)) {
      try {
        result = await this.processFuncs.get(name)(data, options)
        statusCode = 200
      } catch (e) {
        result = e.toString()
        statusCode = 500
      }
    }
    client.send(JSON.stringify({ ...callbackData, result, statusCode }))
  }
}
