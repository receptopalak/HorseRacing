import { createStore } from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import SecureLS from 'secure-ls'
import horses from './modules/horses'
import races from './modules/races'
import results from './modules/results'
import sessions from './modules/sessions'
import { Horse } from '@/models/Horse'
import { RaceSession } from '@/models/RaceSession'
import { RaceResult } from '@/models/RaceResult'

// Initialize secure localStorage with encryption
const ls = new SecureLS({
  encodingType: 'aes', // AES encryption
  isCompression: true, // Compress data
  encryptionSecret: 'horse-racing-secure-key-2024' // Secret key for encryption
})

/**
 * Root Vuex store
 * Manages application state with modular structure
 */
export default createStore({
  modules: {
    horses,
    races,
    results,
    sessions
  },

  state: {
    appStatus: 'idle', // idle, ready, racing, completed
    showInterruptionModal: false // Show modal for interrupted race
  },

  getters: {
    appStatus: (state) => state.appStatus,
    canGenerateProgram: (state, getters) => getters['horses/isGenerated'],
    canStartRace: (state, getters) =>
      getters['races/programGenerated'] && !getters['races/isRacing'],
    showInterruptionModal: (state) => state.showInterruptionModal,
    hasInterruptedRace: (state, getters) => {
      // Check if there's a race in 'running' state (was interrupted)
      const program = getters['races/program']
      return program.some(race => race.status === 'running')
    }
  },

  mutations: {
    SET_APP_STATUS(state, status) {
      state.appStatus = status
    },

    SET_INTERRUPTION_MODAL(state, show) {
      state.showInterruptionModal = show
    }
  },

  actions: {
    /**
     * Reset entire application state
     */
    resetAll({ dispatch, commit }) {
      commit('SET_APP_STATUS', 'idle')
      commit('SET_INTERRUPTION_MODAL', false)
      dispatch('horses/resetHorses')
      dispatch('races/resetProgram')
      dispatch('results/clearResults')
    },

    /**
     * Initialize application with horses and program
     */
    async initializeGame({ dispatch, commit }) {
      // CRITICAL: Completely reset all race state and results before starting new game
      commit('races/PAUSE_RACING', null, { root: true })  // Stop any running races
      commit('SET_INTERRUPTION_MODAL', false)  // Hide interruption modal
      await dispatch('races/resetProgram')  // Clear program and reset flags
      await dispatch('results/clearResults')  // Clear old results
      await dispatch('horses/generateHorses')
      await dispatch('races/generateProgram')
      commit('SET_APP_STATUS', 'ready')
    },

    /**
     * Check for interrupted race on app load
     */
    checkInterruptedRace({ getters, commit }) {
      if (getters.hasInterruptedRace) {
        commit('SET_INTERRUPTION_MODAL', true)
      }
    },

    /**
     * Continue interrupted race
     */
    async continueRace({ dispatch, commit, getters }) {
      commit('SET_INTERRUPTION_MODAL', false)
      // Find the interrupted race and continue from there
      const program = getters['races/program']
      const interruptedIndex = program.findIndex(race => race.status === 'running')

      if (interruptedIndex !== -1) {
        // Reset the interrupted race to pending
        commit('races/RESET_INTERRUPTED_RACE', interruptedIndex)
        // Start races from the interrupted one
        await dispatch('races/startAllRaces')
      }
    },

    /**
     * Regenerate everything (discard interrupted state)
     */
    async regenerate({ dispatch, commit }) {
      commit('SET_INTERRUPTION_MODAL', false)
      await dispatch('resetAll')
      await dispatch('initializeGame')
    }
  },

  plugins: [
    createPersistedState({
      key: 'horse-racing-game',
      paths: [
        'horses',
        'races',
        'results',
        'sessions',
        'appStatus'
      ],
      storage: {
        getItem: (key) => {
          try {
            // SecureLS automatically decrypts and decompresses
            const value = ls.get(key)
            if (!value) return null

            // Rehydrate Horse instances
            if (value.horses && value.horses.horses) {
              value.horses.horses = value.horses.horses.map(horse =>
                Horse.fromJSON(horse)
              )
            }

            // Rehydrate horses in race program
            if (value.races && value.races.program) {
              value.races.program = value.races.program.map(race => ({
                ...race,
                horses: race.horses.map(horse => Horse.fromJSON(horse))
              }))
            }

            // Rehydrate RaceSession instances
            if (value.sessions) {
              if (value.sessions.currentSession) {
                value.sessions.currentSession = RaceSession.fromJSON(value.sessions.currentSession)
              }
              if (value.sessions.allSessions) {
                value.sessions.allSessions = value.sessions.allSessions.map(session =>
                  RaceSession.fromJSON(session)
                )
              }
            }

            // Rehydrate RaceResult instances
            if (value.results && value.results.results) {
              value.results.results = value.results.results.map(result =>
                RaceResult.fromJSON(result)
              )
            }

            return JSON.stringify(value)
          } catch (e) {
            console.error('Error getting encrypted state:', e)
            return null
          }
        },
        setItem: (key, value) => {
          try {
            // Parse the value and let SecureLS encrypt and compress it
            const state = JSON.parse(value)
            ls.set(key, state)
          } catch (e) {
            console.error('Error setting encrypted state:', e)
          }
        },
        removeItem: (key) => {
          ls.remove(key)
        }
      }
    })
  ]
})
