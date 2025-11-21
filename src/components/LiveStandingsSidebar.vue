<template>
  <transition name="sidebar-fade">
    <div v-if="isRacing && currentRace" class="live-sidebar-overlay">
      <!-- Toggle Button -->
      <button
        class="sidebar-toggle-btn"
        :class="{ 'open': isOpen }"
        @click="toggleSidebar"
      >
        <span v-if="!isOpen" class="toggle-icon">◀</span>
        <span v-else class="toggle-icon">▶</span>
        <span class="toggle-text">LIVE</span>
        <span class="live-dot-btn"></span>
      </button>

      <!-- Sidebar Panel -->
      <transition name="slide-sidebar">
        <div v-if="isOpen" class="live-sidebar-panel">
          <div class="sidebar-header">
            <div class="header-top">
              <span class="live-indicator">
                <span class="live-dot"></span>
                <span class="live-text">LIVE STANDINGS</span>
              </span>
              <button class="close-btn" @click="closeSidebar">✕</button>
            </div>
            <div class="race-info">
              {{ currentRace.title }} - {{ currentRace.distance }}m
            </div>
          </div>

          <div class="sidebar-content">
            <div
              v-for="(horse, index) in liveStandings"
              :key="horse.id"
              class="standing-item"
              :class="{ 'gold': index === 0, 'silver': index === 1, 'bronze': index === 2 }"
            >
              <div class="position-badge">{{ index + 1 }}</div>
              <div class="horse-color" :style="{ backgroundColor: horse.color }"></div>
              <div class="horse-info">
                <div class="horse-name">{{ horse.name }}</div>
                <div class="horse-progress-bar">
                  <div
                    class="progress-fill"
                    :style="{ width: horse.progress + '%' }"
                  ></div>
                </div>
              </div>
              <div class="progress-value">{{ horse.progress }}%</div>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

const isOpen = ref(false)

const isRacing = computed(() => store.getters['races/isRacing'])
const currentRace = computed(() => store.getters['races/currentRace'])
const racePositions = computed(() => store.getters['races/racePositions'])

// Auto-open when race starts
watch(isRacing, (newVal) => {
  if (newVal) {
    isOpen.value = true
  }
})

// Compute live standings with progress
const liveStandings = computed(() => {
  if (!isRacing.value || !currentRace.value || !currentRace.value.horses) {
    return []
  }

  const horsesWithProgress = currentRace.value.horses.map(horse => {
    const position = racePositions.value[horse.id]
    return {
      ...horse,
      progress: position ? Math.round(position.progress * 100) : 0
    }
  })

  return horsesWithProgress
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 10)
})

const toggleSidebar = () => {
  isOpen.value = !isOpen.value
}

const closeSidebar = () => {
  isOpen.value = false
}
</script>

<style scoped>
.live-sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 1000;
  pointer-events: none;
}

.live-sidebar-overlay * {
  pointer-events: auto;
}

/* Toggle Button */
.sidebar-toggle-btn {
  position: fixed;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  background: linear-gradient(135deg, #ff9800, #ff5722);
  border: none;
  border-radius: 12px 0 0 12px;
  padding: 15px 12px;
  cursor: pointer;
  z-index: 1001;
  box-shadow: -4px 0 20px rgba(255, 152, 0, 0.6);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  animation: toggle-pulse 2s ease-in-out infinite;
}

.sidebar-toggle-btn:hover {
  padding-left: 16px;
  box-shadow: -6px 0 30px rgba(255, 152, 0, 0.9);
}

.sidebar-toggle-btn.open {
  right: 320px;
  background: linear-gradient(135deg, #666, #444);
}

@keyframes toggle-pulse {
  0%, 100% {
    box-shadow: -4px 0 20px rgba(255, 152, 0, 0.6);
  }
  50% {
    box-shadow: -4px 0 35px rgba(255, 152, 0, 1);
  }
}

.toggle-icon {
  font-size: 16px;
  color: #ffffff;
  font-weight: 900;
}

.toggle-text {
  font-size: 11px;
  font-weight: 900;
  color: #ffffff;
  writing-mode: vertical-rl;
  text-orientation: upright;
  letter-spacing: 2px;
}

.live-dot-btn {
  width: 10px;
  height: 10px;
  background: #ff0000;
  border-radius: 50%;
  animation: dot-blink 1.5s infinite;
  box-shadow: 0 0 10px #ff0000;
}

@keyframes dot-blink {
  0%, 50%, 100% { opacity: 1; }
  25%, 75% { opacity: 0.3; }
}

/* Sidebar Panel */
.live-sidebar-panel {
  position: fixed;
  right: 0;
  top: 100px;
  bottom: 0;
  width: 320px;
  background: linear-gradient(135deg, rgba(20, 20, 35, 0.98), rgba(30, 30, 50, 0.98));
  backdrop-filter: blur(20px);
  box-shadow: -4px 0 30px rgba(0, 0, 0, 0.8);
  border-left: 3px solid rgba(255, 152, 0, 0.8);
  display: flex;
  flex-direction: column;
  z-index: 1000;
}

.sidebar-header {
  background: linear-gradient(135deg, rgba(255, 152, 0, 0.4), rgba(255, 87, 34, 0.4));
  border-bottom: 2px solid rgba(255, 152, 0, 0.6);
  padding: 20px;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.live-indicator {
  display: flex;
  align-items: center;
  gap: 10px;
}

.live-dot {
  width: 12px;
  height: 12px;
  background: #ff0000;
  border-radius: 50%;
  animation: live-pulse 1.5s ease-in-out infinite;
  box-shadow: 0 0 10px #ff0000;
}

@keyframes live-pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.3);
    opacity: 0.7;
  }
}

