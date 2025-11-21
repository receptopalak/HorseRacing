<template>
  <div class="race-track-modern">
    <!-- TV Broadcast Header -->
    <div class="broadcast-header" v-if="currentRace">
      <div class="broadcast-header-content">
        <div class="race-info-left">
          <div class="live-indicator" v-if="isRacing">
            <span class="live-dot"></span>
            <span class="live-text">LIVE</span>
          </div>
          <div class="race-title-main">
            <h2>{{ currentRace.title }}</h2>
            <p class="race-subtitle">{{ currentRace.horses.length }} Horses Racing</p>
          </div>
        </div>
        <div class="race-info-right">
          <div class="distance-badge">
            <span class="badge-label">DISTANCE</span>
            <span class="badge-value">{{ currentRace.distance }}m</span>
          </div>
          <div class="status-badge" :class="statusClass">
            <span v-if="isRacing">IN PROGRESS</span>
            <span v-else-if="currentRace.status === 'completed'">FINISHED</span>
            <span v-else>READY TO START</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Race Track Visualization -->
    <div class="track-visualization" v-if="currentRace">
      <div class="track-container">
        <!-- Sky background -->
        <div class="sky-background"></div>

        <!-- Track lanes -->
        <div class="lanes-container">
          <div
            v-for="(horse, index) in currentRace.horses"
            :key="horse.id"
            class="race-lane"
            :style="{ animationDelay: `${index * 0.1}s` }"
          >
            <!-- Lane number -->
            <div class="lane-info">
              <div class="lane-number">{{ index + 1 }}</div>
              <div class="horse-info-compact">
                <div class="horse-name-track">{{ horse.name }}</div>
                <div class="horse-condition-track">{{ horse.condition }}%</div>
              </div>
            </div>

            <!-- Track line with grass texture -->
            <div class="track-line">
              <div class="grass-texture"></div>
              <div class="track-markers"></div>

              <!-- Horse runner -->
              <div
                class="horse-runner-container"
                :style="{
                  left: getHorsePosition(horse.id) + '%',
                  transition: isRacing ? 'left 0.15s linear' : 'none'
                }"
              >
                <div class="horse-shadow"></div>
                <div class="horse-runner" :style="{ '--horse-color': horse.color }">
                  <HorseIcon
                    :key="`horse-${horse.id}-${isRacing ? 'racing' : 'idle'}`"
                    :color="horse.color"
                    :isRunning="isRacing"
                  />
                </div>
                <!-- Dust effect when running -->
                <div class="dust-effect" v-if="isRacing && getHorsePosition(horse.id) > 0">
                  <span class="dust-particle"></span>
                  <span class="dust-particle"></span>
                  <span class="dust-particle"></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Finish line -->
        <div class="finish-line-modern">
          <div class="finish-flag"></div>
          <div class="finish-text">FINISH</div>
        </div>

        <!-- Progress bar as track lane -->
        <div class="progress-lane" v-if="isRacing">
          <div class="progress-lane-info">
            <div class="progress-icon">📊</div>
          </div>
          <div class="progress-track-line">
            <div class="grass-texture"></div>
            <div class="track-markers"></div>
            <div class="progress-fill-overlay" :style="{ width: raceProgress + '%' }"></div>
            <div class="progress-percentage">{{ Math.round(raceProgress) }}%</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="empty-track-modern">
      <div class="empty-content">
        <div class="empty-icon">🏇</div>
        <h3>No Active Race</h3>
        <p>Click "GENERATE PROGRAM" to create races</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import HorseIcon from './HorseIcon.vue'

const store = useStore()

const currentRace = computed(() => store.getters['races/currentRace'])
const isRacing = computed(() => store.getters['races/isRacing'])
const racePositions = computed(() => store.getters['races/racePositions'])

const statusClass = computed(() => {
  if (isRacing.value) return 'status-racing'
  if (currentRace.value?.status === 'completed') return 'status-completed'
  return 'status-ready'
})

const getHorsePosition = (horseId) => {
  const position = racePositions.value[horseId]
  if (!position) return 0
  // Position by front of horse (right edge), but clamp to not go behind start
  // Subtract 50px offset so front reaches finish at 100%, but ensure minimum is 0
  const progressPercent = position.progress * 100
  return Math.max(0, progressPercent - 5) // -5% accounts for horse width
}

