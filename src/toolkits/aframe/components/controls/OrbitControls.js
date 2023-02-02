import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

export default {
  dependencies: ['camera'],
  schema: {
    target: { type: 'vec3' }
  },

  init () {
    const camera = this.el.components.camera.camera
    const renderer = this.el.sceneEl.renderer
    this.controls = new OrbitControls(camera, renderer.domElement)
  },

  update () {
    this.controls.target.copy(this.data.target)
  },

  tock () {
    this.controls.update()
  }
}
