import { Triangle, Vector3, Matrix4, Line3 } from 'three'
import { MeshBVH } from 'three-mesh-bvh'
import { ExtendedTriangle } from 'three-mesh-bvh'

const _vec = new Vector3()

interface ComputeObject {
  lines: Float32Array
  triangle: Float32Array
}

interface cutTriangle {
  [key: string | number]: Float32Array
}

interface cutTriangleFunc {
  [key: string | number]: Function
}

interface CutTriangleWhenPointAtLineReturn {
  beCutTriangleIndex: Array<number>
  newTriangle: Float32Array
}
interface cutTriangleWhenPointInReturn {
  beCutTriangleIndex: Array<number>
  newTriangle: Float32Array
}
interface cutTriangleWhenLineIntersectReturn {
  beCutTriangleIndex: Array<number>
  newTriangle: Float32Array
}

/** 找到点在哪个三角形边上 */
function cutTriangleWhenPointAtLine (
  triangles: Float32Array,
  bufferLength: number,
  x: number,
  y: number,
  z: number
): CutTriangleWhenPointAtLineReturn {
  // 现判断点在不在三角形边上
  const a: Vector3 = new Vector3()
  const b: Vector3 = new Vector3()
  const c: Vector3 = new Vector3()
  const p: Vector3 = new Vector3(x, y, z)
  const beCutTriangleIndex: Array<number> = []
  const createNewTriangle: Float32Array = new Float32Array(triangles.length * 2)
  let createNewTriangleLength: number = 0

  const copyABC = i => {
    ;[a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z] = triangles.slice(i, i + 9)
  }

  // 判断在那根线上
  const isOnLine = (): boolean | Vector3 => {
    for (const [p1, p2] of [
      [a, b.clone()],
      [b, c.clone()],
      [c, a.clone()]
    ]) {
      _vec.copy(p2)
      p2.sub(p1).normalize()
      if (Math.fround(p2.dot(p.clone().sub(p1).normalize())) === 1) {
        if (p1.distanceTo(_vec) > p1.distanceTo(p)) {
          return p1
        }
      }
    }
    return false
  }

  // 根据在线上，切割三角形
  for (let i = 0; i < bufferLength; i += 9) {
    copyABC(i)
    // 直接返回原有的点
    const _v: boolean | Vector3 = isOnLine()
    if (!_v) continue
    if (_v === a) {
      // apc,pbc
      createNewTriangle.set(
        [
          ...a.toArray(),
          ...p.toArray(),
          ...c.toArray(),
          ...p.toArray(),
          ...b.toArray(),
          ...c.toArray()
        ],
        createNewTriangleLength
      )
    } else if (_v === b) {
      // bpa,pca
      createNewTriangle.set(
        [
          ...b.toArray(),
          ...p.toArray(),
          ...a.toArray(),
          ...p.toArray(),
          ...c.toArray(),
          ...a.toArray()
        ],
        createNewTriangleLength
      )
    } else {
      // cpb,pab
      createNewTriangle.set(
        [
          ...c.toArray(),
          ...p.toArray(),
          ...b.toArray(),
          ...p.toArray(),
          ...a.toArray(),
          ...b.toArray()
        ],
        createNewTriangleLength
      )
    }
    //  记录被切割的三角形的索引
    beCutTriangleIndex.push(i)
    createNewTriangleLength += 18
  }
  return {
    beCutTriangleIndex,
    newTriangle: createNewTriangle.slice(0, createNewTriangleLength)
  }
}

/** 找到点在哪个三角形内 */
function cutTriangleWhenPointIn (
  triangles: Float32Array,
  bufferLength: number,
  x: number,
  y: number,
  z: number
): cutTriangleWhenPointInReturn {
  const a: Vector3 = new Vector3()
  const b: Vector3 = new Vector3()
  const c: Vector3 = new Vector3()
  const p: Vector3 = new Vector3(x, y, z)
  const beCutTriangleIndex: Array<number> = []
  const createNewTriangle: Float32Array = new Float32Array(27)

  const copyABC = i => {
    ;[a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z] = triangles.slice(i, i + 9)
  }

  const getAreaSquare = (a: number, b: number, c: number): number => {
    const p = (a + b + c) / 2
    return p * (p - a) * (p - b) * (p - c)
  }

  /** 面积法或方向法 https://baijiahao.baidu.com/s?id=1748841729702963314&wfr=spider&for=pc*/
  const isInTriangle = (): boolean => {
    // // 面积法
    // const ab: number = a.distanceTo(b),
    //   bc: number = b.distanceTo(c),
    //   ca: number = c.distanceTo(a),
    //   ap: number = a.distanceTo(p),
    //   bp: number = b.distanceTo(p),
    //   cp: number = c.distanceTo(p)
    // return (
    //   getAreaSquare(ab, bc, ca) >
    //   getAreaSquare(ab, bp, ap) +
    //     getAreaSquare(bc, cp, bp) +
    //     getAreaSquare(ca, ap, cp)
    // )

    // 方向法
    const _v = b.clone().sub(a).cross(p.clone().sub(a)).normalize()
    return (
      _v.x * c.clone().sub(b).cross(p.clone().sub(b)).normalize().x >= 0 &&
      _v.x * a.clone().sub(c).cross(p.clone().sub(c)).normalize().x >= 0
    )
  }

  // 根据点在三角形内部，切割三角形
  for (let i = 0; i < bufferLength; i += 9) {
    copyABC(i)
    if (isInTriangle()) {
      // abp,bcp,cap
      createNewTriangle.set([
        ...a.toArray(),
        ...b.toArray(),
        ...p.toArray(),
        ...b.toArray(),
        ...c.toArray(),
        ...p.toArray(),
        ...c.toArray(),
        ...a.toArray(),
        ...p.toArray()
      ])
      beCutTriangleIndex.push(i)
      break
    }
  }

  return {
    beCutTriangleIndex,
    newTriangle: createNewTriangle
  }
}

