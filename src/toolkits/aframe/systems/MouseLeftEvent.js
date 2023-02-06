import { Vector2, Raycaster, Object3D } from 'three'

const _pointer = new Vector2()
const MOUSE_LEFT = 0
const raycaster = new Raycaster()

/**
 * 连续快速两次点击，事件触发顺序是
 * mousedown
 * mouseup
 * click
 * mousedown
 * mouseup
 * click
 * doubleClick
 */

function findEl (object3D = new Object3D(), depth = 0) {
  if (depth >= 5) return
  if (!object3D?.parent) return
  if (object3D?.el) return object3D.el
  else return findEl(object3D?.parent, depth++)
}

function notify (eventname = 'mousedown', event, target = {}) {
  Object.values(target.el.components).forEach(component => {
    if (component.events?.[eventname]) {
      component.events[eventname](event, target)
    }
  })
}

function clickCheck (event, returnData = this.state.judgeClick) {
  const { doubleClickInterval } = this.data
  const time = new Date().getTime()

  const { lastObject, lastClickTime, lastClickObject } = returnData

  if (this.state.type === 'mouseup') {
    // 如果down和up在同一个object，触发click
    if (lastObject === this.state.target.object) {
      // 本次up时间和上次click之间间隔
      const interval = time - lastClickTime

      if (
        // 如果触发过click
        lastClickTime !== -1 &&
        // 两次触发的object是否相同，时间间隔是否符合
        lastClickObject === this.state.target.object &&
        interval < doubleClickInterval
      ) {
        returnData.lastClickTime = -1
        returnData.lastClickObject = null
        notify('click', event, this.state.target)
        notify('doubleClick', event, this.state.target)
      } else {
        returnData.lastClickTime = time
        returnData.lastClickObject = this.state.target.object
        notify('click', event, this.state.target)
      }
    }
  }

  returnData.lastObject = this.state.target.object
  return returnData
}

function mousedown (event) {
  this.state.camera = this.el.camera
  this.state.type = 'mousedown'

  this.downPointer.x = (event.clientX / window.innerWidth) * 2 - 1
  this.downPointer.y = -(event.clientY / window.innerHeight) * 2 + 1
  raycaster.setFromCamera(this.downPointer, this.state.camera)

  this.state.target = raycaster
    .intersectObjects(this.el.object3D.children)
    .find(t => {
      t.el = findEl(t.object)
      return t.el
    })

  if (!this.state.target) return

  notify('mousedown', event, this.state.target)
  this.clickCheck(event)
}

function mousemove (event) {
  // _pointer.x = (event.clientX / window.innerWidth) * 2 - 1
  // _pointer.y = -(event.clientY / window.innerHeight) * 2 + 1
  // raycaster.setFromCamera(this._pointer, this.state.camera)
}

function mouseup (event) {
  this.state.type = 'mouseup'

  this.upPointer.x = (event.clientX / window.innerWidth) * 2 - 1
  this.upPointer.y = -(event.clientY / window.innerHeight) * 2 + 1
  raycaster.setFromCamera(this.upPointer, this.state.camera)

  this.state.target = raycaster
    .intersectObjects(this.el.object3D.children)
    .find(t => {
      t.el = findEl(t.object)
      return t.el
    })

  if (!this.state.target) return

  notify('mouseup', event, this.state.target)
  this.clickCheck(event)
}

export default {
  dependencies: ['camera'],
  schema: {
    doubleClickInterval: { type: 'number', default: 300 },
    enabledMousemove: { type: 'boolean', default: false }
  },

  downPointer: new Vector2(),
  upPointer: new Vector2(),
  state: {
    camera: null, // 当前的相机
    target: null, // raycaster检测到的最近的目标
    object3D: null, // raycaster监测到的object3D
    judgeClick: {} // clickCheck的返回值
  },

  init () {
    const canvas = this.el.canvas
    this.clickCheck = clickCheck.bind(this)
    this.mousedown = this.filterEventButton.bind(this, mousedown.bind(this))
    this.mousemove = this.filterEventButton.bind(this, mousemove.bind(this))
    this.mouseup = this.filterEventButton.bind(this, mouseup.bind(this))
    this.dispose()
    canvas.addEventListener('mousedown', this.mousedown)
    if (this.data.enabledMousemove) {
      canvas.addEventListener('mousemove', this.mousemove)
    }
    canvas.addEventListener('mouseup', this.mouseup)
  },

  dispose () {
    const canvas = this.el.canvas
    canvas.removeEventListener('mousedown', this.mousedown)
    canvas.removeEventListener('mousemove', this.mousemove)
    canvas.removeEventListener('mouseup', this.mouseup)
  },

  filterEventButton (func, event) {
    if (event.button === MOUSE_LEFT) func(event)
  }
}
