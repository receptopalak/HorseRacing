import { RaceScheduler } from '@/services/RaceScheduler'
import { RaceEngine } from '@/services/RaceEngine'
import { Horse } from '@/models/Horse'

// Module-level variables to track intervals across actions/mutations
let raceTimer = null
let autoSaveTimer = null

/**
 * Helper to clear all active timers
 */
const clearAllTimers = () => {
  if (raceTimer) {
    clearInterval(raceTimer)
    raceTimer = null
  }
  if (autoSaveTimer) {
    clearInterval(autoSaveTimer)
    autoSaveTimer = null
  }
}

/**
 * Vuex module for managing race program and execution
 */
const state = () => ({
  program: [], // Array of 6 races
  currentRaceIndex: -1,
  isRacing: false,
  racePositions: {}, // Current positions during race animation
  savedRacePositions: {}, // Saved positions when race is interrupted
  showAnnouncement: false, // Show winners announcement
  lastRaceResult: null, // Last race result for announcement
  allRacesComplete: false, // All races finished flag
  showCountdown: false, // Show countdown before race starts
  raceStartTime: null, // Race start timestamp
  currentRaceTime: 0, // Current race elapsed time in seconds
  hasStartedAnyRace: false // Track if any race has been started (prevents regeneration)
})

const getters = {
  program: (state) => state.program,
  programGenerated: (state) => state.program.length > 0,
  currentRace: (state) => state.program[state.currentRaceIndex] || null,
  currentRaceIndex: (state) => state.currentRaceIndex,
  isRacing: (state) => state.isRacing,
  racePositions: (state) => state.racePositions,
  hasMoreRaces: (state) => state.currentRaceIndex < state.program.length - 1,
  completedRaces: (state) => state.program.filter(r => r.status === 'completed').length,
  showAnnouncement: (state) => state.showAnnouncement,
  lastRaceResult: (state) => state.lastRaceResult,
  allRacesComplete: (state) => state.allRacesComplete,
  showCountdown: (state) => state.showCountdown,
  raceStartTime: (state) => state.raceStartTime,
  currentRaceTime: (state) => state.currentRaceTime,
  hasStartedAnyRace: (state) => state.hasStartedAnyRace,
  canRegenerate: (state) => !state.hasStartedAnyRace
}

