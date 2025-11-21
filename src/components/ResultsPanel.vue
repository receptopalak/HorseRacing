<template>
  <div class="results-modern">
    <div class="modern-header">
      <div class="header-icon">🏆</div>
      <div class="header-text">
        <h3>Race Results</h3>
        <span class="results-count">{{ results.length }} Completed</span>
      </div>
    </div>

    <div class="results-scroll">
      <transition-group name="list" tag="div" class="results-container">
        <div
          v-for="(result, index) in results"
          :key="result.raceRound"
          class="result-card-modern"
          :style="{ animationDelay: `${index * 0.05}s` }"
        >
          <div class="result-header-modern">
            <div class="result-trophy">🏁</div>
            <div class="result-title-modern">
              <div class="result-name">{{ result.title }}</div>
              <div class="result-time">{{ new Date(result.completedAt).toLocaleTimeString() }}</div>
            </div>
          </div>

          <div class="result-rankings">
            <div
              v-for="ranking in result.rankings.slice(0, 3)"
              :key="ranking.horse.id"
              class="ranking-item"
              :class="{
                'ranking-first': ranking.position === 1,
                'ranking-second': ranking.position === 2,
                'ranking-third': ranking.position === 3
              }"
            >
              <div class="ranking-position">
                <span v-if="ranking.position === 1">🥇</span>
                <span v-else-if="ranking.position === 2">🥈</span>
                <span v-else-if="ranking.position === 3">🥉</span>
                <span v-else>{{ ranking.position }}</span>
              </div>
              <div
                class="ranking-color"
                :style="{ backgroundColor: ranking.horse.color }"
              ></div>
              <div class="ranking-info">
                <div class="ranking-name">{{ ranking.horse.name }}</div>
                <div class="ranking-stats">
                  <span class="time-badge">{{ ranking.time }}s</span>
                </div>
              </div>
            </div>
          </div>

          <button
            v-if="result.rankings.length > 3"
            class="show-all-btn"
            @click="toggleExpand(result.raceRound)"
          >
            {{ expandedResults.has(result.raceRound) ? 'Show Less' : `Show All ${result.rankings.length}` }}
          </button>

          <transition name="expand">
            <div v-if="expandedResults.has(result.raceRound)" class="expanded-rankings">
              <div
                v-for="ranking in result.rankings.slice(3)"
                :key="ranking.horse.id"
                class="ranking-item ranking-small"
              >
                <div class="ranking-position-small">{{ ranking.position }}</div>
                <div class="ranking-color-small" :style="{ backgroundColor: ranking.horse.color }"></div>
                <div class="ranking-name-small">{{ ranking.horse.name }}</div>
                <div class="time-badge-small">{{ ranking.time }}s</div>
              </div>
            </div>
          </transition>
        </div>
      </transition-group>

      <div v-if="results.length === 0" class="empty-state-modern">
        <div class="empty-icon">🏆</div>
        <p>No results yet</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()
const expandedResults = ref(new Set())

const results = computed(() => store.getters['results/allResults'])

const toggleExpand = (raceRound) => {
  if (expandedResults.value.has(raceRound)) {
    expandedResults.value.delete(raceRound)
  } else {
    expandedResults.value.add(raceRound)
  }
  expandedResults.value = new Set(expandedResults.value)
}
</script>

<style scoped>
.results-modern {
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
  background: linear-gradient(135deg, rgba(255, 152, 0, 0.2), rgba(255, 193, 7, 0.2));
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

.results-count {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 600;
}

.results-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 15px;
}

.results-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.result-card-modern {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0;
  animation: card-slide-in 0.5s forwards;
}

@keyframes card-slide-in {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.result-card-modern:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 215, 0, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
}

.result-header-modern {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.15), rgba(255, 152, 0, 0.15));
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.result-trophy {
  font-size: 28px;
}

.result-title-modern {
  flex: 1;
}

.result-name {
  font-weight: 700;
  font-size: 14px;
  color: #ffffff;
}

.result-time {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 2px;
}

.result-rankings {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
}

.ranking-item:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.1);
}

.ranking-first {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.15), rgba(255, 193, 7, 0.1));
  border-color: rgba(255, 215, 0, 0.3);
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.2);
}

.ranking-second {
  background: linear-gradient(135deg, rgba(192, 192, 192, 0.15), rgba(169, 169, 169, 0.1));
  border-color: rgba(192, 192, 192, 0.3);
}

.ranking-third {
  background: linear-gradient(135deg, rgba(205, 127, 50, 0.15), rgba(184, 115, 51, 0.1));
  border-color: rgba(205, 127, 50, 0.3);
}

.ranking-position {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.ranking-color {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  flex-shrink: 0;
}

.ranking-info {
  flex: 1;
  min-width: 0;
}

.ranking-name {
  font-weight: 600;
  font-size: 13px;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ranking-stats {
  margin-top: 4px;
}

.time-badge {
  font-size: 11px;
  color: #4caf50;
  font-weight: 700;
  background: rgba(76, 175, 80, 0.2);
  padding: 2px 8px;
  border-radius: 4px;
}

.show-all-btn {
  margin: 0 12px 12px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.show-all-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 215, 0, 0.3);
  color: #ffd700;
}

.expanded-rankings {
  padding: 0 12px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ranking-small {
  padding: 8px;
}

.ranking-position-small {
  width: 24px;
  height: 24px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.7);
  flex-shrink: 0;
}

.ranking-color-small {
  width: 20px;
  height: 20px;
  border-radius: 6px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  flex-shrink: 0;
}

.ranking-name-small {
  flex: 1;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

.time-badge-small {
  font-size: 10px;
  color: #4caf50;
  font-weight: 600;
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

/* Expand Transition */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  max-height: 500px;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}

/* List Transitions */
.list-enter-active {
  transition: all 0.5s ease;
}

.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}
</style>
