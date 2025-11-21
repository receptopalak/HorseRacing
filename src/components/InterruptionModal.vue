<template>
  <Teleport to="body">
    <transition name="modal-fade">
      <div v-if="show" class="interruption-overlay">
        <div class="interruption-modal">
          <div class="modal-icon">⚠️</div>
          <h1 class="modal-title">Race Interrupted</h1>
          <p class="modal-message">
            A race was in progress when the page was refreshed. What would you like to do?
          </p>

          <div class="modal-actions">
            <button class="action-btn continue-btn" @click="handleContinue">
              <span class="btn-icon">▶️</span>
              <div class="btn-content">
                <div class="btn-title">Continue</div>
                <div class="btn-subtitle">Resume from where you left off</div>
              </div>
            </button>

            <button class="action-btn regenerate-btn" @click="handleRegenerate">
              <span class="btn-icon">🔄</span>
              <div class="btn-content">
                <div class="btn-title">Regenerate</div>
                <div class="btn-subtitle">Reset all races and start over</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { useStore } from 'vuex'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const store = useStore()

const handleContinue = async () => {
  await store.dispatch('continueRace')
}

const handleRegenerate = async () => {
  await store.dispatch('regenerate')
}
</script>

<style scoped>
.interruption-overlay {
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
}

.interruption-modal {
  background: linear-gradient(135deg, rgba(26, 26, 46, 0.98) 0%, rgba(15, 15, 26, 0.98) 100%);
  border: 3px solid rgba(255, 152, 0, 0.6);
  border-radius: 24px;
  padding: 50px 40px;
  max-width: 600px;
  width: 100%;
  text-align: center;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.9), 0 0 40px rgba(255, 152, 0, 0.3);
  animation: modal-appear 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes modal-appear {
  from {
    opacity: 0;
    transform: scale(0.8) translateY(-50px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-icon {
  font-size: 80px;
  margin-bottom: 20px;
  animation: icon-pulse 2s ease-in-out infinite;
}

@keyframes icon-pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.modal-title {
  font-size: 36px;
  font-weight: 900;
  color: #ff9800;
  margin: 0 0 20px 0;
  letter-spacing: 2px;
  text-transform: uppercase;
  text-shadow: 0 4px 12px rgba(255, 152, 0, 0.6);
}

.modal-message {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 40px 0;
  line-height: 1.6;
  font-weight: 500;
}

.modal-actions {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px 25px;
  border: 2px solid;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: left;
  width: 100%;
}

.action-btn:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
}

.continue-btn {
  border-color: #4caf50;
}

.continue-btn:hover {
  background: rgba(76, 175, 80, 0.2);
  box-shadow: 0 8px 30px rgba(76, 175, 80, 0.4);
}

.regenerate-btn {
  border-color: #2196f3;
}

.regenerate-btn:hover {
  background: rgba(33, 150, 243, 0.2);
  box-shadow: 0 8px 30px rgba(33, 150, 243, 0.4);
}

.btn-icon {
  font-size: 40px;
  flex-shrink: 0;
}

.btn-content {
  flex: 1;
}

.btn-title {
  font-size: 20px;
  font-weight: 800;
  color: #ffffff;
  margin-bottom: 5px;
  letter-spacing: 1px;
}

.btn-subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
}

/* Transition */
.modal-fade-enter-active {
  animation: modal-fade-in 0.4s ease-out;
}

.modal-fade-leave-active {
  animation: modal-fade-out 0.3s ease-in;
}

@keyframes modal-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes modal-fade-out {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .interruption-modal {
    padding: 40px 30px;
  }

  .modal-title {
    font-size: 28px;
  }

  .modal-message {
    font-size: 16px;
  }

  .btn-title {
    font-size: 18px;
  }

  .btn-subtitle {
    font-size: 13px;
  }
}
</style>
