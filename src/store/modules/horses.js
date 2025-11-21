import { HorseGenerator } from '@/services/HorseGenerator'

/**
 * Vuex module for managing horse pool
 */
const state = () => ({
  horses: [],
  isGenerated: false
})

const getters = {
  allHorses: (state) => state.horses,
  horseCount: (state) => state.horses.length,
  isGenerated: (state) => state.isGenerated,
  getHorseById: (state) => (id) => state.horses.find(h => h.id === id)
}

const mutations = {
  SET_HORSES(state, horses) {
    state.horses = horses
    state.isGenerated = true
  },
  RESET_HORSES(state) {
    state.horses = []
    state.isGenerated = false
  }
}

const actions = {
  /**
   * Generate a new pool of 20 horses
   */
  generateHorses({ commit }) {
    const horses = HorseGenerator.generateHorsePool(20)
    commit('SET_HORSES', horses)
  },

  /**
   * Set horses from existing data (for session restore)
   */
  setHorses({ commit }, horses) {
    commit('SET_HORSES', horses)
  },

  /**
   * Reset the horse pool
   */
  resetHorses({ commit }) {
    commit('RESET_HORSES')
  },

  /**
   * Regenerate horses (reset and generate new ones)
   */
  regenerateHorses({ commit }) {
    commit('RESET_HORSES')
    const horses = HorseGenerator.generateHorsePool(20)
    commit('SET_HORSES', horses)
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
