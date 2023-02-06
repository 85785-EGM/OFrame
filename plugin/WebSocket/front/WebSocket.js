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
function onmessage (event) {}

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

  waitOpen () {
    return new Promise(resolve => {
      if (this.isOpen) resolve()
      else this.isOpen = resolve
    })
  }

  trigger (name, data, option = {}) {
    const id = uuidv4()
    const sendData = JSON.stringify({ id, name, data, option })
    this.send(sendData)
    return new Promise(resolve => {
      this.callbacks.set(id, resolve)
    })
  }
}

const ws = new WebSocket2('ws://localhost:8080', 'json')

;(async function () {
  await ws.waitOpen()
  console.log(await ws.trigger('console.log', '你好'))
})()
