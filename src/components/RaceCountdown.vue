<template>
  <transition name="countdown">
    <div v-if="show" class="countdown-overlay">
      <div class="countdown-content">
        <div v-if="currentNumber > 0" :key="currentNumber" class="countdown-number">
          {{ currentNumber }}
        </div>
        <div v-else-if="currentNumber === 0" class="countdown-start">
          <div class="start-text">START!</div>
          <div class="start-icon">🏁</div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  duration: {
    type: Number,
    default: 3000
  }
})

const emit = defineEmits(['complete'])

const currentNumber = ref(3)
let countdownInterval = null
let timeoutId = null

watch(() => props.show, (newVal) => {
  if (newVal) {
    currentNumber.value = 3

    // Countdown: 3, 2, 1, START
    countdownInterval = setInterval(() => {
      currentNumber.value--
      if (currentNumber.value < 0) {
        clearInterval(countdownInterval)
      }
    }, 1000)

    // Auto complete after duration (3s for countdown + 0.5s for START)
    timeoutId = setTimeout(() => {
      emit('complete')
    }, 3500)
  } else {
    // Clean up
    if (countdownInterval) clearInterval(countdownInterval)
    if (timeoutId) clearTimeout(timeoutId)
    currentNumber.value = 3
  }
})

onUnmounted(() => {
  if (countdownInterval) clearInterval(countdownInterval)
  if (timeoutId) clearTimeout(timeoutId)
})
</script>

<style scoped>
.countdown-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  pointer-events: none;
}

.countdown-content {
  text-align: center;
}

.countdown-number {
  font-size: 200px;
  font-weight: 900;
  color: #ffd700;
  text-shadow:
    0 0 20px rgba(255, 215, 0, 1),
    0 0 40px rgba(255, 215, 0, 0.8),
    0 0 60px rgba(255, 215, 0, 0.6),
    0 4px 8px rgba(0, 0, 0, 0.8);
  animation: number-pulse 1s ease-out;
  line-height: 1;
}

@keyframes number-pulse {
  0% {
    transform: scale(0.3);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.countdown-start {
  animation: start-explode 0.5s ease-out;
}

@keyframes start-explode {
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  50% {
    transform: scale(1.3);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.start-text {
  font-size: 120px;
  font-weight: 900;
  color: #4caf50;
  text-shadow:
    0 0 20px rgba(76, 175, 80, 1),
    0 0 40px rgba(76, 175, 80, 0.8),
    0 0 60px rgba(76, 175, 80, 0.6),
    0 4px 8px rgba(0, 0, 0, 0.8);
  letter-spacing: 20px;
  margin-bottom: 20px;
  animation: start-glow 0.5s ease-out infinite;
}

@keyframes start-glow {
  0%, 100% {
    text-shadow:
      0 0 20px rgba(76, 175, 80, 1),
      0 0 40px rgba(76, 175, 80, 0.8),
      0 0 60px rgba(76, 175, 80, 0.6),
      0 4px 8px rgba(0, 0, 0, 0.8);
  }
  50% {
    text-shadow:
      0 0 30px rgba(76, 175, 80, 1),
      0 0 60px rgba(76, 175, 80, 1),
      0 0 90px rgba(76, 175, 80, 0.8),
      0 4px 8px rgba(0, 0, 0, 0.8);
  }
}

.start-icon {
  font-size: 80px;
  animation: icon-wave 0.5s ease-in-out infinite;
}

@keyframes icon-wave {
  0%, 100% {
    transform: rotate(-10deg);
  }
  50% {
    transform: rotate(10deg);
  }
}

/* Transitions */
.countdown-enter-active {
  animation: countdown-in 0.3s ease-out;
}

.countdown-leave-active {
  animation: countdown-out 0.3s ease-in;
}

@keyframes countdown-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes countdown-out {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
</style>
