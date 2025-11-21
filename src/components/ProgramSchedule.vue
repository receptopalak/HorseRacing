<template>
  <div class="program-modern">
    <div class="modern-header">
      <div class="header-icon">📋</div>
      <div class="header-text">
        <h3>Race Program</h3>
        <span class="program-count">{{ program.length }} Rounds</span>
      </div>
    </div>

    <div class="program-scroll">
      <transition-group name="list" tag="div" class="races-container">
        <div
          v-for="(race, index) in program"
          :key="`${race.round}-${race.status}-${race._updated || 0}`"
          class="race-card-modern"
          :class="{
            'race-active': race.round === currentRaceIndex + 1,
            'race-completed': race.status === 'completed',
            'race-running': race.status === 'running',
            'clickable': race.status === 'completed'
          }"
          :style="{ animationDelay: `${index * 0.05}s` }"
          @click="race.status === 'completed' ? openRaceModal(race) : null"
        >
          <div class="race-header-modern">
            <div class="race-round-badge">
              <span class="round-number">{{ race.round }}</span>
            </div>
            <div class="race-info-modern">
              <div class="race-name">{{ race.title }} - {{ race.distance }}m</div>
              <div class="race-meta">
                <span class="horse-count-badge">{{ race.horses.length }} 🐴</span>
              </div>
            </div>
            <div class="race-status-indicator">
              <div v-if="race.status === 'running'" class="status-badge status-live">
                <span class="status-dot"></span>
                LIVE
              </div>
              <div v-else-if="race.status === 'completed'" class="status-badge status-done">
                ✓
              </div>
              <div v-else class="status-badge status-pending">
                ⏱
              </div>
            </div>
          </div>

          <!-- Race Status Content -->
          <!-- LIVE STANDINGS - During race (only show for currently running race by index) -->
          <div
            v-if="isRacing && index === currentRaceIndex"
            :key="liveStandingsKey"
            class="live-standings-section"
          >
            <div class="race-info-header">
              <div class="race-title-live">{{ race.title }}</div>
              <div class="race-timer">⏱️ {{ currentRaceTime.toFixed(2) }}s</div>
            </div>
            <div class="live-standings-title">
              <span class="live-dot"></span>
              LIVE STANDINGS
            </div>
            <div
              v-for="(horse, hIndex) in getLiveStandings(race)"
              :key="horse.id"
              class="live-standing-item"
            >
              <div class="standing-position">{{ hIndex + 1 }}</div>
              <div class="standing-color" :style="{ backgroundColor: horse.color }"></div>
              <div class="standing-name">{{ horse.name }}</div>
              <div class="standing-progress">{{ horse.progress }}%</div>
            </div>
          </div>

          <!-- COMPLETED RESULTS - After race (show for all completed races) -->
          <div v-else-if="race.status === 'completed'" class="race-results-section">
            <div class="results-title">Race Results - Top 3</div>
            <div
              v-for="(ranking, rIndex) in getRaceResults(race).slice(0, 3)"
              :key="ranking.horse.id"
              class="result-item podium"
            >
              <div class="result-position" :class="getPositionClass(rIndex)">
                {{ rIndex + 1 }}
              </div>
              <div class="result-color" :style="{ backgroundColor: ranking.horse.color }"></div>
              <div class="result-info">
                <div class="result-name">{{ ranking.horse.name }}</div>
                <div class="result-time">{{ typeof ranking.time === 'string' ? ranking.time : ranking.time.toFixed(2) }}s</div>
              </div>
            </div>
            <div class="view-full-results" @click="openRaceModal(race)">
              📊 View Full Results (All {{ getRaceResults(race).length }} Horses) →
            </div>
          </div>

          <!-- PENDING - Before race -->
          <div v-else class="race-horses-preview">
            <div
              v-for="(horse, hIndex) in race.horses.slice(0, 5)"
              :key="horse.id"
              class="horse-preview"
              :style="{
                backgroundColor: horse.color,
                animationDelay: `${hIndex * 0.05}s`
              }"
            >
              <div class="preview-shine"></div>
            </div>
            <div v-if="race.horses.length > 5" class="more-horses">
              +{{ race.horses.length - 5 }}
            </div>
          </div>

        </div>
      </transition-group>

      <div v-if="program.length === 0" class="empty-state-modern">
        <div class="empty-icon">📋</div>
        <p>No program yet</p>
      </div>
    </div>

    <!-- Race Result Modal - Teleported to body for full-screen display -->
    <Teleport to="body">
      <RaceResultModal
        :show="showModal"
        :race-title="selectedRaceTitle"
        :rankings="selectedRaceRankings"
        @close="closeModal"
      />
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useStore } from 'vuex'
import RaceResultModal from './RaceResultModal.vue'

