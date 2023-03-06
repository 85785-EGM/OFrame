<template>
  <a-scene axes-helper="visible:true">
    <a-sphere
      id="mesh1"
      radius="1"
      color="#4CC3D9"
      position="0.1 -0.1 0.1"
      material="opacity: 0.3;wireframe:true"
    ></a-sphere>
    <a-sphere
      id="mesh2"
      radius="1"
      color="#4CC3D9"
      position="-0.7 0.5 0.7"
      material="opacity: 1;wireframe:true"
    ></a-sphere>

    <a-cam orbit-controls="target: 0 0 0 " camera-position="3 3 3"></a-cam>
  </a-scene>

  <base-layout>
    <template #right-top>
      <el-card>
        <el-form label-width="80px" label-position="left"> </el-form>
      </el-card>
    </template>
  </base-layout>
</template>

<script setup>
import { onMounted } from 'vue'
import { delay } from '@/utils/time'
import MeshBoolean from 'plugin/MeshBoolean/MeshBoolean'
import {
  Mesh,
  BufferGeometry,
  MeshLambertMaterial,
  BufferAttribute,
  Matrix4
} from 'three'

onMounted(async () => {
  await delay(100)
  initMeshBoolean()
})

function initMeshBoolean () {
  const mesh1 = document.querySelector('#mesh1')
  const mesh2 = document.querySelector('#mesh2')

  const geometry1 = mesh1.getObject3D('mesh').geometry.toNonIndexed()
  const geometry2 = mesh2.getObject3D('mesh').geometry.toNonIndexed()

  geometry1.applyMatrix4(mesh1.getObject3D('mesh').matrixWorld)
  geometry2.applyMatrix4(mesh2.getObject3D('mesh').matrixWorld)

  const bvh1 = geometry1.computeBoundsTree()
  const bvh2 = geometry2.computeBoundsTree()

  return new MeshBoolean(bvh1, bvh2)
}

function showBuffer (buffer = new Float32Array(0), matrix = new Matrix4()) {
  const attr = new BufferAttribute(buffer, 3, false)
  const geometry = new BufferGeometry()
  const material = new MeshLambertMaterial({
    color: 'black',
    side: 2
  })

  geometry.setAttribute('position', attr)
  geometry.applyMatrix4(matrix)

  const m = new Mesh(geometry, material)
  document.querySelector('a-scene').setObject3D('test', m)
}
</script>

<style scoped></style>
