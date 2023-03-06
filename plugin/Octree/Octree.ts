import { BufferAttribute, Box3, Vector3 } from 'three'

export default class Octree {
  public buffer: Float32Array
  public depth: number
  protected _maximum: number

  public rootNode: TreeNode

  constructor (attribute: any) {
    this.buffer = Float32Array.from(attribute.array)
    this.depth = 5
    this.maximum = -1
  }

  public init () {
    const rootBox: Box3 = getBoundBox(this.buffer)
    const rootIndex: Uint32Array = new Uint32Array(this.buffer.length / 3)
    for (let i: number = 0, count: number = rootIndex.length; i < count; i++) {
      rootIndex[i] = i
    }
    this.rootNode = new TreeNode(rootBox, rootIndex)

    this.compute(this.rootNode)
  }

  protected compute (node: TreeNode, depth: number = 0): void {
    if (depth >= this.depth) return
    if (node.index.length <= this.maximum) return
    const leafs: Array<TreeNode> = []
    const boxes = this.splitBoundBox(node.box)
    const count: number = boxes.length
    let i: number
    for (i = 0; i < count; i++) {
      leafs.push(
        new TreeNode(boxes[i], this.filterPointInBoundBox(boxes[i], node.index))
      )
    }
    node.setLeafs(leafs)
    for (i = 0; i < count; i++) {
      this.compute(leafs[i], depth + 1)
    }
  }

  /** 将一个包围盒分为8个 */
  protected splitBoundBox (parent: Box3): Array<Box3> {
    const min: Vector3 = parent.min
    const max: Vector3 = parent.max
    const cen: Vector3 = parent.min.clone().lerp(parent.max, 0.5)

    // min, max
    // [min.x, min.y, min.z][cen.x, cen.y, cen.z]
    // [cen.x, min.y, min.z][max.x, cen.y, cen.z]
    // [min.x, min.y, cen.z][cen.x, cen.y, max.z]
    // [cen.x, min.y, cen.z][max.x, cen.y, max.z]
    // [min.x, cen.y, min.z][cen.x, max.y, cen.z]
    // [cen.x, cen.y, min.z][max.x, max.y, cen.z]
    // [min.x, cen.y, cen.z][cen.x, max.y, max.z]
    // [cen.x, cen.y, cen.z][max.x, max.y, max.z]

    return [
      new Box3(
        new Vector3(min.x, min.y, min.z),
        new Vector3(cen.x, cen.y, cen.z)
      ),
      new Box3(
        new Vector3(cen.x, min.y, min.z),
        new Vector3(max.x, cen.y, cen.z)
      ),
      new Box3(
        new Vector3(min.x, min.y, cen.z),
        new Vector3(cen.x, cen.y, max.z)
      ),
      new Box3(
        new Vector3(cen.x, min.y, cen.z),
        new Vector3(max.x, cen.y, max.z)
      ),
      new Box3(
        new Vector3(min.x, cen.y, min.z),
        new Vector3(cen.x, max.y, cen.z)
      ),
      new Box3(
        new Vector3(cen.x, cen.y, min.z),
        new Vector3(max.x, max.y, cen.z)
      ),
      new Box3(
        new Vector3(min.x, cen.y, cen.z),
        new Vector3(cen.x, max.y, max.z)
      ),
      new Box3(
        new Vector3(cen.x, cen.y, cen.z),
        new Vector3(max.x, max.y, max.z)
      )
    ]
  }

  /** 获取包围盒中的点(索引) */
  protected filterPointInBoundBox (box: Box3, index: Uint32Array): Uint32Array {
    const count: number = index.length
    let x: number, y: number, z: number
    let bufferLength: number, pointIndex: number, i: number
    const indexBuffer = new Uint32Array(count)

    bufferLength = i = 0

    for (; i < count; i++) {
      pointIndex = index[i] * 3
      x = this.buffer[pointIndex]
      y = this.buffer[pointIndex + 1]
      z = this.buffer[pointIndex + 2]

      if (
        !(
          x < box.min.x ||
          x > box.max.x ||
          y < box.min.y ||
          y > box.max.y ||
          z < box.min.z ||
          z > box.max.z
        )
      ) {
        indexBuffer[bufferLength++] = index[i]
      }
    }

    return indexBuffer.slice(0, bufferLength)
  }

  get maximum (): number {
    return this._maximum
  }

  set maximum (data: number) {
    this._maximum = data > 0 ? data : Math.ceil(this.buffer.length / 1000)
  }
}

export class TreeNode {
  box: Box3
  // 索引对应的是根数据的buffer,点索引
  index: Uint32Array
  // 索引对应的是根数据的buffer,三角面片索引
  tIndex: Uint32Array
  leafs: Array<TreeNode> = []
  // box的中心点 和 sphere的半径
  center: Vector3
  radius: number

