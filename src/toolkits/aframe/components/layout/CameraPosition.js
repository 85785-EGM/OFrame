export default {
  dependencies: ['camera'],
  schema: { type: 'vec3' },

  update () {
    const position = this.data
    const camera = this.el.components.camera.camera
    camera.position.copy(position)
  }
}
