<template>
  <transition name="final-results">
    <div v-if="show" class="final-results-overlay">
      <div class="final-results-container">
        <div class="results-header">
          <div class="trophy-animation">🏆</div>
          <h1 class="main-title">RACE DAY COMPLETE!</h1>
          <p class="subtitle">All 6 Races Finished - Final Standings</p>
        </div>

        <div class="results-content">
          <!-- Overall Winners Podium -->
          <div class="winners-section">
            <h2 class="section-title">🥇 Top 3 Overall Winners</h2>
            <div class="podium">
              <div
                v-for="(horse, index) in topThreeHorses"
                :key="horse.id"
                class="podium-card"
                :class="`position-${index + 1}`"
              >
                <div class="podium-rank">
                  <span v-if="index === 0">🥇</span>
                  <span v-else-if="index === 1">🥈</span>
                  <span v-else>🥉</span>
                </div>
                <div
                  class="horse-color-badge"
                  :style="{ backgroundColor: horse.color }"
                ></div>
                <div class="horse-info">
                  <div class="horse-name">{{ horse.name }}</div>
                  <div class="horse-stats">
                    <span class="stat">Avg Time: {{ horse.avgTime }}s</span>
                    <span class="stat">Races: {{ horse.racesCount }}</span>
                    <span class="stat">Wins: {{ horse.wins }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Detailed Results Table -->
          <div class="table-section">
            <h2 class="section-title">📊 Detailed Results by Race</h2>
            <div class="table-wrapper">
              <table class="results-table">
                <thead>
                  <tr>
                    <th class="rank-col">Rank</th>
                    <th class="horse-col">Horse</th>
                    <th class="color-col">Color</th>
                    <th v-for="(race, index) in races" :key="index" class="race-col">
                      Race {{ index + 1 }}
                    </th>
                    <th class="avg-col">Average</th>
                    <th class="wins-col">Wins</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(horse, index) in rankedHorses"
                    :key="horse.id"
                    class="horse-row"
                    :class="{ 'top-three': index < 3 }"
                  >
                    <td class="rank-cell">
                      <span class="rank-badge">{{ index + 1 }}</span>
                    </td>
                    <td class="horse-name-cell">{{ horse.name }}</td>
                    <td class="color-cell">
                      <div
                        class="color-indicator"
                        :style="{ backgroundColor: horse.color }"
                      ></div>
                    </td>
                    <td
                      v-for="(time, raceIndex) in horse.raceTimes"
                      :key="raceIndex"
                      class="time-cell"
                      :class="{ 'winner-time': time && time.isWinner }"
                    >
                      <span v-if="time">{{ time.value }}s</span>
                      <span v-else class="no-race">-</span>
                    </td>
                    <td class="avg-cell">{{ horse.avgTime }}s</td>
                    <td class="wins-cell">{{ horse.wins }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="actions-footer">
          <button class="action-btn close-btn" @click="closeResults">
            Close Results
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  session: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close'])
const store = useStore()

// Get all races and results - either from session prop or from store
const races = computed(() => {
  if (props.session) {
    return props.session.program || []
  }
  return store.getters['races/program']
})

const allResults = computed(() => {
  if (props.session) {
    return props.session.results || []
  }
  return store.getters['results/allResults']
})

const allHorses = computed(() => {
  if (props.session) {
    return props.session.horses || []
  }
  return store.getters['horses/allHorses']
})

// Build horse statistics across all races
const rankedHorses = computed(() => {
  if (!allHorses.value || allHorses.value.length === 0) return []

  const horseStats = allHorses.value.map(horse => {
    const raceTimes = []
    let totalTime = 0
    let racesCount = 0
    let wins = 0

    // Check each race for this horse's results
    races.value.forEach((race, raceIndex) => {
      const result = allResults.value.find(r => r.raceRound === race.round)
      if (result) {
        const ranking = result.rankings.find(r => r.horse && r.horse.id === horse.id)
        if (ranking) {
          const time = parseFloat(ranking.time)
          raceTimes.push({
            value: time.toFixed(2),
            isWinner: ranking.position === 1
          })
          totalTime += time
          racesCount++
          if (ranking.position === 1) wins++
        } else {
          raceTimes.push(null)
        }
      } else {
        raceTimes.push(null)
      }
    })

    return {
      id: horse.id,
      name: horse.name,
      color: horse.color,
      raceTimes,
      avgTime: racesCount > 0 ? (totalTime / racesCount).toFixed(2) : '-',
      racesCount,
      wins
    }
  })

  // Sort by average time (fastest first), then by wins
  return horseStats
    .filter(h => h.racesCount > 0) // Only include horses that raced
    .sort((a, b) => {
      const avgA = parseFloat(a.avgTime)
      const avgB = parseFloat(b.avgTime)
      if (avgA !== avgB) return avgA - avgB
      return b.wins - a.wins
    })
})

const topThreeHorses = computed(() => rankedHorses.value.slice(0, 3))

const closeResults = () => {
  emit('close')
}
</script>

<style scoped>
.final-results-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(20px);
  z-index: 200000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  overflow-y: auto;
}

.final-results-container {
  background: linear-gradient(135deg, rgba(26, 26, 46, 0.98) 0%, rgba(15, 15, 26, 0.98) 100%);
  border: 2px solid rgba(255, 215, 0, 0.4);
  border-radius: 20px;
  max-width: 1400px;
  width: 100%;
  max-height: 95vh;
  overflow-y: auto;
  box-shadow: 0 25px 70px rgba(0, 0, 0, 0.9);
}

.results-header {
  text-align: center;
  padding: 40px 30px 30px;
  border-bottom: 2px solid rgba(255, 215, 0, 0.3);
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.15), transparent);
}