const store = useStore()

const program = computed(() => store.getters['races/program'])
const currentRaceIndex = computed(() => store.getters['races/currentRaceIndex'])
const allResults = computed(() => store.getters['results/allResults'])
const isRacing = computed(() => store.getters['races/isRacing'])
const racePositions = computed(() => store.getters['races/racePositions'])
const currentRaceTime = computed(() => store.getters['races/currentRaceTime'])

// Get the currently running race explicitly
const currentlyRunningRace = computed(() => {
  if (currentRaceIndex.value >= 0 && currentRaceIndex.value < program.value.length) {
    return program.value[currentRaceIndex.value]
  }
  return null
})

// Create a unique key that changes when race changes - forces re-render
const liveStandingsKey = computed(() => {
  return `live-${currentRaceIndex.value}-${isRacing.value ? 'racing' : 'idle'}`
})

// Auto-scroll to running race after countdown
watch(isRacing, async (newVal) => {
  if (newVal) {
    await nextTick()
    // Wait for countdown to finish (3, 2, 1, GO! = ~3 seconds)
    setTimeout(() => {
      const runningCard = document.querySelector('.race-running')
      if (runningCard) {
        // Scroll with offset to account for header
        const container = document.querySelector('.program-scroll')
        if (container) {
          const cardTop = runningCard.offsetTop
          const headerHeight = 120 // Account for "Race Program" header with padding
          container.scrollTo({
            top: cardTop - headerHeight,
            behavior: 'smooth'
          })
        }
      }
    }, 3000) // Wait 3 seconds for countdown to complete
  }
})

// Modal state
const showModal = ref(false)
const selectedRace = ref(null)

const selectedRaceTitle = computed(() => {
  return selectedRace.value ? selectedRace.value.title : ''
})

const selectedRaceRankings = computed(() => {
  if (!selectedRace.value) return []
  const result = allResults.value.find(r => r.raceRound === selectedRace.value.round)
  return result ? result.rankings : []
})

// Get live standings for running race
const getLiveStandings = (race) => {
  if (!race || !race.horses) {
    return []
  }

  const horsesWithProgress = race.horses.map(horse => {
    const position = racePositions.value[horse.id]
    // Cap display at 100% even though horses can go to 110% internally
    const progress = position ? Math.min(Math.round(position.progress * 100), 100) : 0
    return {
      ...horse,
      progress
    }
  })

  return horsesWithProgress
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 10) // All 10 horses
}

// Get race results for completed race
const getRaceResults = (race) => {
  if (!race) return []


  const result = allResults.value.find(r => r.raceRound === race.round)

  return result ? result.rankings : [] // All 10 horses
}

// Get position class for styling
const getPositionClass = (index) => {
  if (index === 0) return 'gold'
  if (index === 1) return 'silver'
  if (index === 2) return 'bronze'
  return ''
}

// Open race result modal
const openRaceModal = (race) => {
  selectedRace.value = race
  showModal.value = true
}

// Close modal
const closeModal = () => {
  showModal.value = false
  selectedRace.value = null
}
</script>

<style scoped>
.program-modern {
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
  background: linear-gradient(135deg, rgba(74, 144, 226, 0.2), rgba(106, 168, 255, 0.2));
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

.program-count {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 600;
}

.program-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 15px;
  background: rgba(15, 15, 26, 0.5);
}