const raceProgress = computed(() => {
  if (!currentRace.value) return 0
  const positions = Object.values(racePositions.value)
  if (positions.length === 0) return 0
  const maxProgress = Math.max(...positions.map(p => p.progress))
  return Math.min(maxProgress * 100, 100)
})
</script>

<style scoped>
.race-track-modern {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #7e8ba3 100%);
  position: relative;
  overflow: hidden;
}

/* Broadcast Header */
.broadcast-header {
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(20, 20, 40, 0.95) 100%);
  backdrop-filter: blur(10px);
  border-bottom: 3px solid #ffd700;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  z-index: 10;
}

.broadcast-header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  position: relative;
}

.broadcast-header-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, #ffd700, transparent);
  animation: shimmer 3s infinite;
}

@keyframes shimmer {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

.race-info-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.live-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(255, 0, 0, 0.2);
  border: 2px solid #ff0000;
  border-radius: 20px;
  animation: pulse-glow 2s infinite;
}

.live-dot {
  width: 12px;
  height: 12px;
  background: #ff0000;
  border-radius: 50%;
  animation: blink-live 2s infinite;
  box-shadow: 0 0 10px #ff0000;
}

@keyframes blink-live {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 5px rgba(255, 0, 0, 0.5);
  }
  50% {
    box-shadow: 0 0 20px rgba(255, 0, 0, 0.8);
  }
}

.live-text {
  color: #ff0000;
  font-weight: bold;
  font-size: 14px;
  letter-spacing: 1px;
}

.race-title-main h2 {
  margin: 0;
  font-size: 28px;
  font-weight: 800;
  color: #ffffff;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  letter-spacing: 1px;
}

.race-subtitle {
  margin: 4px 0 0 0;
  font-size: 14px;
  color: #a0a0a0;
  font-weight: 500;
}

.race-info-right {
  display: flex;
  gap: 15px;
  align-items: center;
}

.distance-badge, .status-badge {
  padding: 12px 20px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.distance-badge {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 215, 0, 0.1));
  border: 2px solid rgba(255, 215, 0, 0.5);
}

.badge-label {
  font-size: 10px;
  color: #ffd700;
  font-weight: 600;
  letter-spacing: 1px;
}

.badge-value {
  font-size: 20px;
  font-weight: 800;
  color: #ffffff;
  margin-top: 2px;
}

.status-badge {
  padding: 12px 24px;
  font-weight: bold;
  font-size: 13px;
  letter-spacing: 1px;
  text-align: center;
}

.status-racing {
  background: linear-gradient(135deg, rgba(255, 152, 0, 0.3), rgba(255, 87, 34, 0.3));
  border: 2px solid #ff9800;
  color: #ffa726;
}

.status-completed {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.3), rgba(67, 160, 71, 0.3));
  border: 2px solid #4caf50;
  color: #66bb6a;
}

.status-ready {
  background: linear-gradient(135deg, rgba(156, 39, 176, 0.3), rgba(142, 36, 170, 0.3));
  border: 2px solid #9c27b0;
  color: #ba68c8;
}

