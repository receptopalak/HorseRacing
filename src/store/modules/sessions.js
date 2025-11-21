import { RaceSession } from '@/models/RaceSession'

/**
 * Vuex module for managing race sessions
 */
const state = () => ({
  currentSession: null, // Current active session
  allSessions: [], // All race sessions history
  showWelcomeScreen: true // Show welcome screen on app load
})

const getters = {
  currentSession: (state) => state.currentSession,
  allSessions: (state) => state.allSessions,
  showWelcomeScreen: (state) => state.showWelcomeScreen,
  hasActiveSession: (state) => state.currentSession !== null,
  hasInterruptedSession: (state) => {
    return state.allSessions.some(session => session.status === 'interrupted')
  },
  lastInterruptedSession: (state) => {
    const interrupted = state.allSessions.filter(s => s.status === 'interrupted')
    if (interrupted.length === 0) return null

    // Sort by lastAccessedAt (most recent first) and return the first one
    interrupted.sort((a, b) => {
      const timeA = a.lastAccessedAt ? new Date(a.lastAccessedAt).getTime() : 0
      const timeB = b.lastAccessedAt ? new Date(b.lastAccessedAt).getTime() : 0
      return timeB - timeA // Descending order (most recent first)
    })

    return interrupted[0]
  },
  completedSessions: (state) => {
    return state.allSessions.filter(s => s.status === 'completed')
  },
  interruptedSessions: (state) => {
    return state.allSessions.filter(s => s.status === 'interrupted')
  }
}

const mutations = {
  SET_CURRENT_SESSION(state, session) {
    state.currentSession = session
  },

  ADD_SESSION(state, session) {
    state.allSessions.push(session)
  },

  UPDATE_SESSION(state, { sessionId, data }) {
    const index = state.allSessions.findIndex(s => s.id === sessionId)
    if (index !== -1) {
      state.allSessions[index] = { ...state.allSessions[index], ...data }
    }
    // Also update current session if it matches
    if (state.currentSession && state.currentSession.id === sessionId) {
      state.currentSession = { ...state.currentSession, ...data }
    }
  },

  COMPLETE_SESSION(state, sessionId) {
    const index = state.allSessions.findIndex(s => s.id === sessionId)
    if (index !== -1) {
      state.allSessions[index].status = 'completed'
    }
    if (state.currentSession && state.currentSession.id === sessionId) {
      state.currentSession.status = 'completed'
    }
  },

  INTERRUPT_SESSION(state, sessionId) {
    const index = state.allSessions.findIndex(s => s.id === sessionId)
    if (index !== -1) {
      state.allSessions[index].status = 'interrupted'
      state.allSessions[index].lastAccessedAt = new Date()
    }
    if (state.currentSession && state.currentSession.id === sessionId) {
      state.currentSession.status = 'interrupted'
      state.currentSession.lastAccessedAt = new Date()
    }
  },

  CLEAR_CURRENT_SESSION(state) {
    state.currentSession = null
  },

  SET_SHOW_WELCOME_SCREEN(state, show) {
    state.showWelcomeScreen = show
  },

  REMOVE_SESSION(state, sessionId) {
    state.allSessions = state.allSessions.filter(s => s.id !== sessionId)
  }
}

const actions = {
  /**
   * Create a new race session
   */
  createSession({ commit }, sessionName) {
    const session = new RaceSession(
      RaceSession.generateId(),
      sessionName
    )
    commit('ADD_SESSION', session)
    commit('SET_CURRENT_SESSION', session)
    return session
  },

  /**
   * Update current session progress
   * Note: We don't save racePositions because interrupted races always restart from beginning
   */
  updateSessionProgress({ commit, state }, { horses, program, results, currentRaceIndex }) {
    if (!state.currentSession) return

    const sessionData = {
      horses,
      program,
      results,
      currentRaceIndex,
      completedRaces: results.length
      // racePositions and savedRacePositions are NOT saved - interrupted races restart from 0%
    }

    commit('UPDATE_SESSION', {
      sessionId: state.currentSession.id,
      data: sessionData
    })
  },

  /**
   * Complete current session
   */
  completeCurrentSession({ commit, state }) {
    if (!state.currentSession) return
    commit('COMPLETE_SESSION', state.currentSession.id)
  },

  /**
   * Interrupt current session (user exits during race)
   */
  interruptCurrentSession({ commit, state }) {
    if (!state.currentSession) return
    commit('INTERRUPT_SESSION', state.currentSession.id)
  },

  /**
   * Load a session (for continuing or viewing)
   */
  loadSession({ commit, state }, session) {
    // Update lastAccessedAt when loading a session
    session.lastAccessedAt = new Date()

    // Also update in allSessions array
    const index = state.allSessions.findIndex(s => s.id === session.id)
    if (index !== -1) {
      state.allSessions[index].lastAccessedAt = new Date()
    }

    commit('SET_CURRENT_SESSION', session)
  },

  /**
   * Exit to welcome screen
   */
  exitToWelcome({ commit, state, dispatch, rootGetters }) {
    // Mark current session as interrupted only if it's active AND at least one race has started
    const hasStartedAnyRace = rootGetters['races/hasStartedAnyRace']
    if (state.currentSession && state.currentSession.status === 'active' && hasStartedAnyRace) {
      commit('INTERRUPT_SESSION', state.currentSession.id)
    }

    // IMPORTANT: Stop any running race timers/logic
    // Since we are exiting, we should pause/reset the race state
    commit('races/PAUSE_RACING', null, { root: true })

    commit('CLEAR_CURRENT_SESSION')
  },

  /**
   * Delete a session
   */
  deleteSession({ commit }, sessionId) {
    commit('REMOVE_SESSION', sessionId)
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