.trophy-animation {
  font-size: 80px;
  margin-bottom: 20px;
  animation: trophy-spin 2s ease-in-out infinite;
}

@keyframes trophy-spin {
  0%, 100% { transform: rotate(-10deg) scale(1); }
  50% { transform: rotate(10deg) scale(1.1); }
}

.main-title {
  font-size: 48px;
  font-weight: 900;
  background: linear-gradient(135deg, #ffd700, #ffa500, #ff6b6b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 10px 0;
  letter-spacing: 4px;
  text-transform: uppercase;
}

.subtitle {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  font-weight: 600;
}

.results-content {
  padding: 30px;
}

.winners-section {
  margin-bottom: 40px;
}

.section-title {
  font-size: 24px;
  font-weight: 800;
  color: #ffd700;
  margin: 0 0 20px 0;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.podium {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}

.podium-card {
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 20px;
  min-width: 280px;
  display: flex;
  align-items: center;
  gap: 15px;
  animation: podium-appear 0.6s ease-out;
}

@keyframes podium-appear {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.podium-card.position-1 {
  border-color: #ffd700;
  box-shadow: 0 0 30px rgba(255, 215, 0, 0.4);
  animation-delay: 0.1s;
}

.podium-card.position-2 {
  border-color: #c0c0c0;
  box-shadow: 0 0 25px rgba(192, 192, 192, 0.3);
  animation-delay: 0.2s;
}

.podium-card.position-3 {
  border-color: #cd7f32;
  box-shadow: 0 0 20px rgba(205, 127, 50, 0.3);
  animation-delay: 0.3s;
}

.podium-rank {
  font-size: 48px;
}

.horse-color-badge {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 15px currentColor;
}

.horse-info {
  flex: 1;
}

.horse-name {
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 8px;
}

.horse-stats {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.stat {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 600;
}

.table-section {
  margin-top: 40px;
}

.table-wrapper {
  overflow-x: auto;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.results-table {
  width: 100%;
  border-collapse: collapse;
  background: rgba(255, 255, 255, 0.02);
}

.results-table thead {
  background: rgba(255, 215, 0, 0.1);
  border-bottom: 2px solid rgba(255, 215, 0, 0.3);
}

.results-table th {
  padding: 15px 10px;
  text-align: left;
  font-size: 13px;
  font-weight: 800;
  color: #ffd700;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.results-table th.rank-col {
  width: 60px;
  text-align: center;
}

.results-table th.color-col {
  width: 70px;
  text-align: center;
}

.results-table th.race-col {
  text-align: center;
  min-width: 80px;
}

.results-table th.avg-col {
  text-align: center;
  min-width: 90px;
}

.results-table th.wins-col {
  width: 70px;
  text-align: center;
}

.horse-row {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
}

.horse-row:hover {
  background: rgba(255, 255, 255, 0.05);
}

.horse-row.top-three {
  background: rgba(255, 215, 0, 0.05);
}

.results-table td {
  padding: 12px 10px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
}

.rank-cell {
  text-align: center;
}

.rank-badge {
  display: inline-block;
  width: 30px;
  height: 30px;
  line-height: 30px;
  background: rgba(255, 215, 0, 0.2);
  border: 1px solid rgba(255, 215, 0, 0.4);
  border-radius: 8px;
  font-weight: 700;
  font-size: 14px;
}

.horse-name-cell {
  font-weight: 700;
  color: #fff;
}

.color-cell {
  text-align: center;
}

.color-indicator {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  margin: 0 auto;
  box-shadow: 0 2px 8px currentColor;
}

.time-cell {
  text-align: center;
  font-weight: 600;
  color: #4caf50;
}

.time-cell.winner-time {
  color: #ffd700;
  font-weight: 800;
}

.no-race {
  color: rgba(255, 255, 255, 0.3);
  font-size: 16px;
}

.avg-cell {
  text-align: center;
  font-weight: 800;
  color: #00bcd4;
  font-size: 15px;
}

.wins-cell {
  text-align: center;
  font-weight: 700;
  color: #ffd700;
}

.actions-footer {
  padding: 20px 30px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
}

.action-btn {
  padding: 12px 30px;
  font-size: 16px;
  font-weight: 700;
  border: 2px solid rgba(255, 215, 0, 0.5);
  background: rgba(255, 215, 0, 0.1);
  color: #ffd700;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.action-btn:hover {
  background: rgba(255, 215, 0, 0.2);
  border-color: #ffd700;
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(255, 215, 0, 0.3);
}

/* Scrollbar */
.final-results-container::-webkit-scrollbar {
  width: 10px;
}

.final-results-container::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 5px;
}

.final-results-container::-webkit-scrollbar-thumb {
  background: rgba(255, 215, 0, 0.3);
  border-radius: 5px;
}

.final-results-container::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 215, 0, 0.5);
}

/* Transition */
.final-results-enter-active {
  animation: final-in 0.6s ease-out;
}

.final-results-leave-active {
  animation: final-out 0.4s ease-in;
}

@keyframes final-in {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes final-out {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.9);
  }
}

/* Responsive */
@media (max-width: 1200px) {
  .main-title {
    font-size: 36px;
  }

  .podium {
    flex-direction: column;
    align-items: center;
  }

  .podium-card {
    width: 100%;
    max-width: 400px;
  }
}

@media (max-width: 768px) {
  .main-title {
    font-size: 28px;
  }

  .results-table {
    font-size: 12px;
  }

  .results-table th,
  .results-table td {
    padding: 8px 5px;
  }
}
</style>