/* Track Visualization */
.track-visualization {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.track-container {
  height: 100%;
  position: relative;
  padding: 20px;
}

.sky-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 40%;
  background: linear-gradient(180deg, #87CEEB 0%, #B0D9F1 100%);
  opacity: 0.3;
}

.lanes-container {
  display: flex;
  flex-direction: column;
  gap: 4px;
  height: calc(100% - 70px);
  width: calc(100% - 70px);
  position: relative;
  z-index: 1;
  padding-bottom: 10px;
}

.race-lane {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-height: 0;
  opacity: 0;
  animation: lane-appear 0.5s forwards;
}

@keyframes lane-appear {
  from {
    opacity: 0;
    transform: translateX(-50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.lane-info {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 190px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  padding: 6px 12px;
  border-radius: 10px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  flex-shrink: 0;
}

.lane-number {
  min-width: 34px;
  height: 34px;
  padding: 0 6px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  border-radius: 17px;
  font-size: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  flex-shrink: 0;
}

.horse-info-compact {
  flex: 1;
  min-width: 0;
}

.horse-name-track {
  font-weight: 700;
  font-size: 12px;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.horse-condition-track {
  font-size: 10px;
  color: #4caf50;
  font-weight: 600;
}

.track-line {
  flex: 1;
  height: 100%;
  position: relative;
  background: linear-gradient(180deg, #2d5016 0%, #3a6b1f 50%, #2d5016 100%);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.1);
}

.grass-texture {
  position: absolute;
  inset: 0;
  background-image: repeating-linear-gradient(
    90deg,
    transparent,
    transparent 10px,
    rgba(0, 0, 0, 0.05) 10px,
    rgba(0, 0, 0, 0.05) 11px
  );
}

.track-markers {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 2px;
  background: repeating-linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.3) 0px,
    rgba(255, 255, 255, 0.3) 15px,
    transparent 15px,
    transparent 30px
  );
}

.horse-runner-container {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 50px;
  height: 50px;
  z-index: 2;
}

.horse-shadow {
  position: absolute;
  bottom: -5px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 8px;
  background: radial-gradient(ellipse, rgba(0, 0, 0, 0.4), transparent);
  filter: blur(3px);
}

.horse-runner {
  width: 50px;
  height: 50px;
  position: relative;
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.4));
}

.dust-effect {
  position: absolute;
  bottom: 0;
  left: -10px;
  display: flex;
  gap: 5px;
}

.dust-particle {
  width: 8px;
  height: 8px;
  background: rgba(160, 120, 80, 0.4);
  border-radius: 50%;
  animation: dust-fly 0.6s infinite;
}

.dust-particle:nth-child(2) { animation-delay: 0.1s; }
.dust-particle:nth-child(3) { animation-delay: 0.2s; }

@keyframes dust-fly {
  0% {
    opacity: 0.8;
    transform: translate(0, 0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(-20px, -10px) scale(0.3);
  }
}

/* Finish Line */
.finish-line-modern {
  position: absolute;
  left: calc(100% - 90px);
  top: 20px;
  bottom: 15px;
  width: 90px;
  background: repeating-linear-gradient(
    45deg,
    #000,
    #000 15px,
    #fff 15px,
    #fff 30px
  );
  border: 3px solid #ffd700;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  padding-bottom: 15px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  z-index: 10;
}

.finish-flag {
  position: absolute;
  top: 15px;
  width: 40px;
  height: 40px;
  background: repeating-linear-gradient(
    45deg,
    #000,
    #000 8px,
    #fff 8px,
    #fff 16px
  );
  border: 2px solid #ffd700;
  border-radius: 4px;
  animation: flag-wave 1s infinite;
}

@keyframes flag-wave {
  0%, 100% { transform: rotate(-5deg); }
  50% { transform: rotate(5deg); }
}

.finish-text {
  font-weight: 800;
  font-size: 13px;
  color: #ffd700;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  writing-mode: vertical-rl;
  text-orientation: mixed;
  letter-spacing: 2px;
}

/* Progress Lane (11th lane style) */
.progress-lane {
  position: absolute;
  bottom: 15px;
  left: 20px;
  width: calc(100% - 110px);
  height: 50px;
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 5;
  animation: lane-appear 0.5s forwards;
  animation-delay: 1s;
  opacity: 0;
}

.progress-lane-info {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 190px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  padding: 6px 12px;
  border-radius: 10px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  flex-shrink: 0;
}

.progress-icon {
  font-size: 24px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.progress-track-line {
  flex: 1;
  height: 100%;
  position: relative;
  background: linear-gradient(180deg, #2d5016 0%, #3a6b1f 50%, #2d5016 100%);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.1);
}

.progress-fill-overlay {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: linear-gradient(180deg, #4caf50 0%, #66bb6a 50%, #4caf50 100%);
  transition: width 0.15s linear;
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.2);
  z-index: 1;
}

.progress-fill-overlay::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  animation: progress-shine 2s infinite;
}

@keyframes progress-shine {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.progress-percentage {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-weight: 800;
  font-size: 16px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.9);
  z-index: 2;
  background: rgba(0, 0, 0, 0.5);
  padding: 4px 12px;
  border-radius: 20px;
  backdrop-filter: blur(5px);
}

/* Empty State */
.empty-track-modern {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.empty-content {
  text-align: center;
  color: white;
}

.empty-icon {
  font-size: 80px;
  margin-bottom: 20px;
}

.empty-content h3 {
  font-size: 28px;
  margin: 0 0 10px 0;
  font-weight: 700;
}

.empty-content p {
  font-size: 16px;
  opacity: 0.9;
}
</style>
