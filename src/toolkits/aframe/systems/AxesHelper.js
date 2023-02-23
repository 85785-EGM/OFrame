import { AxesHelper } from 'three'
export default {
  dependencies: [],
  schema: {
    size: { type: 'number', default: 10 },
    visible: { type: 'boolean', default: false }
  },
  init () {
    const axes = new AxesHelper(this.data.size)
    axes.visible = false
    this.el.setObject3D('axes', axes)
  },
  update () {
    this.el.getObject3D('axes').visible = this.data.visible
  }
}
