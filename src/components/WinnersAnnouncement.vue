<template>
  <transition name="announcement">
    <div v-if="show && winners.length > 0" class="winners-announcement-overlay">
      <div class="announcement-content">
        <div class="trophy-icon">🏆</div>
        <h2 class="announcement-title">RACE COMPLETE!</h2>
        <div class="race-subtitle">{{ raceTitle }}</div>

        <div class="winners-podium">
          <!-- 1st Place -->
          <div class="winner-card first-place">
            <div class="place-badge gold">
              <span class="place-number">1</span>
              <span class="place-medal">🥇</span>
            </div>
            <div class="winner-info">
              <div class="winner-name">{{ winners[0].horse.name }}</div>
              <div class="winner-time">{{ parseFloat(winners[0].time).toFixed(2) }}s</div>
            </div>
            <div class="winner-color" :style="{ backgroundColor: winners[0].horse.color }"></div>
          </div>

          <!-- 2nd Place -->
          <div v-if="winners[1]" class="winner-card second-place">
            <div class="place-badge silver">
              <span class="place-number">2</span>
              <span class="place-medal">🥈</span>
            </div>
            <div class="winner-info">
              <div class="winner-name">{{ winners[1].horse.name }}</div>
              <div class="winner-time">{{ parseFloat(winners[1].time).toFixed(2) }}s</div>
            </div>
            <div class="winner-color" :style="{ backgroundColor: winners[1].horse.color }"></div>
          </div>

          <!-- 3rd Place -->
          <div v-if="winners[2]" class="winner-card third-place">
            <div class="place-badge bronze">
              <span class="place-number">3</span>
              <span class="place-medal">🥉</span>
            </div>
            <div class="winner-info">
              <div class="winner-name">{{ winners[2].horse.name }}</div>
              <div class="winner-time">{{ parseFloat(winners[2].time).toFixed(2) }}s</div>
            </div>
            <div class="winner-color" :style="{ backgroundColor: winners[2].horse.color }"></div>
          </div>
        </div>

        <div class="countdown-text">Next race in {{ countdown }}s...</div>
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
  winners: {
    type: Array,
    default: () => []
  },
  raceTitle: {
    type: String,
    default: ''
  },
  duration: {
    type: Number,
    default: 3000
  }
})

const emit = defineEmits(['complete'])

const countdown = ref(3)
let countdownInterval = null
let timeoutId = null

watch(() => props.show, (newVal) => {
  if (newVal) {
    // Set initial countdown based on duration
    countdown.value = Math.floor(props.duration / 1000)

    // Start countdown - decrease every second
    countdownInterval = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(countdownInterval)
        countdownInterval = null
      }
    }, 1000)

    // Auto hide after duration
    timeoutId = setTimeout(() => {
      emit('complete')
    }, props.duration)
  } else {
    // Clean up intervals and timeouts
    if (countdownInterval) {
      clearInterval(countdownInterval)
      countdownInterval = null
    }
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }
})

onUnmounted(() => {
  if (countdownInterval) clearInterval(countdownInterval)
  if (timeoutId) clearTimeout(timeoutId)
})
</script>

<style scoped>
.winners-announcement-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
}

.announcement-content {
  text-align: center;
  max-width: 800px;
  width: 100%;
}

.trophy-icon {
  font-size: 80px;
  margin-bottom: 20px;
  animation: trophy-bounce 1s ease-in-out infinite;
}

@keyframes trophy-bounce {
  0%, 100% { transform: translateY(0px) rotate(-5deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
}

.announcement-title {
  font-size: 48px;
  font-weight: 900;
  background: linear-gradient(135deg, #ffd700, #ffa500, #ff6b6b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 10px 0;
  letter-spacing: 4px;
  animation: title-glow 2s ease-in-out infinite;
}

@keyframes title-glow {
  0%, 100% { filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.5)); }
  50% { filter: drop-shadow(0 0 30px rgba(255, 215, 0, 0.8)); }
}

.race-subtitle {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 40px;
  font-weight: 600;
}

.winners-podium {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 30px;
}

.winner-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 20px;
  min-width: 220px;
  position: relative;
  overflow: hidden;
  animation: card-enter 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes card-enter {
  from {
    opacity: 0;
    transform: scale(0.5) translateY(50px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.first-place {
  border-color: #ffd700;
  box-shadow: 0 0 40px rgba(255, 215, 0, 0.6);
  animation-delay: 0.1s;
}

.second-place {
  border-color: #c0c0c0;
  box-shadow: 0 0 30px rgba(192, 192, 192, 0.5);
  animation-delay: 0.2s;
}

.third-place {
  border-color: #cd7f32;
  box-shadow: 0 0 25px rgba(205, 127, 50, 0.5);
  animation-delay: 0.3s;
}

.place-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px;
  border-radius: 12px;
  margin-bottom: 15px;
  font-weight: 800;
  font-size: 24px;
}

.gold {
  background: linear-gradient(135deg, #ffd700, #ffa500);
  color: #000;
}

.silver {
  background: linear-gradient(135deg, #e8e8e8, #c0c0c0);
  color: #000;
}

.bronze {
  background: linear-gradient(135deg, #cd7f32, #b8860b);
  color: #000;
}

.place-number {
  font-size: 32px;
}

.place-medal {
  font-size: 28px;
}

.winner-info {
  margin-bottom: 15px;
}

.winner-name {
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 8px;
}

.winner-time {
  font-size: 16px;
  color: #4caf50;
  font-weight: 600;
}

.winner-color {
  height: 8px;
  border-radius: 4px;
  box-shadow: 0 2px 8px currentColor;
}

.countdown-text {
  font-size: 20px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 600;
  animation: countdown-pulse 1s ease-in-out infinite;
}

@keyframes countdown-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Transition */
.announcement-enter-active {
  animation: announcement-in 0.6s ease-out;
}

.announcement-leave-active {
  animation: announcement-out 0.4s ease-in;
}

@keyframes announcement-in {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes announcement-out {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(1.1);
  }
}

/* Responsive */
@media (max-width: 900px) {
  .winners-podium {
    flex-direction: column;
    align-items: center;
  }

  .winner-card {
    width: 100%;
    max-width: 300px;
  }

  .announcement-title {
    font-size: 32px;
  }
}
</style>