.races-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.race-card-modern {
  background: rgba(30, 30, 50, 0.8) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 1 !important;
  animation: card-appear 0.5s forwards;
  position: relative;
}

@keyframes card-appear {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1 !important;
    transform: translateY(0);
  }
}

.race-card-modern:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 215, 0, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
}

.race-active {
  border-color: rgba(74, 144, 226, 0.6);
  box-shadow: 0 0 20px rgba(74, 144, 226, 0.3);
}

.race-running {
  border-color: rgba(255, 152, 0, 0.8);
  border-width: 3px;
  animation: running-pulse 2s ease-in-out infinite;
  box-shadow: 0 0 25px rgba(255, 152, 0, 0.6);
  transform: scale(1.02);
  background: rgba(50, 50, 70, 0.9) !important;
}

@keyframes running-pulse {
  0%, 100% {
    box-shadow: 0 0 20px rgba(255, 152, 0, 0.5);
    border-color: rgba(255, 152, 0, 0.8);
  }
  50% {
    box-shadow: 0 0 40px rgba(255, 152, 0, 0.9);
    border-color: rgba(255, 152, 0, 1);
  }
}

.race-completed {
  opacity: 0.85;
}

.race-card-modern.clickable {
  cursor: pointer;
}

.race-card-modern.clickable:hover {
  transform: translateY(-4px);
}

.race-header-modern {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px;
  position: relative;
}

.race-round-badge {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #4a90e2, #6aa8ff);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 18px;
  color: white;
  box-shadow: 0 4px 12px rgba(74, 144, 226, 0.4);
  flex-shrink: 0;
}

.race-running .race-round-badge {
  background: linear-gradient(135deg, #ff9800, #ffa726);
  animation: badge-glow 1.5s ease-in-out infinite;
}

@keyframes badge-glow {
  0%, 100% {
    box-shadow: 0 0 10px rgba(255, 152, 0, 0.5);
  }
  50% {
    box-shadow: 0 0 20px rgba(255, 152, 0, 0.8);
  }
}

.race-info-modern {
  flex: 1;
  min-width: 0;
}

.race-name {
  font-weight: 700;
  font-size: 14px;
  color: #ffffff !important;
  margin-bottom: 4px;
  opacity: 1 !important;
}

.race-meta {
  display: flex;
  gap: 8px;
  align-items: center;
}

.horse-count-badge {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 600;
}

.race-status-indicator {
  flex-shrink: 0;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-live {
  background: linear-gradient(135deg, rgba(255, 0, 0, 0.3), rgba(255, 87, 34, 0.3));
  color: #ff5252;
  animation: live-pulse 1.5s infinite;
}

.status-dot {
  width: 8px;
  height: 8px;
  background: #ff0000;
  border-radius: 50%;
  animation: dot-blink 1s infinite;
}

@keyframes dot-blink {
  0%, 50%, 100% { opacity: 1; }
  25%, 75% { opacity: 0.3; }
}

@keyframes live-pulse {
  0%, 100% {
    box-shadow: 0 0 5px rgba(255, 0, 0, 0.5);
  }
  50% {
    box-shadow: 0 0 15px rgba(255, 0, 0, 0.8);
  }
}

.status-done {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.3), rgba(67, 160, 71, 0.3));
  color: #66bb6a;
}

.status-pending {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.5);
}

.race-horses-preview {
  display: flex;
  gap: 4px;
  padding: 0 15px 15px;
  align-items: center;
}

.horse-preview {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;
  opacity: 0;
  animation: preview-appear 0.4s forwards;
}

@keyframes preview-appear {
  from {
    opacity: 0;
    transform: scale(0.5);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.preview-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  animation: preview-shine 2s infinite;
}

@keyframes preview-shine {
  0% { left: -100%; }
  100% { left: 150%; }
}

.more-horses {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.7);
}