const mutations = {
  SET_PROGRAM(state, program) {
    // Preserve race status if it exists (for session restore), otherwise set to 'pending'
    state.program = program.map(race => ({
      ...race,
      status: race.status || 'pending',
      _updated: Date.now()
    }))
    state.currentRaceIndex = -1
    state.allRacesComplete = false
  },

  START_RACE(state, index) {
    state.currentRaceIndex = index
    state.isRacing = true
    state.currentRaceTime = 0
    // Don't set raceStartTime here - will be set after countdown

    if (state.program[index]) {
      // Create completely new program array with ALL races recreated
      // This ensures Vue detects the changes
      const newProgram = state.program.map((race, idx) => {
        // Ensure horses are Horse instances
        const horses = race.horses.map(horse =>
          horse instanceof Horse ? horse : Horse.fromJSON(horse)
        )

        if (idx === index) {
          // Mark current race as running
          return { ...race, horses, status: 'running', _updated: Date.now() }
        } else if (race.status === 'running') {
          // Ensure no other race is marked as running
          return { ...race, horses, status: 'completed', _updated: Date.now() }
        }
        return { ...race, horses, _updated: race._updated || Date.now() }
      })
      state.program = newProgram

      // Initialize race positions for all horses in this race
      const initialPositions = {}
      state.program[index].horses.forEach(horse => {
        initialPositions[horse.id] = {
          horseId: horse.id,
          progress: 0,
          distance: 0,
          speed: 0
        }
      })
      state.racePositions = initialPositions
    }
  },

  START_RACE_TIMER(state) {
    state.raceStartTime = Date.now()
    state.currentRaceTime = 0
  },

  UPDATE_RACE_POSITIONS(state, positions) {
    state.racePositions = positions.reduce((acc, pos) => {
      acc[pos.horseId] = pos
      return acc
    }, {})
    // Also save to savedRacePositions for continuous backup
    state.savedRacePositions = { ...state.racePositions }
  },

  COMPLETE_RACE(state, index) {
    state.isRacing = false
    state.raceStartTime = null

    if (state.program[index]) {
      // Create completely new program array with ALL races recreated
      const newProgram = state.program.map((race, idx) => {
        // Ensure horses are Horse instances
        const horses = race.horses.map(horse =>
          horse instanceof Horse ? horse : Horse.fromJSON(horse)
        )

        if (idx === index) {
          return { ...race, horses, status: 'completed', _updated: Date.now() }
        }
        return { ...race, horses, _updated: race._updated || Date.now() }
      })
      state.program = newProgram
    }
    // Clear race positions when race completes
    state.racePositions = {}
  },

  UPDATE_RACE_TIME(state, elapsedSeconds) {
    state.currentRaceTime = elapsedSeconds
  },

  SHOW_ANNOUNCEMENT(state, result) {
    state.showAnnouncement = true
    state.lastRaceResult = result
  },

  HIDE_ANNOUNCEMENT(state) {
    state.showAnnouncement = false
  },

  SHOW_COUNTDOWN(state) {
    state.showCountdown = true
  },

  HIDE_COUNTDOWN(state) {
    state.showCountdown = false
  },

  SET_ALL_RACES_COMPLETE(state, value) {
    state.allRacesComplete = value
  },

  SET_STARTED_ANY_RACE(state) {
    state.hasStartedAnyRace = true
  },

  RESET_PROGRAM(state) {
    clearAllTimers() // Stop any running timers
    state.program = []
    state.currentRaceIndex = -1
    state.isRacing = false
    state.racePositions = {}
    state.showAnnouncement = false
    state.lastRaceResult = null
    state.allRacesComplete = false
    state.showCountdown = false
    state.hasStartedAnyRace = false
  },

  SET_CURRENT_INDEX(state, index) {
    state.currentRaceIndex = index
  },

  PAUSE_RACING(state) {
    clearAllTimers() // Stop timers when paused
    state.isRacing = false
  },

  SAVE_RACE_POSITIONS(state) {
    // Save current race positions when interrupting
    state.savedRacePositions = { ...state.racePositions }
  },

  RESTORE_RACE_POSITIONS(state) {
    // Restore saved positions when returning to interrupted race
    state.racePositions = { ...state.savedRacePositions }
  },

  RESET_INTERRUPTED_RACE(state, index) {
    clearAllTimers() // IMPORTANT: Stop any running timers immediately
    
    // Reset interrupted race to pending so it can be started again
    // Keep completed races as completed, only reset the interrupted one
    if (state.program[index]) {
      const newProgram = state.program.map((race, idx) => {
        // Ensure horses are Horse instances
        const horses = race.horses.map(horse =>
          horse instanceof Horse ? horse : Horse.fromJSON(horse)
        )

        if (idx === index) {
          // Reset the interrupted race to pending
          return { ...race, horses, status: 'pending', _updated: Date.now() }
        } else if (idx < index && race.status === 'running') {
          // If a race before the interrupted one is marked as running, mark it completed
          return { ...race, horses, status: 'completed', _updated: Date.now() }
        } else {
          // Keep other races as they are (completed stays completed, pending stays pending)
          return { ...race, horses }
        }
      })
      state.program = newProgram
    }
    // Reset racing state - COMPLETELY CLEAR positions so race starts from beginning
    state.isRacing = false
    state.racePositions = {} // Always clear - race will start from 0%
    state.savedRacePositions = {} // Clear saved positions too
    state.raceStartTime = null
    state.currentRaceTime = 0
    state.showCountdown = false
    state.showAnnouncement = false
    state.allRacesComplete = false
    // Set current race index to one before the interrupted race
    state.currentRaceIndex = index - 1
  }
}

