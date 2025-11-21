<template>
  <div class="welcome-screen">
    <div class="welcome-container">
      <!-- Header -->
      <div class="welcome-header">
        <div class="logo-icon">🏇</div>
        <h1 class="game-title">HORSE RACING</h1>
        <p class="game-subtitle">Championship Series</p>
      </div>

      <!-- Menu Options -->
      <div class="menu-options">
        <!-- New Race -->
        <div class="menu-card" @click="handleNewRace">
          <div class="card-icon">🎮</div>
          <div class="card-content">
            <h3 class="card-title">New Race</h3>
            <p class="card-description">Start a new racing championship</p>
          </div>
          <div class="card-arrow">→</div>
        </div>

        <!-- Continue Last Race -->
        <div
          v-if="hasInterruptedSession && lastInterruptedSession"
          class="menu-card continue-card"
          @click="handleContinueRace"
        >
          <div class="card-icon">▶️</div>
          <div class="card-content">
            <h3 class="card-title">Continue Last Race</h3>
            <p class="card-description">{{ lastInterruptedSession?.name }}</p>
            <p class="card-meta">
              {{ lastInterruptedSession?.completedRaces }}/{{ lastInterruptedSession?.totalRaces }} races completed
            </p>
          </div>
          <div class="card-arrow">→</div>
        </div>

        <!-- Previous Races -->
        <div class="menu-card" @click="handlePreviousRaces">
          <div class="card-icon">📊</div>
          <div class="card-content">
            <h3 class="card-title">Previous Races</h3>
            <p class="card-description">View race history and results</p>
          </div>
          <div class="card-arrow">→</div>
        </div>
      </div>

      <!-- New Race Name Modal -->
      <transition name="modal-fade">
        <div v-if="showNameModal" class="modal-overlay" @click="showNameModal = false">
          <div class="modal-content" @click.stop>
            <h2 class="modal-title">Name Your Race</h2>
            <input
              ref="nameInput"
              v-model="raceName"
              type="text"
              class="name-input"
              placeholder="Enter race name..."
              maxlength="50"
              @keyup.enter="confirmNewRace"
            />
            <div class="modal-actions">
              <button class="btn-secondary" @click="showNameModal = false">
                Cancel
              </button>
              <button
                class="btn-primary"
                :disabled="!raceName.trim()"
                @click="confirmNewRace"
              >
                Start Race
              </button>
            </div>
          </div>
        </div>
      </transition>
    </div>

    <!-- Previous Races Modal -->
    <PreviousRacesModal
      :show="showPreviousRacesModal"
      @close="showPreviousRacesModal = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import PreviousRacesModal from './PreviousRacesModal.vue'

const store = useStore()
const router = useRouter()

const showNameModal = ref(false)
const raceName = ref('')
const nameInput = ref(null)
const showPreviousRacesModal = ref(false)

const hasInterruptedSession = computed(() => store.getters['sessions/hasInterruptedSession'])
const lastInterruptedSession = computed(() => store.getters['sessions/lastInterruptedSession'])

const handleNewRace = async () => {
  showNameModal.value = true
  await nextTick()
  nameInput.value?.focus()
}

const confirmNewRace = async () => {
  if (!raceName.value.trim()) return

  // CRITICAL: Stop any running races FIRST before creating new session
  store.commit('races/PAUSE_RACING')

  // Wait a bit for any running loops to finish
  await new Promise(resolve => setTimeout(resolve, 200))

  // Create new session
  const session = await store.dispatch('sessions/createSession', raceName.value.trim())

  // Initialize game (this resets everything and generates new horses/program)
  await store.dispatch('initializeGame')

  // Update session with generated data
  const horses = store.getters['horses/allHorses']
  const program = store.getters['races/program']
  const results = store.getters['results/allResults']

  await store.dispatch('sessions/updateSessionProgress', {
    horses,
    program,
    results,
    currentRaceIndex: -1
  })

  // Close modal and navigate to race screen with session ID
  showNameModal.value = false
  raceName.value = ''
  router.push(`/race/${session.id}`)
}

const handleContinueRace = async () => {
  if (!lastInterruptedSession.value) return

  try {
    // Navigate to race screen with session ID
    // The router guard will handle loading the session
    router.push(`/race/${lastInterruptedSession.value.id}`)
  } catch (error) {
    console.error('Error continuing race:', error)
    alert('Failed to continue race: ' + error.message)
  }
}

const handlePreviousRaces = () => {
  showPreviousRacesModal.value = true
}
</script>