.live-text {
  font-size: 18px;
  font-weight: 900;
  color: #ffffff;
  letter-spacing: 2px;
  text-shadow: 0 2px 10px rgba(255, 152, 0, 1);
}

.close-btn {
  width: 32px;
  height: 32px;
  background: rgba(0, 0, 0, 0.5);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  color: #ffffff;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: rgba(255, 0, 0, 0.6);
  border-color: #ff0000;
  transform: rotate(90deg);
}

.race-info {
  text-align: center;
  font-size: 14px;
  font-weight: 700;
  color: #ffffff;
  padding: 10px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 8px;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 15px;
}

.standing-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  margin-bottom: 10px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  border: 1px solid rgba(255, 152, 0, 0.3);
  transition: all 0.3s ease;
  animation: item-appear 0.5s ease-out backwards;
}

@keyframes item-appear {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.standing-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 152, 0, 0.6);
  transform: translateX(-5px);
}

.standing-item.gold {
  border-color: rgba(255, 215, 0, 0.8);
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.3);
}

.standing-item.silver {
  border-color: rgba(192, 192, 192, 0.8);
  box-shadow: 0 0 15px rgba(192, 192, 192, 0.3);
}

.standing-item.bronze {
  border-color: rgba(205, 127, 50, 0.8);
  box-shadow: 0 0 15px rgba(205, 127, 50, 0.3);
}

.position-badge {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #ff9800, #ff5722);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 900;
  color: #ffffff;
  flex-shrink: 0;
  box-shadow: 0 2px 10px rgba(255, 152, 0, 0.5);
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
}

.standing-item.gold .position-badge {
  background: linear-gradient(135deg, #ffd700, #ffa500);
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.8);
}

.standing-item.silver .position-badge {
  background: linear-gradient(135deg, #c0c0c0, #a8a8a8);
  box-shadow: 0 0 15px rgba(192, 192, 192, 0.8);
}

.standing-item.bronze .position-badge {
  background: linear-gradient(135deg, #cd7f32, #b8792c);
  box-shadow: 0 0 15px rgba(205, 127, 50, 0.8);
}

.horse-color {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 2px solid rgba(255, 255, 255, 0.8);
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
}

.horse-info {
  flex: 1;
  min-width: 0;
}

.horse-name {
  font-size: 14px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 1);
}

.horse-progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4caf50, #66bb6a);
  border-radius: 4px;
  transition: width 0.3s ease;
  box-shadow: 0 0 10px rgba(76, 175, 80, 0.8);
}

.progress-value {
  font-size: 13px;
  font-weight: 900;
  color: #ffffff;
  background: rgba(76, 175, 80, 0.6);
  padding: 4px 10px;
  border-radius: 6px;
  border: 2px solid rgba(76, 175, 80, 0.8);
  flex-shrink: 0;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
}

/* Transitions */
.sidebar-fade-enter-active,
.sidebar-fade-leave-active {
  transition: opacity 0.3s ease;
}

.sidebar-fade-enter-from,
.sidebar-fade-leave-to {
  opacity: 0;
}

.slide-sidebar-enter-active {
  animation: slide-in 0.4s ease-out;
}

.slide-sidebar-leave-active {
  animation: slide-out 0.3s ease-in;
}

@keyframes slide-in {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slide-out {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}

/* Scrollbar */
.sidebar-content::-webkit-scrollbar {
  width: 6px;
}

.sidebar-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

.sidebar-content::-webkit-scrollbar-thumb {
  background: rgba(255, 152, 0, 0.5);
  border-radius: 3px;
}

.sidebar-content::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 152, 0, 0.7);
}
</style>