/* Live Results */
.live-results {
  padding: 15px;
  background: linear-gradient(135deg, rgba(255, 152, 0, 0.3), rgba(255, 87, 34, 0.3)) !important;
  border-top: 3px solid rgba(255, 152, 0, 0.8);
  animation: live-glow 2s ease-in-out infinite;
  box-shadow: inset 0 2px 10px rgba(255, 152, 0, 0.4), 0 4px 20px rgba(255, 152, 0, 0.3);
  position: relative;
  z-index: 10;
  min-height: 100px;
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
}

@keyframes live-glow {
  0%, 100% {
    background: linear-gradient(135deg, rgba(255, 152, 0, 0.3), rgba(255, 87, 34, 0.3));
    box-shadow: inset 0 2px 10px rgba(255, 152, 0, 0.4), 0 4px 20px rgba(255, 152, 0, 0.3);
  }
  50% {
    background: linear-gradient(135deg, rgba(255, 152, 0, 0.5), rgba(255, 87, 34, 0.5));
    box-shadow: inset 0 2px 10px rgba(255, 152, 0, 0.6), 0 4px 20px rgba(255, 152, 0, 0.5);
  }
}

.live-results-title {
  font-size: 14px;
  font-weight: 900;
  color: #ffffff;
  letter-spacing: 1.5px;
  margin-bottom: 12px;
  text-align: center;
  text-shadow: 0 2px 8px rgba(255, 152, 0, 1);
  padding: 10px;
  background: rgba(255, 152, 0, 0.5);
  border-radius: 8px;
  border: 2px solid #ffa726;
}

.live-result-item {
  display: flex !important;
  align-items: center;
  gap: 10px;
  padding: 10px;
  font-size: 13px;
  background: rgba(0, 0, 0, 0.6) !important;
  border-radius: 8px;
  margin-bottom: 8px;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 152, 0, 0.3);
  min-height: 40px;
}

.live-result-item:hover {
  background: rgba(0, 0, 0, 0.5);
  transform: translateX(3px);
}

.live-result-item:last-child {
  margin-bottom: 0;
}

.live-pos {
  width: 30px;
  height: 30px;
  background: linear-gradient(135deg, rgba(255, 152, 0, 0.6), rgba(255, 87, 34, 0.6));
  border: 2px solid rgba(255, 152, 0, 0.8);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  color: #ffffff !important;
  font-size: 14px;
  flex-shrink: 0;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.5);
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
}

.live-result-item:first-of-type .live-pos {
  background: linear-gradient(135deg, #ffd700, #ffa500);
  border-color: #ffd700;
  color: #000;
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
}

.live-horse-color {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  border: 2px solid rgba(255, 255, 255, 0.8);
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
  opacity: 1 !important;
}

.live-horse-name {
  flex: 1;
  color: #ffffff !important;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 1);
  opacity: 1 !important;
  visibility: visible !important;
}

.live-progress {
  color: #ffffff !important;
  font-weight: 900;
  font-size: 14px;
  flex-shrink: 0;
  background: rgba(76, 175, 80, 0.6);
  padding: 6px 10px;
  border-radius: 6px;
  border: 2px solid rgba(76, 175, 80, 0.8);
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
}

.no-data {
  text-align: center;
  padding: 20px;
  color: #ffffff !important;
  font-size: 14px;
  font-weight: 700;
  font-style: italic;
  background: rgba(255, 0, 0, 0.3);
  border-radius: 8px;
  border: 2px solid rgba(255, 0, 0, 0.5);
}

/* Completed Preview */
.completed-preview {
  padding: 10px 15px;
  background: rgba(76, 175, 80, 0.05);
  border-top: 1px solid rgba(76, 175, 80, 0.2);
}

.completed-preview-text {
  text-align: center;
  font-size: 11px;
  color: #66bb6a;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.completed-icon {
  font-size: 14px;
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

/* Live Standings Section */
.live-standings-section {
  padding: 15px;
  background: linear-gradient(135deg, rgba(255, 152, 0, 0.3), rgba(255, 87, 34, 0.3));
  border-top: 2px solid rgba(255, 152, 0, 0.6);
}

.race-info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding: 10px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 8px;
  border: 1px solid rgba(255, 215, 0, 0.3);
}

.race-title-live {
  font-size: 14px;
  font-weight: 800;
  color: #ffd700;
  text-transform: uppercase;
  letter-spacing: 1px;
  text-shadow: 0 2px 8px rgba(255, 215, 0, 0.8);
  flex: 1;
}

.race-timer {
  font-size: 20px;
  font-weight: 900;
  color: #ffd700;
  text-shadow: 0 2px 10px rgba(255, 215, 0, 1);
  font-family: 'Courier New', monospace;
  letter-spacing: 2px;
  flex-shrink: 0;
  margin-left: 15px;
}

.live-standings-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 13px;
  font-weight: 900;
  color: #ffffff;
  letter-spacing: 1.5px;
  margin-bottom: 12px;
  padding: 8px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 6px;
}

