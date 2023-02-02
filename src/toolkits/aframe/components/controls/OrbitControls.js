import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { Vector3 } from 'three'

export default {
  dependencies: ['camera'],
  schema: {
    target: {
      default: '0 0 0',
      parse: value => new Vector3(...value.split(' ').map(f => parseFloat(f)))
    }
  },
  init () {
    const { target } = this.data
  },
  updated () {
    console.log('asdf')
  }
}
