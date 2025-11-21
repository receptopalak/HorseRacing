<template>
  <div class="horse-list-modern">
    <div class="modern-header">
      <div class="header-icon">🐴</div>
      <div class="header-text">
        <h3>Horse Pool</h3>
        <span class="horse-count">{{ horseCount }} / 20 Horses</span>
      </div>
    </div>

    <div class="horse-list-scroll">
      <transition-group name="list" tag="div" class="horses-container">
        <div
          v-for="(horse, index) in horses"
          :key="horse.id"
          class="horse-card-modern"
          :style="{ animationDelay: `${index * 0.03}s` }"
        >
          <div class="horse-number-badge">{{ horse.id }}</div>
          <div class="horse-details">
            <div class="horse-name-modern">{{ horse.name }}</div>
            <div class="horse-stats">
              <div class="stat-item">
                <span class="stat-label">Condition</span>
                <div class="condition-bar">
                  <div
                    class="condition-fill"
                    :style="{
                      width: horse.condition + '%',
                      backgroundColor: getConditionColor(horse.condition)
                    }"
                  ></div>
                  <span class="condition-value">{{ horse.condition }}%</span>
                </div>
              </div>
            </div>
          </div>
          <div
            class="horse-color-badge"
            :style="{ backgroundColor: horse.color }"
          >
            <div class="color-shine"></div>
          </div>
        </div>
      </transition-group>

      <div v-if="horses.length === 0" class="empty-state-modern">
        <div class="empty-icon">🏇</div>
        <p>Click "GENERATE" to create horses</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

const horses = computed(() => store.getters['horses/allHorses'])
const horseCount = computed(() => store.getters['horses/horseCount'])

const getConditionColor = (condition) => {
  if (condition >= 80) return '#4caf50'
  if (condition >= 60) return '#ffc107'
  if (condition >= 40) return '#ff9800'
  return '#f44336'
}
</script>

<style scoped>
.horse-list-modern {
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  z-index: 1;
}

.modern-header {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2));
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
}

.modern-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  animation: header-shine 3s infinite;
}

@keyframes header-shine {
  0% { left: -100%; }
  100% { left: 100%; }
}

.header-icon {
  font-size: 32px;
}

.header-text h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: 0.5px;
}

.horse-count {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 600;
}

.horse-list-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 15px;
}

.horses-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.horse-card-modern {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0;
  animation: card-appear 0.5s forwards;
}

@keyframes card-appear {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.horse-card-modern:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 215, 0, 0.3);
  transform: translateX(5px);
  box-shadow: 0 4px 15px rgba(255, 215, 0, 0.15);
}

.horse-number-badge {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 14px;
  box-shadow: 0 2px 10px rgba(102, 126, 234, 0.3);
  flex-shrink: 0;
}

.horse-details {
  flex: 1;
  min-width: 0;
}

.horse-name-modern {
  font-weight: 700;
  font-size: 14px;
  color: #ffffff;
  margin-bottom: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.horse-stats {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.5);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.condition-bar {
  position: relative;
  width: 100%;
  height: 18px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 9px;
  overflow: hidden;
}

.condition-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  border-radius: 9px;
  transition: width 0.5s ease, background-color 0.3s ease;
  box-shadow: 0 0 10px currentColor;
}

.condition-value {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 10px;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
}

.horse-color-badge {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
}

.color-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  animation: shine-move 2s infinite;
}

@keyframes shine-move {
  0% { left: -100%; }
  100% { left: 150%; }
}

.empty-state-modern {
  text-align: center;
  padding: 60px 20px;
  color: rgba(255, 255, 255, 0.5);
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 15px;
}

.empty-state-modern p {
  font-size: 14px;
  font-weight: 500;
}

/* Transitions */
.list-enter-active {
  transition: all 0.5s ease;
}

.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
