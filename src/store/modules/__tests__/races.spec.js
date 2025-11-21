import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import racesModule from '../races'
import { RaceScheduler } from '@/services/RaceScheduler'
import { RaceEngine } from '@/services/RaceEngine'
import { Horse } from '@/models/Horse'
import { Race } from '@/models/Race'
import { RaceResult } from '@/models/RaceResult'

// Mock the services
vi.mock('@/services/RaceScheduler')
vi.mock('@/services/RaceEngine')

describe('races store module', () => {
  let state
  let mockHorses
  let mockProgram

  beforeEach(() => {
    vi.clearAllMocks()

    // Reset state before each test
    state = racesModule.state()

    // Create mock horses
    mockHorses = [
      new Horse(1, 'Thunder', 90, '#FF0000'),
      new Horse(2, 'Lightning', 85, '#00FF00'),
      new Horse(3, 'Storm', 80, '#0000FF')
    ]

    // Create mock program
    mockProgram = [
      new Race(1, 1200, mockHorses),
      new Race(2, 1400, mockHorses),
      new Race(3, 1600, mockHorses)
    ]
  })

  describe('State', () => {
    it('should initialize with correct default values', () => {
      expect(state.program).toEqual([])
      expect(state.currentRaceIndex).toBe(-1)
      expect(state.isRacing).toBe(false)
      expect(state.racePositions).toEqual({})
      expect(state.savedRacePositions).toEqual({})
      expect(state.showAnnouncement).toBe(false)
      expect(state.lastRaceResult).toBeNull()
      expect(state.allRacesComplete).toBe(false)
      expect(state.showCountdown).toBe(false)
      expect(state.raceStartTime).toBeNull()
      expect(state.currentRaceTime).toBe(0)
      expect(state.hasStartedAnyRace).toBe(false)
    })
  })

  describe('Getters', () => {
    it('program should return the program array', () => {
      state.program = mockProgram
      expect(racesModule.getters.program(state)).toEqual(mockProgram)
    })

    it('programGenerated should return true when program exists', () => {
      state.program = mockProgram
      expect(racesModule.getters.programGenerated(state)).toBe(true)
    })

    it('programGenerated should return false when program is empty', () => {
      state.program = []
      expect(racesModule.getters.programGenerated(state)).toBe(false)
    })

    it('currentRace should return the current race', () => {
      state.program = mockProgram
      state.currentRaceIndex = 1
      expect(racesModule.getters.currentRace(state)).toEqual(mockProgram[1])
    })

    it('currentRace should return null when no race is selected', () => {
      state.program = mockProgram
      state.currentRaceIndex = -1
      expect(racesModule.getters.currentRace(state)).toBeNull()
    })

    it('isRacing should return racing status', () => {
      state.isRacing = true
      expect(racesModule.getters.isRacing(state)).toBe(true)
    })

    it('hasMoreRaces should return true when more races exist', () => {
      state.program = mockProgram
      state.currentRaceIndex = 0
      expect(racesModule.getters.hasMoreRaces(state)).toBe(true)
    })

    it('hasMoreRaces should return false when all races complete', () => {
      state.program = mockProgram
      state.currentRaceIndex = 2
      expect(racesModule.getters.hasMoreRaces(state)).toBe(false)
    })

    it('completedRaces should count races with completed status', () => {
      state.program = [
        { ...mockProgram[0], status: 'completed' },
        { ...mockProgram[1], status: 'running' },
        { ...mockProgram[2], status: 'completed' }
      ]
      expect(racesModule.getters.completedRaces(state)).toBe(2)
    })

    it('canRegenerate should return true before any race starts', () => {
      state.hasStartedAnyRace = false
      expect(racesModule.getters.canRegenerate(state)).toBe(true)
    })

    it('canRegenerate should return false after race starts', () => {
      state.hasStartedAnyRace = true
      expect(racesModule.getters.canRegenerate(state)).toBe(false)
    })
  })

  describe('Mutations', () => {
    describe('SET_PROGRAM', () => {
      it('should set the program with pending status', () => {
        racesModule.mutations.SET_PROGRAM(state, mockProgram)

        expect(state.program).toHaveLength(3)
        expect(state.program[0].status).toBe('pending')
        expect(state.currentRaceIndex).toBe(-1)
        expect(state.allRacesComplete).toBe(false)
      })

      it('should preserve existing status if provided', () => {
        const programWithStatus = mockProgram.map((race, i) => ({
          ...race,
          status: i === 0 ? 'completed' : 'pending'
        }))

        racesModule.mutations.SET_PROGRAM(state, programWithStatus)

        expect(state.program[0].status).toBe('completed')
        expect(state.program[1].status).toBe('pending')
      })
    })

    describe('START_RACE', () => {
      beforeEach(() => {
        state.program = mockProgram.map(race => ({ ...race, status: 'pending' }))
      })

      it('should start a race and initialize positions', () => {
        racesModule.mutations.START_RACE(state, 0)

        expect(state.currentRaceIndex).toBe(0)
        expect(state.isRacing).toBe(true)
        expect(state.currentRaceTime).toBe(0)
        expect(state.program[0].status).toBe('running')
        expect(Object.keys(state.racePositions)).toHaveLength(3)
      })

      it('should initialize race positions at 0%', () => {
        racesModule.mutations.START_RACE(state, 0)

        Object.values(state.racePositions).forEach(pos => {
          expect(pos.progress).toBe(0)
          expect(pos.distance).toBe(0)
          expect(pos.speed).toBe(0)
        })
      })
    })

    describe('START_RACE_TIMER', () => {
      it('should set race start time', () => {
        const before = Date.now()
        racesModule.mutations.START_RACE_TIMER(state)
        const after = Date.now()

        expect(state.raceStartTime).toBeGreaterThanOrEqual(before)
        expect(state.raceStartTime).toBeLessThanOrEqual(after)
        expect(state.currentRaceTime).toBe(0)
      })
    })

    describe('UPDATE_RACE_POSITIONS', () => {
      it('should update race positions', () => {
        const positions = [
          { horseId: 1, progress: 25, distance: 300, speed: 1.2 },
          { horseId: 2, progress: 20, distance: 240, speed: 1.1 }
        ]

        racesModule.mutations.UPDATE_RACE_POSITIONS(state, positions)

        expect(state.racePositions[1].progress).toBe(25)
        expect(state.racePositions[2].progress).toBe(20)
        expect(state.savedRacePositions).toEqual(state.racePositions)
      })
    })

    describe('COMPLETE_RACE', () => {
      beforeEach(() => {
        state.program = mockProgram.map(race => ({ ...race, status: 'running' }))
        state.isRacing = true
        state.raceStartTime = Date.now()
        state.racePositions = { 1: { progress: 100 } }
      })

      it('should mark race as completed', () => {
        racesModule.mutations.COMPLETE_RACE(state, 0)

        expect(state.program[0].status).toBe('completed')
        expect(state.isRacing).toBe(false)
        expect(state.raceStartTime).toBeNull()
        expect(state.racePositions).toEqual({})
      })
    })

    describe('UPDATE_RACE_TIME', () => {
      it('should update current race time', () => {
        racesModule.mutations.UPDATE_RACE_TIME(state, 45.5)
        expect(state.currentRaceTime).toBe(45.5)
      })
    })

    describe('SHOW_ANNOUNCEMENT', () => {
      it('should show announcement with result', () => {
        const mockResult = new RaceResult(mockProgram[0], [])

        racesModule.mutations.SHOW_ANNOUNCEMENT(state, mockResult)

        expect(state.showAnnouncement).toBe(true)
        expect(state.lastRaceResult).toEqual(mockResult)
      })
    })

    describe('HIDE_ANNOUNCEMENT', () => {
      it('should hide announcement', () => {
        state.showAnnouncement = true
        racesModule.mutations.HIDE_ANNOUNCEMENT(state)
        expect(state.showAnnouncement).toBe(false)
      })
    })

    describe('SHOW_COUNTDOWN', () => {
      it('should show countdown', () => {
        racesModule.mutations.SHOW_COUNTDOWN(state)
        expect(state.showCountdown).toBe(true)
      })
    })

    describe('HIDE_COUNTDOWN', () => {
      it('should hide countdown', () => {
        state.showCountdown = true
        racesModule.mutations.HIDE_COUNTDOWN(state)
        expect(state.showCountdown).toBe(false)
      })
    })

    describe('SET_ALL_RACES_COMPLETE', () => {
      it('should set all races complete flag', () => {
        racesModule.mutations.SET_ALL_RACES_COMPLETE(state, true)
        expect(state.allRacesComplete).toBe(true)
      })
    })

    describe('SET_STARTED_ANY_RACE', () => {
      it('should mark that a race has started', () => {
        racesModule.mutations.SET_STARTED_ANY_RACE(state)
        expect(state.hasStartedAnyRace).toBe(true)
      })
    })

    describe('RESET_PROGRAM', () => {
      beforeEach(() => {
        state.program = mockProgram
        state.currentRaceIndex = 1
        state.isRacing = true
        state.showAnnouncement = true
        state.hasStartedAnyRace = true
      })

      it('should reset all race state', () => {
        racesModule.mutations.RESET_PROGRAM(state)

        expect(state.program).toEqual([])
        expect(state.currentRaceIndex).toBe(-1)
        expect(state.isRacing).toBe(false)
        expect(state.racePositions).toEqual({})
        expect(state.showAnnouncement).toBe(false)
        expect(state.lastRaceResult).toBeNull()
        expect(state.allRacesComplete).toBe(false)
        expect(state.showCountdown).toBe(false)
        expect(state.hasStartedAnyRace).toBe(false)
      })
    })

    describe('SET_CURRENT_INDEX', () => {
      it('should set current race index', () => {
        racesModule.mutations.SET_CURRENT_INDEX(state, 2)
        expect(state.currentRaceIndex).toBe(2)
      })
    })

    describe('PAUSE_RACING', () => {
      it('should pause racing', () => {
        state.isRacing = true
        racesModule.mutations.PAUSE_RACING(state)
        expect(state.isRacing).toBe(false)
      })
    })

    describe('SAVE_RACE_POSITIONS', () => {
      it('should save current race positions', () => {
        const positions = { 1: { progress: 50 } }
        state.racePositions = positions

        racesModule.mutations.SAVE_RACE_POSITIONS(state)

        expect(state.savedRacePositions).toEqual(positions)
      })
    })

    describe('RESTORE_RACE_POSITIONS', () => {
      it('should restore saved race positions', () => {
        const savedPositions = { 1: { progress: 75 } }
        state.savedRacePositions = savedPositions

        racesModule.mutations.RESTORE_RACE_POSITIONS(state)

        expect(state.racePositions).toEqual(savedPositions)
      })
    })

    describe('RESET_INTERRUPTED_RACE', () => {
      beforeEach(() => {
        state.program = mockProgram.map((race, i) => ({
          ...race,
          status: i === 0 ? 'completed' : i === 1 ? 'running' : 'pending'
        }))
        state.isRacing = true
        state.racePositions = { 1: { progress: 50 } }
        state.savedRacePositions = { 1: { progress: 50 } }
        state.currentRaceIndex = 1
      })

      it('should reset interrupted race to pending', () => {
        racesModule.mutations.RESET_INTERRUPTED_RACE(state, 1)

        expect(state.program[1].status).toBe('pending')
        expect(state.program[0].status).toBe('completed')
        expect(state.isRacing).toBe(false)
        expect(state.racePositions).toEqual({})
        expect(state.savedRacePositions).toEqual({})
        expect(state.currentRaceIndex).toBe(0)
      })
    })
  })

  describe('Actions', () => {
    let commit
    let dispatch
    let getters
    let rootGetters

    beforeEach(() => {
      commit = vi.fn()
      dispatch = vi.fn()
      getters = {
        program: mockProgram,
        hasMoreRaces: true,
        currentRaceIndex: 0
      }
      rootGetters = {
        'horses/allHorses': mockHorses,
        'results/allResults': [],
        'sessions/currentSession': { id: 'session-1' }
      }
    })

    describe('generateProgram', () => {
      it('should generate program from horses', () => {
        RaceScheduler.generateProgram.mockReturnValue(mockProgram)

        racesModule.actions.generateProgram({ commit, rootGetters })

        expect(RaceScheduler.generateProgram).toHaveBeenCalledWith(mockHorses)
        expect(commit).toHaveBeenCalledWith('SET_PROGRAM', mockProgram)
      })

      it('should throw error when no horses available', () => {
        rootGetters['horses/allHorses'] = []

        expect(() => {
          racesModule.actions.generateProgram({ commit, rootGetters })
        }).toThrow('No horses available. Generate horses first.')
      })
    })

    describe('setProgram', () => {
      it('should set program with hydrated horses', () => {
        const plainProgram = mockProgram.map(race => ({
          ...race,
          horses: race.horses.map(h => h.toJSON())
        }))

        racesModule.actions.setProgram({ commit }, plainProgram)

        expect(commit).toHaveBeenCalled()
        const committedProgram = commit.mock.calls[0][1]
        expect(committedProgram[0].horses[0]).toBeInstanceOf(Horse)
      })
    })

    describe('startNextRace', () => {
      let mockState

      beforeEach(() => {
        RaceEngine.calculateRaceDuration.mockReturnValue(30000)
        RaceEngine.runRace.mockResolvedValue(
          new RaceResult(mockProgram[0], [])
        )
      })

      it('should return null if already racing', async () => {
        mockState = {
          program: mockProgram,
          currentRaceIndex: -1,
          isRacing: true
        }

        const result = await racesModule.actions.startNextRace({
          state: mockState,
          commit,
          dispatch,
          rootGetters
        })

        expect(result).toBeNull()
      })

      it('should return null if no more races', async () => {
        mockState = {
          program: mockProgram,
          currentRaceIndex: mockProgram.length,
          isRacing: false
        }

        const result = await racesModule.actions.startNextRace({
          state: mockState,
          commit,
          dispatch,
          rootGetters
        })

        expect(result).toBeNull()
      })

      it('should start next race with countdown', async () => {
        // Use real state and mutations for this integration-style test
        const testState = racesModule.state()
        racesModule.mutations.SET_PROGRAM(testState, mockProgram)

        const result = await racesModule.actions.startNextRace({
          state: testState,
          commit: (mutation, payload) => {
            // Actually call the mutations on the test state
            if (racesModule.mutations[mutation]) {
              racesModule.mutations[mutation](testState, payload)
            }
          },
          dispatch,
          rootGetters
        })

        expect(result).toBeInstanceOf(RaceResult)
        expect(testState.currentRaceIndex).toBe(0)
        expect(testState.program[0].status).toBe('completed')
      }, 10000)

      it('should return null if race is cancelled', async () => {
        RaceEngine.runRace.mockResolvedValue(null)
        mockState = {
          program: mockProgram,
          currentRaceIndex: -1,
          isRacing: false
        }

        const result = await racesModule.actions.startNextRace({
          state: mockState,
          commit: () => {}, // No-op commit
          dispatch,
          rootGetters
        })

        expect(result).toBeNull()
      }, 10000)
    })

    describe('startAllRaces', () => {
      it('should start all races sequentially', async () => {
        const mockState = {
          isRacing: false
        }
        const mockResult = new RaceResult(mockProgram[0], [])

        dispatch.mockResolvedValue(mockResult)
        getters.hasMoreRaces = true

        // First call returns result, second call returns null (no more races)
        let callCount = 0
        dispatch.mockImplementation(() => {
          callCount++
          if (callCount === 1) {
            getters.hasMoreRaces = false
            return Promise.resolve(mockResult)
          }
          return Promise.resolve(null)
        })

        await racesModule.actions.startAllRaces({
          dispatch,
          getters,
          commit,
          rootGetters,
          state: mockState
        })

        expect(commit).toHaveBeenCalledWith('SET_STARTED_ANY_RACE')
        expect(dispatch).toHaveBeenCalledWith('startNextRace')
        expect(commit).toHaveBeenCalledWith('SHOW_ANNOUNCEMENT', mockResult)
      }, 10000)

      it('should exit early if race is cancelled', async () => {
        const mockState = { isRacing: false }
        dispatch.mockResolvedValue(null)

        await racesModule.actions.startAllRaces({
          dispatch,
          getters,
          commit,
          rootGetters,
          state: mockState
        })

        expect(commit).toHaveBeenCalledWith('SET_STARTED_ANY_RACE')
        expect(dispatch).toHaveBeenCalledWith('startNextRace')
        expect(commit).not.toHaveBeenCalledWith('SET_ALL_RACES_COMPLETE', true)
      })
    })

    describe('hideAnnouncement', () => {
      it('should hide announcement', () => {
        racesModule.actions.hideAnnouncement({ commit })
        expect(commit).toHaveBeenCalledWith('HIDE_ANNOUNCEMENT')
      })
    })

    describe('resetProgram', () => {
      it('should reset program', () => {
        racesModule.actions.resetProgram({ commit })
        expect(commit).toHaveBeenCalledWith('RESET_PROGRAM')
      })
    })

    describe('pauseRacing', () => {
      it('should pause racing', () => {
        racesModule.actions.pauseRacing({ commit })
        expect(commit).toHaveBeenCalledWith('PAUSE_RACING')
      })
    })

    describe('regenerate', () => {
      it('should regenerate horses and program when allowed', async () => {
        const mockState = { hasStartedAnyRace: false }

        await racesModule.actions.regenerate({
          commit,
          dispatch,
          state: mockState
        })

        expect(commit).toHaveBeenCalledWith('RESET_PROGRAM')
        expect(dispatch).toHaveBeenCalledWith('results/resetResults', null, { root: true })
        expect(dispatch).toHaveBeenCalledWith('horses/regenerateHorses', null, { root: true })
        expect(dispatch).toHaveBeenCalledWith('generateProgram')
      })

      it('should throw error when races have started', async () => {
        const mockState = { hasStartedAnyRace: true }

        await expect(
          racesModule.actions.regenerate({ commit, dispatch, state: mockState })
        ).rejects.toThrow('Cannot regenerate after races have started')
      })
    })
  })
})