.live-dot {
  width: 10px;
  height: 10px;
  background: #ff0000;
  border-radius: 50%;
  animation: live-blink 1.5s infinite;
  box-shadow: 0 0 10px #ff0000;
}

@keyframes live-blink {
  0%, 50%, 100% { opacity: 1; }
  25%, 75% { opacity: 0.3; }
}

.live-standing-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  margin-bottom: 6px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 6px;
  border: 1px solid rgba(255, 152, 0, 0.3);
}

.live-standing-item:last-child {
  margin-bottom: 0;
}

.standing-position {
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, #ff9800, #ff5722);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 900;
  color: #ffffff;
  flex-shrink: 0;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
}

.standing-color {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 2px solid rgba(255, 255, 255, 0.6);
  flex-shrink: 0;
}

.standing-name {
  flex: 1;
  font-size: 12px;
  font-weight: 700;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.standing-progress {
  font-size: 12px;
  font-weight: 900;
  color: #ffffff;
  background: rgba(76, 175, 80, 0.6);
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid rgba(76, 175, 80, 0.8);
  flex-shrink: 0;
}

/* Race Results Section */
.race-results-section {
  padding: 15px;
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.2), rgba(67, 160, 71, 0.2));
  border-top: 2px solid rgba(76, 175, 80, 0.6);
}

.results-title {
  font-size: 13px;
  font-weight: 900;
  color: #66bb6a;
  letter-spacing: 1.5px;
  margin-bottom: 12px;
  text-align: center;
  padding: 8px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 6px;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  margin-bottom: 6px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 6px;
  border: 1px solid rgba(76, 175, 80, 0.3);
}

.result-item.podium {
  background: rgba(0, 0, 0, 0.5);
}

.result-item:last-child {
  margin-bottom: 0;
}

.result-position {
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, #888, #666);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 900;
  color: #ffffff;
  flex-shrink: 0;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
}

.result-position.gold {
  background: linear-gradient(135deg, #ffd700, #ffa500);
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.6);
}

.result-position.silver {
  background: linear-gradient(135deg, #c0c0c0, #a8a8a8);
  box-shadow: 0 0 10px rgba(192, 192, 192, 0.6);
}

.result-position.bronze {
  background: linear-gradient(135deg, #cd7f32, #b8792c);
  box-shadow: 0 0 10px rgba(205, 127, 50, 0.6);
}

.result-color {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 2px solid rgba(255, 255, 255, 0.6);
  flex-shrink: 0;
}

.result-info {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-width: 0;
}

.result-name {
  font-size: 12px;
  font-weight: 700;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.result-time {
  font-size: 11px;
  font-weight: 700;
  color: #66bb6a;
  background: rgba(76, 175, 80, 0.3);
  padding: 4px 8px;
  border-radius: 4px;
  flex-shrink: 0;
  margin-left: 8px;
}

.view-full-results {
  margin-top: 10px;
  text-align: center;
  font-size: 12px;
  font-weight: 700;
  color: #66bb6a;
  padding: 8px;
  background: rgba(76, 175, 80, 0.2);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.view-full-results:hover {
  background: rgba(76, 175, 80, 0.4);
  transform: translateY(-2px);
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
  transform: translateY(30px);
}

.list-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}
</style>
