<template>
  <a-scene axes-helper="visible:true">
    <a-sphere
      :octree="parse(state.form)"
      radius="1"
      color="#4CC3D9"
      material="opacity: 0.3;wireframe:true"
      segments-height="80"
      segments-width="80"
    ></a-sphere>

    <a-cam orbit-controls="target: 0 0 0 " camera-position="3 3 3"></a-cam>
  </a-scene>

  <base-layout>
    <template #right-top>
      <el-card>
        <el-form label-width="80px" label-position="left">
          <el-form-item label="优化填充">
            <el-checkbox v-model="state.form.needFill"></el-checkbox>
          </el-form-item>
          <el-form-item label="最大精度">
            <el-input-number
              v-model="state.form.maximum"
              :min="-1"
              step-strictly
            ></el-input-number>
          </el-form-item>
          <el-form-item label="最大深度">
            <el-input-number
              v-model="state.form.depth"
              :min="1"
              step-strictly
            ></el-input-number>
          </el-form-item>
        </el-form>
      </el-card>
    </template>
  </base-layout>
</template>
<script setup>
import { reactive } from 'vue'

const state = reactive({
  form: {
    maximum: -1,
    depth: 1,
    needFill: false
  }
})

function parse (data) {
  if (Array.isArray(data)) {
    return data.map(parse).join(',')
  }
  if (data?.isVector3) {
    return vec3(...data.toArray())
  }
  if (typeof data === 'object' && data !== null) {
    return (
      Object.entries(data)
        // eslint-disable-next-line no-unused-vars
        .filter(([_, value]) => ![null, undefined].includes(value))
        .map(([key, value]) => {
          return `${key}: ${parse(value)}`
        })
        .join('; ')
        .concat(';')
    )
  }
  return data.toString()
}
</script>
<style scoped></style>
