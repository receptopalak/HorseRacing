<template>
  <div class="horse-icon">
    <div class="lottie-container" :class="{ running: isRunning, paused: !isRunning }" :style="{ filter: `drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3)) hue-rotate(${getHueRotation(color)})` }">
      <dotlottie-wc
        src="https://lottie.host/e6c47129-6d58-4526-893d-83b96f26c6b8/Uf2YNGLAz6.lottie"
        :autoplay="isRunning"
        :loop="isRunning"
        :speed="isRunning ? 1 : 0"
        style="width: 100%; height: 100%"
      ></dotlottie-wc>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  color: {
    type: String,
    default: '#333'
  },
  isRunning: {
    type: Boolean,
    default: false
  }
})

// Convert hex color to hue rotation degree
const getHueRotation = (hexColor) => {
  // Remove # if present
  const hex = hexColor.replace('#', '')

  // Convert hex to RGB
  const r = parseInt(hex.substr(0, 2), 16) / 255
  const g = parseInt(hex.substr(2, 2), 16) / 255
  const b = parseInt(hex.substr(4, 2), 16) / 255

  // Find min and max values
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min

  // Calculate hue
  let hue = 0
  if (delta !== 0) {
    if (max === r) {
      hue = ((g - b) / delta + (g < b ? 6 : 0)) / 6
    } else if (max === g) {
      hue = ((b - r) / delta + 2) / 6
    } else {
      hue = ((r - g) / delta + 4) / 6
    }
  }

  // Convert to degrees (0-360)
  // Subtract original horse color hue (~30 degrees for brown) to get rotation needed
  const targetHue = hue * 360
  const originalHue = 30 // Brown horse
  const rotation = targetHue - originalHue

  return `${rotation}deg`
}
</script>

<style scoped>
.horse-icon {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.lottie-container {
  width: 100%;
  height: 100%;
  position: relative;
  /* Flip horse horizontally to face right */
  transform: scaleX(-1);
}

/* When not running, pause the animation */
.lottie-container.paused {
  opacity: 0.9;
}

.lottie-container.paused dotlottie-wc {
  animation-play-state: paused !important;
}

/* Running state - make it more vibrant */
.lottie-container.running {
  opacity: 1;
}
</style>