  constructor (box: Box3, index: Uint32Array, tIndex?: Uint32Array | never) {
    this.box = box
    this.index = index
    this.center = new Vector3()
    if (tIndex) this.tIndex = tIndex
  }

  setLeafs (leafs: Array<TreeNode>): void {
    this.leafs = Array.from(leafs)
  }

  clone (): TreeNode {
    return new TreeNode(this.box, this.index, this.tIndex)
  }

  computeBoundingSphere (): void {
    this.center = this.center.lerpVectors(this.box.max, this.box.min, 0.5)
    this.radius = this.box.max.distanceTo(this.center)
  }

  get isLeaf (): boolean {
    return this.leafs.length === 0
  }

  get isEmpty (): boolean {
    return this.index.length === 0
  }
}

export function getLeafNode (node: TreeNode): Array<TreeNode> {
  if (node.isEmpty) return []
  if (node.isLeaf) return [node]

  const array: Array<TreeNode> = []
  for (const leaf of node.leafs) {
    array.push(...getLeafNode(leaf))
  }
  return array
}

/** 根据buffer获取包围盒 */
export function getBoundBox (buffer: Float32Array): Box3 {
  let xMax: number, yMax: number, zMax: number
  let xMin: number, yMin: number, zMin: number
  let x: number, y: number, z: number

  xMax = yMax = zMax = -Infinity
  xMin = yMin = zMin = Infinity

  const count = buffer.length
  for (let i: number = 0; i < count; i += 3) {
    x = buffer[i]
    y = buffer[i + 1]
    z = buffer[i + 2]

    // x轴最大值和最小值
    if (xMax < x) xMax = x
    else if (xMin > x) xMin = x
    // y轴最大值和最小值
    if (yMax < y) yMax = y
    else if (yMin > y) yMin = y
    // z轴最大值和最小值
    if (zMax < z) zMax = z
    else if (zMin > z) zMin = z
  }

  return new Box3(new Vector3(xMin, yMin, zMin), new Vector3(xMax, yMax, zMax))
}

export function fillBoxWithTriangle (
  tree: Octree,
  needCreate = false
): Array<TreeNode> {
  const buffer: Float32Array = tree.buffer
  const leafNodes: Array<TreeNode> = getLeafNode(tree.rootNode)
  const nodeCount: number = leafNodes.length
  let index: Uint32Array,
    tIndex: Uint32Array,
    tBuffer: Float32Array,
    pointCount: number,
    triangleCount: number,
    i: number,
    j: number

  for (i = 0; i < nodeCount; i++) {
    if (needCreate) leafNodes[i] = leafNodes[i].clone()
    index = leafNodes[i].index
    pointCount = index.length
    triangleCount = 0
    tIndex = new Uint32Array(pointCount)

    let _tIndex: number
    for (j = 0; j < pointCount; j++) {
      _tIndex = Math.floor(index[j] / 3)
      // 这里可以优化，是否删除重复的三角面片
      if (tIndex.includes(_tIndex)) continue
      tIndex[triangleCount++] = _tIndex
    }
    tIndex = tIndex.slice(0, triangleCount)
    leafNodes[i].tIndex = tIndex
    // 将三角面片的索引 转化成 buffer数据
    tBuffer = new Float32Array(triangleCount * 9)

    let _tBufferIndexStart: number, _tBufferStart: number
    for (j = 0; j < triangleCount; j++) {
      // 根据索引获取三角面片在buffer中的开始位置
      _tBufferIndexStart = tIndex[j] * 9
      _tBufferStart = j * 9

      tBuffer[_tBufferStart + 0] = buffer[_tBufferIndexStart + 0]
      tBuffer[_tBufferStart + 1] = buffer[_tBufferIndexStart + 1]
      tBuffer[_tBufferStart + 2] = buffer[_tBufferIndexStart + 2]
      tBuffer[_tBufferStart + 3] = buffer[_tBufferIndexStart + 3]
      tBuffer[_tBufferStart + 4] = buffer[_tBufferIndexStart + 4]
      tBuffer[_tBufferStart + 5] = buffer[_tBufferIndexStart + 5]
      tBuffer[_tBufferStart + 6] = buffer[_tBufferIndexStart + 6]
      tBuffer[_tBufferStart + 7] = buffer[_tBufferIndexStart + 7]
      tBuffer[_tBufferStart + 8] = buffer[_tBufferIndexStart + 8]
    }
    // 扩大boundingBox
    leafNodes[i].box = getBoundBox(tBuffer)
  }
  return leafNodes
}
