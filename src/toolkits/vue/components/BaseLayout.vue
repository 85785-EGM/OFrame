<template>
  <div class="flex-row-center base-layout" :style="{ padding: props.padding }">
    <div class="flex-column-center">
      <div>
        <div class="use-pointer-events">
          <slot name="left-top"></slot>
        </div>
      </div>
      <div style="flex: 1">
        <div class="use-pointer-events">
          <slot name="left"></slot>
        </div>
      </div>
      <div>
        <div class="use-pointer-events">
          <slot name="left-bottom"></slot>
        </div>
      </div>
    </div>

    <div class="flex-column-center" style="flex: 1">
      <div>
        <div class="use-pointer-events">
          <slot name="top"></slot>
        </div>
      </div>
      <div style="flex: 1">
        <div class="use-pointer-events">
          <slot name="default"></slot>
        </div>
      </div>
      <div>
        <div class="use-pointer-events">
          <slot name="bottom"></slot>
        </div>
      </div>
    </div>

    <div class="flex-column-center">
      <div>
        <div class="use-pointer-events">
          <slot name="right-top"></slot>
        </div>
      </div>
      <div style="flex: 1">
        <div class="use-pointer-events">
          <slot name="right"></slot>
        </div>
      </div>
      <div>
        <div class="use-pointer-events">
          <slot name="right-bottom"></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  padding: { type: String, default: '16px' }
})
</script>

<style>
.flex-row-center {
  display: flex;
  flex-direction: row;
  justify-content: center;
}

.flex-column-center {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
</style>

<style scoped>
.base-layout {
  position: absolute;
  left: 0px;
  top: 0px;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 100;
  pointer-events: none;
  box-sizing: border-box;
}
.use-pointer-events {
  pointer-events: all;
}
</style>
