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
import { parse } from '@/utils/aframe'

const state = reactive({
  form: {
    maximum: -1,
    depth: 5,
    needFill: false
  }
})
</script>
<style scoped></style>