/** 该裁剪哪条边 */
function cutTriangleWhenLineIntersect (
  triangles: Float32Array,
  bufferLength: number,
  lineBuffer: Float32Array
): cutTriangleWhenLineIntersectReturn {
  const a: Vector3 = new Vector3()
  const b: Vector3 = new Vector3()
  const c: Vector3 = new Vector3()

  const lineStart = new Vector3().fromArray(lineBuffer, 0)
  const lineEnd = new Vector3().fromArray(lineBuffer, 2)

  const beCutTriangleIndex: Array<number> = []
  const copyTriangles = new Float32Array(triangles.length * 5)
  console.log(copyTriangles.length)

  let createNewTriangleLength: number = 0

  const copyABC = i => {
    ;[a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z] = copyTriangles.slice(
      i,
      i + 9
    )
  }

  const edgeIntersect = (
    a: Vector3,
    b: Vector3,
    c: Vector3 = lineStart,
    d: Vector3 = lineEnd
  ): Vector3 | boolean => {
    if (Math.fround(Math.abs(b.clone().sub(a).dot(d.clone().sub(c)))) === 1)
      return false
    const e = c.clone().sub(a).add(b)
    const doubleArea1 = c.clone().sub(a).cross(d.clone().sub(a)).length()
    const doubleArea2 = c.clone().sub(e).cross(d.clone().sub(e)).length()

    return b
      .clone()
      .sub(a)
      .normalize()
      .multiplyScalar(doubleArea1 / doubleArea2)
      .add(a)
  }
  // 之前已经验证过线段一定是共面的，所以跳过这一步
  // 判断是否平行
  copyTriangles.set(triangles)
  for (let i = 0; i < bufferLength + createNewTriangleLength; i += 9) {
    copyABC(i)
    for (const [s, e, h] of [
      [a, b, c],
      [b, c, a],
      [c, a, b]
    ]) {
      const _v: any = edgeIntersect(s, e)
      if (!_v) {
        console.log('continue')
        continue
      }
      beCutTriangleIndex.push(i)
      copyTriangles.set(
        [
          ...s.toArray(),
          ..._v.toArray(),
          ...h.toArray(),
          ...h.toArray(),
          ..._v.toArray(),
          ...e.toArray()
        ],
        bufferLength + createNewTriangleLength
      )
      createNewTriangleLength += 18
      break
    }
  }

  // 整理创建的三角面片
  for (const beCutIndex of beCutTriangleIndex) {
    if (beCutIndex < bufferLength) continue
    copyTriangles.set(copyTriangles.slice(beCutIndex + 9), beCutIndex)
    createNewTriangleLength -= 9
  }

  return {
    beCutTriangleIndex: beCutTriangleIndex.filter(
      beCutIndex => beCutIndex < bufferLength
    ),
    newTriangle: copyTriangles.slice(
      bufferLength,
      bufferLength + createNewTriangleLength
    )
  }
}

export default class MeshBoolean {
  protected bvh1: MeshBVH
  protected bvh2: MeshBVH

  constructor (bvh1: MeshBVH, bvh2: MeshBVH) {
    this.bvh1 = bvh1
    this.bvh2 = bvh2

    const [maps1, maps2] = this.forEachBVH()

    console.time('com')
    this.computeTriangles(maps1)
    // const cutTriangles1: cutTriangle = this.computeTriangles(maps1)
    console.timeEnd('com')
    // const cutTriangles2: cutTriangle = this.computeTriangles(maps2)
  }

