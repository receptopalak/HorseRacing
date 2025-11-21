<template>
  <transition name="modal">
    <div v-if="show" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <div>
            <h2>{{ raceTitle }}</h2>
            <p class="modal-subtitle">Final Results</p>
          </div>
          <button class="close-btn" @click="closeModal">✕</button>
        </div>

        <div class="modal-body">
          <div v-if="rankings.length === 0" class="no-results">
            <div class="empty-icon">🏁</div>
            <p>Race not completed yet</p>
          </div>

          <div v-else class="results-list">
            <div
              v-for="(ranking, index) in rankings"
              :key="ranking.horse.id"
              class="result-item"
              :class="{ 'podium-finish': index < 3 }"
              :style="{ animationDelay: `${index * 0.05}s` }"
            >
              <div class="position-number" :class="{
                'pos-1': index === 0,
                'pos-2': index === 1,
                'pos-3': index === 2
              }">
                <span v-if="index === 0">🥇</span>
                <span v-else-if="index === 1">🥈</span>
                <span v-else-if="index === 2">🥉</span>
                <span v-else>{{ index + 1 }}</span>
              </div>

              <div
                class="horse-color-indicator"
                :style="{ backgroundColor: ranking.horse.color }"
              ></div>

              <div class="horse-details">
                <div class="horse-name">{{ ranking.horse.name }}</div>
                <div class="horse-stats">
                  <span class="stat">Condition: {{ ranking.horse.condition }}%</span>
                  <span class="stat">Speed: {{ ranking.speed }}</span>
                </div>
              </div>

              <div class="result-time">
                <div class="time-value">{{ ranking.time }}s</div>
                <div class="time-label">Time</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  raceTitle: {
    type: String,
    default: ''
  },
  rankings: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close'])

const closeModal = () => {
  emit('close')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.92);
  backdrop-filter: blur(15px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
  padding: 20px;
}

.modal-content {
  background: linear-gradient(135deg, rgba(26, 26, 46, 0.98) 0%, rgba(15, 15, 26, 0.98) 100%);
  border: 2px solid rgba(255, 215, 0, 0.3);
  border-radius: 20px;
  max-width: 800px;
  width: 100%;
  max-height: 85vh;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 30px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), transparent);
}

.modal-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 800;
  color: #ffd700;
  letter-spacing: 1px;
}

.modal-subtitle {
  margin: 5px 0 0 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 600;
}

.close-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  font-size: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: rgba(255, 0, 0, 0.3);
  border-color: rgba(255, 0, 0, 0.5);
  transform: rotate(90deg);
}

.modal-body {
  padding: 20px 30px 30px;
  max-height: calc(85vh - 120px);
  overflow-y: auto;
}

.no-results {
  text-align: center;
  padding: 60px 20px;
  color: rgba(255, 255, 255, 0.5);
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 15px;
}

.no-results p {
  font-size: 16px;
  font-weight: 500;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 15px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 15px;
  transition: all 0.3s ease;
  opacity: 0;
  animation: item-appear 0.5s forwards;
}

@keyframes item-appear {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.result-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 215, 0, 0.3);
  transform: translateX(5px);
}

.podium-finish {
  border-width: 2px;
}

.podium-finish.pos-1 {
  border-color: #ffd700;
  background: rgba(255, 215, 0, 0.1);
}

.podium-finish.pos-2 {
  border-color: #c0c0c0;
  background: rgba(192, 192, 192, 0.1);
}

.podium-finish.pos-3 {
  border-color: #cd7f32;
  background: rgba(205, 127, 50, 0.1);
}

.position-number {
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.8);
  flex-shrink: 0;
}

.pos-1 {
  background: linear-gradient(135deg, #ffd700, #ffa500);
  color: #000;
  box-shadow: 0 4px 15px rgba(255, 215, 0, 0.5);
}

.pos-2 {
  background: linear-gradient(135deg, #e8e8e8, #c0c0c0);
  color: #000;
  box-shadow: 0 4px 15px rgba(192, 192, 192, 0.5);
}

.pos-3 {
  background: linear-gradient(135deg, #cd7f32, #b8860b);
  color: #000;
  box-shadow: 0 4px 15px rgba(205, 127, 50, 0.5);
}

.horse-color-indicator {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 2px 10px currentColor;
  flex-shrink: 0;
}

.horse-details {
  flex: 1;
  min-width: 0;
}

.horse-name {
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.horse-stats {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.stat {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 600;
}

.result-time {
  text-align: right;
  flex-shrink: 0;
}

.time-value {
  font-size: 20px;
  font-weight: 800;
  color: #4caf50;
  line-height: 1;
}

.time-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 4px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* Scrollbar */
.modal-body::-webkit-scrollbar {
  width: 8px;
}

.modal-body::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

.modal-body::-webkit-scrollbar-thumb {
  background: rgba(255, 215, 0, 0.3);
  border-radius: 4px;
}

.modal-body::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 215, 0, 0.5);
}

/* Transition */
.modal-enter-active {
  animation: modal-in 0.4s ease-out;
}

.modal-leave-active {
  animation: modal-out 0.3s ease-in;
}

@keyframes modal-in {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(50px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes modal-out {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.9) translateY(50px);
  }
}

/* Responsive */
@media (max-width: 600px) {
  .modal-content {
    max-width: 100%;
    border-radius: 16px;
  }

  .modal-header {
    padding: 20px;
  }

  .modal-header h2 {
    font-size: 20px;
  }

  .modal-body {
    padding: 15px 20px 20px;
  }

  .result-item {
    padding: 12px;
    gap: 10px;
  }

  .position-number {
    width: 40px;
    height: 40px;
    font-size: 16px;
  }

  .horse-color-indicator {
    width: 30px;
    height: 30px;
  }

  .horse-name {
    font-size: 14px;
  }

  .time-value {
    font-size: 16px;
  }
}
</style>