<style scoped>
.welcome-screen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(ellipse at top, #1a1a2e 0%, #0f0f1a 50%, #000000 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100000;
  padding: 20px;
}

.welcome-container {
  max-width: 800px;
  width: 100%;
}

.welcome-header {
  text-align: center;
  margin-bottom: 60px;
  animation: header-appear 0.8s ease-out;
}

@keyframes header-appear {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.logo-icon {
  font-size: 100px;
  margin-bottom: 20px;
  filter: drop-shadow(0 8px 24px rgba(255, 215, 0, 0.4));
  animation: icon-float 3s ease-in-out infinite;
}

@keyframes icon-float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-15px);
  }
}

.game-title {
  font-size: 72px;
  font-weight: 900;
  letter-spacing: 8px;
  background: linear-gradient(135deg, #ffffff 0%, #ffd700 50%, #ff7f3f 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 10px 0;
  text-shadow: 0 0 40px rgba(255, 215, 0, 0.3);
}

.game-subtitle {
  font-size: 20px;
  color: rgba(255, 255, 255, 0.7);
  letter-spacing: 4px;
  margin: 0;
  font-weight: 600;
  text-transform: uppercase;
}

.menu-options {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.menu-card {
  background: rgba(26, 26, 46, 0.8);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 30px;
  display: flex;
  align-items: center;
  gap: 25px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: card-appear 0.6s ease-out backwards;
}

.menu-card:nth-child(1) {
  animation-delay: 0.1s;
}

.menu-card:nth-child(2) {
  animation-delay: 0.2s;
}

.menu-card:nth-child(3) {
  animation-delay: 0.3s;
}

@keyframes card-appear {
  from {
    opacity: 0;
    transform: translateX(-50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.menu-card:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 215, 0, 0.5);
  transform: translateX(10px);
  box-shadow: 0 10px 40px rgba(255, 215, 0, 0.2);
}

.continue-card {
  border-color: rgba(76, 175, 80, 0.3);
}

.continue-card:hover {
  border-color: rgba(76, 175, 80, 0.6);
  box-shadow: 0 10px 40px rgba(76, 175, 80, 0.2);
}

.card-icon {
  font-size: 48px;
  flex-shrink: 0;
}

.card-content {
  flex: 1;
}

.card-title {
  font-size: 24px;
  font-weight: 800;
  color: #ffffff;
  margin: 0 0 8px 0;
  letter-spacing: 1px;
}

.card-description {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  font-weight: 500;
}

.card-meta {
  font-size: 12px;
  color: rgba(255, 215, 0, 0.8);
  margin: 5px 0 0 0;
  font-weight: 600;
}

.card-arrow {
  font-size: 32px;
  color: rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.menu-card:hover .card-arrow {
  color: #ffd700;
  transform: translateX(10px);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
}

.modal-content {
  background: linear-gradient(135deg, rgba(26, 26, 46, 0.98) 0%, rgba(15, 15, 26, 0.98) 100%);
  border: 2px solid rgba(255, 215, 0, 0.3);
  border-radius: 20px;
  padding: 40px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
}

.modal-title {
  font-size: 28px;
  font-weight: 800;
  color: #ffd700;
  margin: 0 0 25px 0;
  text-align: center;
  letter-spacing: 2px;
}

.name-input {
  width: 100%;
  padding: 15px 20px;
  font-size: 18px;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: #ffffff;
  font-weight: 600;
  margin-bottom: 25px;
  transition: all 0.3s ease;
}

.name-input:focus {
  outline: none;
  border-color: #ffd700;
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
}

.name-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.modal-actions {
  display: flex;
  gap: 15px;
}

.btn-secondary,
.btn-primary {
  flex: 1;
  padding: 15px 25px;
  font-size: 16px;
  font-weight: 700;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.btn-primary {
  background: linear-gradient(135deg, #ffd700, #ffa500);
  border: 2px solid #ffd700;
  color: #000000;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 215, 0, 0.5);
}

.btn-primary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Transition */
.modal-fade-enter-active {
  animation: modal-in 0.3s ease-out;
}

.modal-fade-leave-active {
  animation: modal-out 0.2s ease-in;
}

@keyframes modal-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes modal-out {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .game-title {
    font-size: 48px;
  }

  .logo-icon {
    font-size: 70px;
  }

  .menu-card {
    padding: 20px;
  }

  .card-title {
    font-size: 20px;
  }

  .card-icon {
    font-size: 36px;
  }
}
</style>