  /**
   * mesh1 遍历 mesh2
   * mesh1作为世界原点，计算matrix2to1，减少矩阵预算量
   */
  forEachBVH (): Array<Map<string | number, ComputeObject>> {
    const triangle1Maps: Map<string | number, ComputeObject> = new Map()
    const triangle2Maps: Map<string | number, ComputeObject> = new Map()
    const intersectEdge = new Line3()

    // 记录需要计算的参数
    const setMap = (
      maps: Map<string | number, ComputeObject>,
      key: string | number,
      triangle: ExtendedTriangle,
      line: Line3
    ) => {
      const object: any = maps.get(key) ?? {}
      if (!object?.triangle) {
        object.triangle = [
          ...triangle.a.toArray(),
          ...triangle.b.toArray(),
          ...triangle.c.toArray()
        ]
        object.lines = new Float32Array(0)
        maps.set(key, object)
      }
      const lineLength = object.lines.length
      const lineArray = new Float32Array(lineLength + 6)

      lineArray.set(object.lines, 0)
      lineArray.set(line.start.toArray(), lineLength)
      lineArray.set(line.end.toArray(), lineLength + 3)
      object.lines = lineArray
    }

    // 遍历三角面片
    const intersectsTriangles = (
      triangle1: ExtendedTriangle,
      triangle2: ExtendedTriangle,
      i1: number,
      i2: number
    ): boolean => {
      if (triangle1.intersectsTriangle(triangle2, intersectEdge)) {
        setMap(triangle1Maps, i1, triangle1, intersectEdge)
        setMap(triangle2Maps, i2, triangle2, intersectEdge)
      }
      return false
    }

    this.bvh1.bvhcast(this.bvh2, new Matrix4(), {
      intersectsTriangles
    })

    return [triangle1Maps, triangle2Maps]
  }

  computeTriangles (maps: Map<string | number, ComputeObject>): cutTriangle {
    const cutTriangleFunc = Object.entries(this.cutTriangles(maps))
    const cutTriangle: cutTriangle = {}
    let index, value
    for ([index, value] of cutTriangleFunc) {
      cutTriangle[index] = value()
    }

    return cutTriangle
  }

  cutTriangles (maps: Map<string | number, ComputeObject>): cutTriangleFunc {
    const cutTriangleFunc: cutTriangleFunc = {}
    let index, value
    for ([index, value] of maps) {
      cutTriangleFunc[index] = this._cutTriangle.bind(
        this,
        value.triangle,
        value.lines
      )
    }
    return cutTriangleFunc
  }

  _cutTriangle (triangle: Float32Array, lines: Float32Array): Float32Array {
    const maxArray: Float32Array = new Float32Array(lines.length * 1.5 * 9)
    let linesCount: number = lines.length
    let bufferLength: number = 9 // 实际buffer长度

    let i: number = 0,
      x: number,
      y: number,
      z: number,
      triangleIndex: number

    maxArray.set(triangle, 0)

    // 按点裁剪三角面片，这一步只增加三角面片
    for (i = 0; i < linesCount; i += 3) {
      ;[x, y, z] = lines.slice(i, i + 3)
      const { beCutTriangleIndex, newTriangle } = cutTriangleWhenPointAtLine(
        maxArray,
        bufferLength,
        x,
        y,
        z
      )
      // 如果点在三角面片点边上，1to2
      if (beCutTriangleIndex.length > 0) {
        // 删除被裁减的三角形
        for (const beCutIndex of beCutTriangleIndex) {
          maxArray.set(maxArray.slice(beCutIndex + 9), beCutIndex)
          bufferLength -= 9
        }
        // 追加新增三角形
        maxArray.set(newTriangle, bufferLength)
        bufferLength += newTriangle.length
      }
      // 如果点在三角面片内部，1to3
      else {
        const { beCutTriangleIndex, newTriangle } = cutTriangleWhenPointIn(
          maxArray,
          bufferLength,
          x,
          y,
          z
        )
        // 所有的点一定会在边上或内部，如果不在则说明出错了
        if (beCutTriangleIndex.length === 1) {
          const beCutIndex = beCutTriangleIndex[0]
          maxArray.set(maxArray.slice(beCutIndex + 9), beCutIndex)
          bufferLength -= 9
          maxArray.set(newTriangle, bufferLength)
          bufferLength += 27
        } else console.warn('error: come to fix me')
      }
    }

    // 按线段裁剪三角面片
    for (i = 0; i < linesCount; i += 6) {
      const result: cutTriangleWhenLineIntersectReturn =
        cutTriangleWhenLineIntersect(
          maxArray,
          bufferLength,
          lines.slice(i, i + 6)
        )

      console.log(result.beCutTriangleIndex)
    }

    return maxArray
  }
}
