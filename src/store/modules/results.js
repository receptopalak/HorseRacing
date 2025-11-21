/**
 * Vuex module for managing race results
 */
const state = () => ({
  results: [] // Array of RaceResult objects
})

const getters = {
  allResults: (state) => state.results,
  resultsCount: (state) => state.results.length,
  getResultByRound: (state) => (round) => state.results.find(r => r.raceRound === round),
  latestResult: (state) => state.results[state.results.length - 1] || null
}

const mutations = {
  ADD_RESULT(state, result) {
    state.results.push(result)
  },

  SET_RESULTS(state, results) {
    state.results = results
  },

  CLEAR_RESULTS(state) {
    state.results = []
  }
}

const actions = {
  /**
   * Add a race result
   */
  addResult({ commit }, result) {
    commit('ADD_RESULT', result)
  },

  /**
   * Set results from existing data (for session restore)
   */
  setResults({ commit }, results) {
    commit('SET_RESULTS', results)
  },

  /**
   * Clear all results
   */
  clearResults({ commit }) {
    commit('CLEAR_RESULTS')
  },

  /**
   * Reset all results (alias for clearResults)
   */
  resetResults({ commit }) {
    commit('CLEAR_RESULTS')
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
