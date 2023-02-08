# 介绍
封装了WebSocket，提供前端插件、后端(nodejs)插件

# 使用方法（前端）
```JavaScript
// 连接服务器
const ws = new WebSocket2('ws://localhost:8080')

;(async function () {
  // 等待连接成功
  await ws.waitOpen()
  // 触发服务器事件
  console.log(await ws.trigger('console.log', '你好'))
})()
```

# 使用方法（后端nodejs）
```JavaScript
const WebSocketServer = require('./WebSocket')
// 监听8080端口
const server = new WebSocketServer(8080)
// 绑定事件，处理后return。支持异步。
server.use('console.log', function (data, options) {
  return '123'
})
```