<template>
  <a-scene physics>
    <a-box
      position="-1 4 -3"
      rotation="0 45 0"
      color="#4CC3D9"
      dynamic-body
    ></a-box>
    <a-plane
      position="0 -0.5 -4"
      rotation="-90 0 0"
      width="4"
      height="4"
      color="#7BC8A4"
      static-body
    ></a-plane>
    <a-ocean color="aqua" depth="100" width="100" static-body></a-ocean>
    <a-sky color="#ECECEC"></a-sky>

    <a-cam orbit-controls camera-position="2 2 2"></a-cam>
  </a-scene>
</template>
<script setup></script>
<style scoped></style>
