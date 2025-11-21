<template>
  <Teleport to="body">
    <transition name="modal-fade">
      <div v-if="show" class="previous-races-overlay" @click="$emit('close')">
        <div class="previous-races-container" @click.stop>
          <div class="modal-header">
            <h2 class="modal-title">Race History</h2>
            <button class="close-btn" @click="$emit('close')">✕</button>
          </div>

          <div class="races-list">
            <div v-if="allRaces.length === 0" class="empty-state">
              <div class="empty-icon">📋</div>
              <p>No race history yet</p>
            </div>

            <div
              v-for="session in allRaces"
              :key="session.id"
              class="race-item"
              :class="{
                'race-completed': session.status === 'completed',
                'race-interrupted': session.status === 'interrupted'
              }"
            >
              <div class="race-header">
                <div class="race-info">
                  <h3 class="race-name">{{ session.name }}</h3>
                  <p class="race-date">
                    {{ formatDate(session.createdAt) }}
                  </p>
                </div>
                <div class="race-status">
                  <span
                    v-if="session.status === 'completed'"
                    class="status-badge completed"
                  >
                    ✓ Completed
                  </span>
                  <span
                    v-else
                    class="status-badge interrupted"
                  >
                    ⏸ Interrupted
                  </span>
                </div>
              </div>

              <div class="race-stats">
                <div class="stat-item">
                  <span class="stat-label">Progress:</span>
                  <span class="stat-value">
                    {{ session.completedRaces }}/{{ session.totalRaces }} races
                  </span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Horses:</span>
                  <span class="stat-value">{{ session.horses?.length || 0 }}</span>
                </div>
              </div>

              <div class="race-actions">
                <button
                  v-if="session.status === 'interrupted'"
                  class="btn-action btn-continue"
                  @click="continueRace(session)"
                >
                  <span class="btn-icon">▶️</span>
                  Complete Race
                </button>
                <button
                  v-if="session.status === 'completed'"
                  class="btn-action btn-view"
                  @click="viewResults(session)"
                >
                  <span class="btn-icon">📊</span>
                  View Results
                </button>
                <button
                  class="btn-action btn-delete"
                  @click="deleteRace(session.id)"
                >
                  <span class="btn-icon">🗑️</span>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Results Viewer Modal -->
    <FinalResultsScreen
      v-if="selectedSession"
      :show="showResults"
      :session="selectedSession"
      @close="showResults = false"
    />
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import FinalResultsScreen from './FinalResultsScreen.vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

const store = useStore()
const router = useRouter()

const selectedSession = ref(null)
const showResults = ref(false)

const allRaces = computed(() => {
  const completed = store.getters['sessions/completedSessions']
  const interrupted = store.getters['sessions/interruptedSessions']
  return [...interrupted, ...completed].sort((a, b) =>
    new Date(b.createdAt) - new Date(a.createdAt)
  )
})

const formatDate = (date) => {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const continueRace = async (session) => {
  try {
    // Close modal and navigate to race screen with session ID
    // The router guard will handle loading the session
    emit('close')
    router.push(`/race/${session.id}`)
  } catch (error) {
    console.error('Error continuing race:', error)
    alert('Failed to continue race: ' + error.message)
  }
}

const viewResults = (session) => {
  selectedSession.value = session
  showResults.value = true
}

const deleteRace = (sessionId) => {
  if (confirm('Are you sure you want to delete this race?')) {
    store.dispatch('sessions/deleteSession', sessionId)
  }
}
</script>

<style scoped>
.previous-races-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(20px);
  z-index: 150000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  overflow-y: auto;
}

.previous-races-container {
  background: linear-gradient(135deg, rgba(26, 26, 46, 0.98) 0%, rgba(15, 15, 26, 0.98) 100%);
  border: 2px solid rgba(255, 215, 0, 0.4);
  border-radius: 24px;
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.9);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30px 30px 20px;
  border-bottom: 2px solid rgba(255, 215, 0, 0.2);
}

.modal-title {
  font-size: 36px;
  font-weight: 900;
  color: #ffd700;
  margin: 0;
  letter-spacing: 2px;
}

.close-btn {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
  font-size: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: rgba(255, 0, 0, 0.2);
  border-color: rgba(255, 0, 0, 0.5);
  transform: rotate(90deg);
}

.races-list {
  padding: 20px 30px 30px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: rgba(255, 255, 255, 0.5);
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 15px;
}

.race-item {
  background: rgba(255, 255, 255, 0.03);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 25px;
  transition: all 0.3s ease;
}

.race-item:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 215, 0, 0.3);
  transform: translateY(-2px);
}

.race-completed {
  border-color: rgba(76, 175, 80, 0.3);
}

.race-interrupted {
  border-color: rgba(255, 152, 0, 0.3);
}

.race-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.race-info {
  flex: 1;
}

.race-name {
  font-size: 22px;
  font-weight: 800;
  color: #ffffff;
  margin: 0 0 5px 0;
  letter-spacing: 1px;
}

.race-date {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
  font-weight: 500;
}

.race-status {
  flex-shrink: 0;
}

.status-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.completed {
  background: rgba(76, 175, 80, 0.2);
  color: #66bb6a;
  border: 1px solid rgba(76, 175, 80, 0.4);
}

.status-badge.interrupted {
  background: rgba(255, 152, 0, 0.2);
  color: #ff9800;
  border: 1px solid rgba(255, 152, 0, 0.4);
}

.race-stats {
  display: flex;
  gap: 30px;
  margin-bottom: 20px;
}

.stat-item {
  display: flex;
  gap: 8px;
  font-size: 14px;
}

.stat-label {
  color: rgba(255, 255, 255, 0.6);
  font-weight: 600;
}

.stat-value {
  color: #ffd700;
  font-weight: 700;
}

.race-actions {
  display: flex;
  gap: 10px;
}

.btn-action {
  flex: 1;
  padding: 12px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn-continue {
  background: rgba(76, 175, 80, 0.2);
  border: 2px solid rgba(76, 175, 80, 0.4);
  color: #66bb6a;
}

.btn-continue:hover {
  background: rgba(76, 175, 80, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.3);
}

.btn-view {
  background: rgba(33, 150, 243, 0.2);
  border: 2px solid rgba(33, 150, 243, 0.4);
  color: #42a5f5;
}

.btn-view:hover {
  background: rgba(33, 150, 243, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(33, 150, 243, 0.3);
}

.btn-delete {
  background: rgba(244, 67, 54, 0.2);
  border: 2px solid rgba(244, 67, 54, 0.4);
  color: #ef5350;
  flex: 0 0 auto;
}

.btn-delete:hover {
  background: rgba(244, 67, 54, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(244, 67, 54, 0.3);
}

.btn-icon {
  font-size: 16px;
}

/* Scrollbar */
.previous-races-container::-webkit-scrollbar {
  width: 10px;
}

.previous-races-container::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 5px;
}

.previous-races-container::-webkit-scrollbar-thumb {
  background: rgba(255, 215, 0, 0.3);
  border-radius: 5px;
}

.previous-races-container::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 215, 0, 0.5);
}

/* Transitions */
.modal-fade-enter-active {
  animation: modal-in 0.4s ease-out;
}

.modal-fade-leave-active {
  animation: modal-out 0.3s ease-in;
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
  .modal-title {
    font-size: 28px;
  }

  .race-item {
    padding: 20px;
  }

  .race-name {
    font-size: 18px;
  }

  .race-actions {
    flex-direction: column;
  }
}
</style>
