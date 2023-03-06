import Octree, {
  fillBoxWithTriangle,
  getLeafNode
} from '../../../../../plugin/Octree/Octree'
import { Mesh, Box3Helper, Color, Object3D } from 'three'

export default {
  schema: {
    needFill: { type: 'boolean', default: false },
    maximum: { type: 'number', default: -1 },
    depth: { type: 'number', default: 10 },
    visible: { type: 'boolean', default: true }
  },

  update () {
    this.startWork()
    const { needFill, maximum, depth, visible } = this.data

    const mesh: Mesh = this.el.getObject3D('mesh')
    const geometry = mesh.geometry.toNonIndexed()

    const octree: Octree = new Octree(geometry.getAttribute('position'))
    octree.maximum = maximum
    octree.depth = depth
    octree.init()

    this.leafs = needFill
      ? fillBoxWithTriangle(octree, true)
      : getLeafNode(octree.rootNode)

    for (const leaf of this.leafs) {
      leaf.computeBoundingSphere()
    }

    if (visible) {
      const object = new Object3D()
      const helpers = this.leafs.map(n => {
        return new Box3Helper(n.box, new Color('#49c2a8'))
      })
      object.add(...helpers)
      this.el.setObject3D('helper', object)
    }
    this.workOverTrigger()
  },

  startWork () {
    this.workTag = new Promise(resolve => {
      this.workOverTrigger = resolve
    })
  }
}
