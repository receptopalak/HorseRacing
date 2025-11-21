<template>
  <div class="race-view">
    <!-- Modern Header with Glassmorphism -->
    <header class="app-header-modern">
      <div class="header-bg-animation"></div>
      <div class="header-content">
        <div class="brand">
          <div class="brand-icon">🏇</div>
          <div class="brand-text">
            <h1>{{ currentSession?.name || 'HORSE RACING' }}</h1>
            <p class="brand-subtitle">{{ currentSession ? 'Race Session' : 'Championship Series' }}</p>
          </div>
        </div>
        <div class="controls-modern">
          <button
            class="btn-modern btn-menu"
            @click="handleBackToMenu"
          >
            <span class="btn-icon">🏠</span>
            <span class="btn-text">
              <span class="btn-label">MENU</span>
              <span class="btn-sublabel">Back to Menu</span>
            </span>
          </button>
          <div class="btn-wrapper" :title="canRegenerate ? 'Generate new horses and races' : 'Cannot regenerate after races have started'">
            <button
              class="btn-modern btn-generate"
              @click="handleRegenerate"
              :disabled="!canRegenerate || isRacing"
            >
              <span class="btn-icon">🔄</span>
              <span class="btn-text">
                <span class="btn-label">GENERATE</span>
                <span class="btn-sublabel">New Horses & Races</span>
              </span>
            </button>
          </div>
          <button
            class="btn-modern btn-start"
            @click="handleStartRace"
            :disabled="!canStartRace || isRacing"
            :class="{ 'btn-pulse': canStartRace && !isRacing }"
          >
            <span class="btn-icon">▶</span>
            <span class="btn-text">
              <span class="btn-label">{{ hasCompletedRaces ? 'CONTINUE RACES' : 'START RACES' }}</span>
              <span class="btn-sublabel">{{ hasCompletedRaces ? 'Continue Championship' : 'Begin Championship' }}</span>
            </span>
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <div class="app-content-modern">
      <!-- Left Sidebar -->
      <aside class="sidebar-modern sidebar-left">
        <div class="sidebar-glow"></div>
        <HorseList />
      </aside>

      <!-- Center: Race Track -->
      <main class="main-content-modern">
        <RaceTrack />
      </main>

      <!-- Right Sidebar -->
      <aside class="sidebar-modern sidebar-right">
        <div class="sidebar-glow"></div>
        <ProgramSchedule />
      </aside>
    </div>

    <!-- Winners Announcement -->
    <WinnersAnnouncement
      :show="showAnnouncement"
      :winners="announcementWinners"
      :race-title="announcementRaceTitle"
      :duration="3000"
      @complete="handleAnnouncementComplete"
    />

    <!-- Race Countdown -->
    <RaceCountdown
      :show="showCountdown"
      @complete="handleCountdownComplete"
    />

    <!-- Final Results Screen -->
    <FinalResultsScreen
      :show="allRacesComplete"
      @close="handleCloseFinalResults"
    />

    <!-- Interruption Modal -->
    <InterruptionModal :show="showInterruptionModal" />
  </div>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import HorseList from '@/components/HorseList.vue'
import RaceTrack from '@/components/RaceTrack.vue'
import ProgramSchedule from '@/components/ProgramSchedule.vue'
import WinnersAnnouncement from '@/components/WinnersAnnouncement.vue'
import RaceCountdown from '@/components/RaceCountdown.vue'
import FinalResultsScreen from '@/components/FinalResultsScreen.vue'
import InterruptionModal from '@/components/InterruptionModal.vue'

const store = useStore()
const router = useRouter()

