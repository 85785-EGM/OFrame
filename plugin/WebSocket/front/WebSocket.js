import { v4 as uuidv4 } from 'uuid'

function onopen (event) {
  if (typeof this.isOpen === 'function') this.isOpen()
  this.isOpen = true
}
function onclose (event) {
  if (typeof this.isOpen === 'function') this.isOpen()
  this.isOpen = false
}
function onerror (event) {}
function onmessage (event) {
  const { type = 'callback:trigger', ...msg } = JSON.parse(
    event.data.toString()
  )

  switch (type) {
    case 'callback:trigger':
      messageTrigger.call(this, msg)
      break
  }
}

function messageTrigger (msg) {
  const { resolve, reject } = this.callbacks.get(msg.id)
  switch (msg.statusCode) {
    case 200:
      resolve(msg.result)
      break
    case 404:
      reject('no handler')
      break
    case 500:
      reject(msg.result)
      break
  }
}

class WebSocket2 extends window.WebSocket {
  constructor (address, protocols) {
    super(address, protocols)

    this.isOpen = false
    this.callbacks = new Map()

    this.onopen = onopen.bind(this)
    this.onclose = onclose.bind(this)
    this.onerror = onerror.bind(this)
    this.onmessage = onmessage.bind(this)
  }

  /** 等待连接成功 */
  waitOpen () {
    return new Promise(resolve => {
      if (this.isOpen) resolve()
      else this.isOpen = resolve
    })
  }

  /** 触发服务器事件
   * @param {string} name 事件名称
   * @param {any} data 传递的数据
   * @param {object} options 传递的配置
   */
  trigger (name, data, options = {}) {
    const id = uuidv4()
    const sendData = JSON.stringify({ id, name, data, options })
    this.send(sendData)
    return new Promise((resolve, reject) => {
      this.callbacks.set(id, { resolve, reject })
    })
  }
}
