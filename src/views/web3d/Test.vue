<template>
  <a-scene>
    <a-box position="-1 4 -3" rotation="0 45 0" color="#4CC3D9"></a-box>
    <a-plane
      position="0 -0.5 -4"
      rotation="-90 0 0"
      width="4"
      height="4"
      color="#7BC8A4"
      event-test
    >
    </a-plane>

    <a-cam orbit-controls="target: 0 1 0 " camera-position="0 2 5"></a-cam>
  </a-scene>
</template>
<script setup></script>
<style scoped></style>