// Save session before page unload/refresh
const handleBeforeUnload = (event) => {
  const currentSession = store.getters['sessions/currentSession']
  const hasStartedAnyRace = store.getters['races/hasStartedAnyRace']

  // Only save and mark as interrupted if at least one race has started
  if (currentSession && hasStartedAnyRace && store.getters['races/isRacing']) {
    // Update session progress (race will restart from beginning if interrupted)
    const horses = store.getters['horses/allHorses']
    const program = store.getters['races/program']
    const results = store.getters['results/allResults']
    const currentRaceIndex = store.getters['races/currentRaceIndex']

    store.dispatch('sessions/updateSessionProgress', {
      horses,
      program,
      results,
      currentRaceIndex
      // No racePositions - interrupted races restart from 0%
    })

    // Mark as interrupted
    store.dispatch('sessions/interruptCurrentSession')
  }
}

onMounted(() => {
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
  // Ensure race is paused/stopped when component is destroyed
  if (store.getters['races/isRacing']) {
    store.commit('races/PAUSE_RACING')
  }
})

const isRacing = computed(() => store.getters['races/isRacing'])
const canStartRace = computed(() => store.getters.canStartRace)
const programGenerated = computed(() => store.getters['races/programGenerated'])
const showAnnouncement = computed(() => store.getters['races/showAnnouncement'])
const lastRaceResult = computed(() => store.getters['races/lastRaceResult'])
const showCountdown = computed(() => store.getters['races/showCountdown'])
const allRacesComplete = computed(() => store.getters['races/allRacesComplete'])
const showInterruptionModal = computed(() => store.getters.showInterruptionModal)
const canRegenerate = computed(() => store.getters['races/canRegenerate'])
const currentSession = computed(() => store.getters['sessions/currentSession'])
const hasCompletedRaces = computed(() => store.getters['races/completedRaces'] > 0)

const announcementWinners = computed(() => {
  if (!lastRaceResult.value) return []
  return lastRaceResult.value.rankings.slice(0, 3)
})

const announcementRaceTitle = computed(() => {
  if (!lastRaceResult.value) return ''
  return lastRaceResult.value.raceTitle
})

const handleAnnouncementComplete = () => {
  store.dispatch('races/hideAnnouncement')
}

const handleCountdownComplete = () => {
  // Countdown component will auto-hide via store
}

const handleCloseFinalResults = () => {
  // Session is already completed by races module
  // Clear current session and go back to welcome screen
  store.commit('sessions/CLEAR_CURRENT_SESSION')
  router.push('/')
}

const handleBackToMenu = () => {
  if (confirm('Are you sure you want to go back to menu? Your progress will be saved.')) {
    // IMPORTANT: Stop racing FIRST before navigating
    store.commit('races/PAUSE_RACING')

    // Mark current session as interrupted and clear it
    // (interrupted races will restart from beginning)
    store.dispatch('sessions/exitToWelcome')
    router.push('/')
  }
}

const handleRegenerate = async () => {
  if (!canRegenerate.value) {
    return
  }

  if (confirm('Are you sure you want to regenerate? This will create new horses and races.')) {
    try {
      await store.dispatch('races/regenerate')
    } catch (error) {
      console.error('Error regenerating:', error)
      alert('Regenerate error: ' + error.message)
    }
  }
}

const handleStartRace = async () => {
  if (isRacing.value) {
    return
  }

  if (!programGenerated.value) {
    alert('Please generate a program first')
    return
  }

  try {
    // Start all races (session progress is updated automatically in races module)
    await store.dispatch('races/startAllRaces')
  } catch (error) {
    console.error('Error during races:', error)
    alert('Race error: ' + error.message)
  }
}
</script>

<style scoped>
.race-view {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

/* Modern Header */
.app-header-modern {
  position: relative;
  background: linear-gradient(135deg, rgba(26, 26, 46, 0.95) 0%, rgba(15, 15, 26, 0.98) 100%);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5), 0 2px 8px rgba(255, 215, 0, 0.1);
  z-index: 100;
  overflow: hidden;
}

.header-bg-animation {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg,
    transparent 0%,
    rgba(255, 215, 0, 0.05) 25%,
    rgba(255, 121, 63, 0.05) 50%,
    rgba(120, 119, 198, 0.05) 75%,
    transparent 100%
  );
  animation: header-flow 8s linear infinite;
}