const actions = {
  /**
   * Generate race program from horse pool
   */
  generateProgram({ commit, rootGetters }) {
    const horses = rootGetters['horses/allHorses']
    if (horses.length === 0) {
      throw new Error('No horses available. Generate horses first.')
    }

    const program = RaceScheduler.generateProgram(horses)
    commit('SET_PROGRAM', program)
  },

  /**
   * Set program from existing data (for session restore)
   */
  setProgram({ commit }, program) {
    // Ensure horses are Horse instances before setting
    const hydratedProgram = program.map(race => ({
      ...race,
      horses: race.horses.map(horse =>
        horse instanceof Horse ? horse : Horse.fromJSON(horse)
      )
    }))
    commit('SET_PROGRAM', hydratedProgram)
  },

  /**
   * Start the next race in the program
   */
  async startNextRace({ state, commit, dispatch, rootGetters }) {
    if (state.isRacing) {
      return null
    }

    const nextIndex = state.currentRaceIndex + 1
    if (nextIndex >= state.program.length) {
      return null
    }

    const race = state.program[nextIndex]

    // 1. Start the race (show horses on track)
    commit('START_RACE', nextIndex)

    // 2. Wait a moment for rendering
    await new Promise(resolve => setTimeout(resolve, 500))

    // 3. Show countdown: 3, 2, 1, START!
    commit('SHOW_COUNTDOWN')
    await new Promise(resolve => setTimeout(resolve, 3500))
    commit('HIDE_COUNTDOWN')

    // 4. Start timer AFTER countdown
    commit('START_RACE_TIMER')
    clearAllTimers() // Clear any existing timers first
    
    raceTimer = setInterval(() => {
      if (state.raceStartTime) {
        const elapsed = (Date.now() - state.raceStartTime) / 1000
        commit('UPDATE_RACE_TIME', elapsed)
      }
    }, 100) // Update every 100ms

    // 5. Setup auto-save during race (every 2 seconds)
    autoSaveTimer = setInterval(() => {
      const currentSession = rootGetters['sessions/currentSession']
      if (currentSession && state.isRacing) {
        const horses = rootGetters['horses/allHorses']
        const program = state.program
        const results = rootGetters['results/allResults']

        dispatch('sessions/updateSessionProgress', {
          horses,
          program,
          results,
          currentRaceIndex: state.currentRaceIndex
          // No racePositions - interrupted races restart from 0%
        }, { root: true })
      }
    }, 2000) // Save every 2 seconds

    // 6. Run the race with animation
    const duration = RaceEngine.calculateRaceDuration(race.distance)

    const result = await RaceEngine.runRace(
      race,
      (positions) => {
        // Check if race has been stopped externally (e.g. user left)
        if (!state.isRacing) return false
        commit('UPDATE_RACE_POSITIONS', positions)
        return true
      },
      duration
    )

    // 7. Stop timer and auto-save
    clearAllTimers()

    // Check if race was cancelled (result is null)
    if (!result || !state.isRacing) {
      return null
    }

    // 8. Mark race as completed
    commit('COMPLETE_RACE', nextIndex)

    // 9. Store the result
    dispatch('results/addResult', result, { root: true })

    // 10. IMPORTANT: Save session immediately after race completes
    // This ensures that if user refreshes during announcement, race is saved as 'completed'
    const currentSession = rootGetters['sessions/currentSession']
    if (currentSession) {
      const horses = rootGetters['horses/allHorses']
      const program = state.program
      const results = rootGetters['results/allResults']

      await dispatch('sessions/updateSessionProgress', {
        horses,
        program,
        results,
        currentRaceIndex: state.currentRaceIndex
      }, { root: true })
    }

    return result
  },

  /**
   * Start all races sequentially with announcements
   */
  async startAllRaces({ dispatch, getters, commit, rootGetters, state }) {
    // Mark that races have been started (prevents regeneration)
    commit('SET_STARTED_ANY_RACE')

    while (getters.hasMoreRaces) {
      const result = await dispatch('startNextRace')

      // CRITICAL: If result is null, race was cancelled (user navigated away)
      // In this case, exit the loop
      if (!result) {
        return
      }

      // Race completed successfully - show announcement
      // (Note: isRacing is false after COMPLETE_RACE, but that's normal)
      commit('SHOW_ANNOUNCEMENT', result)
      await new Promise(resolve => setTimeout(resolve, 3000))
      commit('HIDE_ANNOUNCEMENT')

      // Update session progress after each race
      const currentSession = rootGetters['sessions/currentSession']
      if (currentSession) {
        const horses = rootGetters['horses/allHorses']
        const program = getters.program
        const results = rootGetters['results/allResults']
        const currentRaceIndex = getters.currentRaceIndex

        dispatch('sessions/updateSessionProgress', {
          horses,
          program,
          results,
          currentRaceIndex
          // No racePositions - interrupted races restart from 0%
        }, { root: true })
      }

      // Small delay before next race starts
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    // All races complete - mark session as completed
    commit('SET_ALL_RACES_COMPLETE', true)

    // Complete the session
    dispatch('sessions/completeCurrentSession', null, { root: true })
  },

  /**
   * Hide announcement manually
   */
  hideAnnouncement({ commit }) {
    commit('HIDE_ANNOUNCEMENT')
  },

  /**
   * Reset the race program
   */
  resetProgram({ commit }) {
    commit('RESET_PROGRAM')
  },

  /**
   * Pause current racing (for future pause feature)
   */
  pauseRacing({ commit }) {
    commit('PAUSE_RACING')
  },

  /**
   * Regenerate horses and program
   * Only allowed before first race starts
   */
  async regenerate({ commit, dispatch, state }) {
    // Cannot regenerate after races have started
    if (state.hasStartedAnyRace) {
      throw new Error('Cannot regenerate after races have started')
    }

    // Reset everything
    commit('RESET_PROGRAM')
    await dispatch('results/resetResults', null, { root: true })
    await dispatch('horses/regenerateHorses', null, { root: true })

    // Generate new program
    await dispatch('generateProgram')
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