@keyframes header-flow {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.header-content {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 40px;
  max-width: 1800px;
  margin: 0 auto;
}

.brand {
  display: flex;
  align-items: center;
  gap: 20px;
}

.brand-icon {
  font-size: 48px;
  filter: drop-shadow(0 4px 12px rgba(255, 215, 0, 0.3));
}

.brand-text h1 {
  font-size: 32px;
  font-weight: 900;
  letter-spacing: 3px;
  background: linear-gradient(135deg, #ffffff 0%, #ffd700 50%, #ff7f3f 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 30px rgba(255, 215, 0, 0.3);
  margin: 0;
}

.brand-subtitle {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  letter-spacing: 2px;
  margin: 4px 0 0 2px;
  font-weight: 600;
  text-transform: uppercase;
}

/* Modern Controls */
.controls-modern {
  display: flex;
  gap: 15px;
}

.btn-wrapper {
  position: relative;
  display: inline-block;
}

.btn-modern {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 28px;
  border: none;
  border-radius: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.btn-modern::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.btn-modern:hover::before {
  width: 300px;
  height: 300px;
}

.btn-modern:active {
  transform: scale(0.95);
}

.btn-modern:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none;
}

.btn-modern:disabled::before {
  display: none;
}

.btn-icon {
  font-size: 24px;
  z-index: 1;
}

.btn-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  z-index: 1;
}

.btn-label {
  font-size: 14px;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.btn-sublabel {
  font-size: 10px;
  opacity: 0.8;
  font-weight: 500;
}

.btn-menu {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.btn-menu:hover:not(:disabled) {
  box-shadow: 0 6px 30px rgba(102, 126, 234, 0.5);
  transform: translateY(-2px);
}

.btn-generate {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.btn-generate:hover:not(:disabled) {
  box-shadow: 0 6px 30px rgba(79, 172, 254, 0.5);
  transform: translateY(-2px);
}

.btn-start {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.btn-start:hover:not(:disabled) {
  box-shadow: 0 6px 30px rgba(245, 87, 108, 0.5);
  transform: translateY(-2px);
}

.btn-pulse {
  animation: btn-pulse-animation 2s ease-in-out infinite;
}

@keyframes btn-pulse-animation {
  0%, 100% {
    box-shadow: 0 4px 20px rgba(245, 87, 108, 0.4);
  }
  50% {
    box-shadow: 0 6px 40px rgba(245, 87, 108, 0.8);
  }
}

/* Main Content Layout */
.app-content-modern {
  flex: 1;
  display: grid;
  grid-template-columns: 280px 1fr 380px;
  gap: 0;
  overflow: hidden;
  position: relative;
}

/* Sidebars */
.sidebar-modern {
  position: relative;
  display: flex;
  flex-direction: column;
  background: rgba(15, 15, 26, 0.6);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  overflow: hidden;
}

.sidebar-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 215, 0, 0.05) 0%, transparent 70%);
  animation: glow-rotate 10s linear infinite;
  pointer-events: none;
}

@keyframes glow-rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.sidebar-left {
  border-right: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-right {
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
}

/* Main Content */
.main-content-modern {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

/* Responsive Design */
@media (max-width: 1400px) {
  .app-content-modern {
    grid-template-columns: 250px 1fr 350px;
  }
}

@media (max-width: 1200px) {
  .app-content-modern {
    grid-template-columns: 220px 1fr 320px;
  }

  .header-content {
    padding: 15px 20px;
  }

  .brand-text h1 {
    font-size: 24px;
  }

  .btn-modern {
    padding: 12px 20px;
  }
}

@media (max-width: 900px) {
  .app-content-modern {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr auto;
  }

  .sidebar-left, .sidebar-right {
    border: none;
    max-height: 200px;
  }

  .sidebar-right {
    flex-direction: row;
  }

  .controls-modern {
    flex-direction: column;
    gap: 8px;
  }

  .btn-modern {
    padding: 10px 16px;
    font-size: 12px;
  }
}
</style>
