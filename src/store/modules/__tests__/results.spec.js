import { describe, it, expect, beforeEach, vi } from 'vitest'
import resultsModule from '../results'
import { RaceResult } from '@/models/RaceResult'
import { Horse } from '@/models/Horse'
import { Race } from '@/models/Race'

describe('results store module', () => {
  let state
  let mockResults

  beforeEach(() => {
    state = resultsModule.state()

    // Create mock horses
    const mockHorses = [
      new Horse(1, 'Thunder', 90, '#FF0000'),
      new Horse(2, 'Lightning', 85, '#00FF00'),
      new Horse(3, 'Storm', 80, '#0000FF')
    ]

    // Create mock races and results
    const race1 = new Race(1, 1200, mockHorses)
    const race2 = new Race(2, 1400, mockHorses)

    const rankings1 = [
      { horse: mockHorses[0].toJSON(), position: 1, time: '75.50', speed: '1.150' },
      { horse: mockHorses[1].toJSON(), position: 2, time: '76.20', speed: '1.120' },
      { horse: mockHorses[2].toJSON(), position: 3, time: '77.00', speed: '1.100' }
    ]

    const rankings2 = [
      { horse: mockHorses[1].toJSON(), position: 1, time: '82.10', speed: '1.140' },
      { horse: mockHorses[0].toJSON(), position: 2, time: '82.50', speed: '1.130' },
      { horse: mockHorses[2].toJSON(), position: 3, time: '83.00', speed: '1.110' }
    ]

    mockResults = [
      new RaceResult(race1, rankings1),
      new RaceResult(race2, rankings2)
    ]
  })

  describe('State', () => {
    it('should initialize with empty results array', () => {
      expect(state.results).toEqual([])
    })
  })

  describe('Getters', () => {
    describe('allResults', () => {
      it('should return all results', () => {
        state.results = mockResults
        expect(resultsModule.getters.allResults(state)).toEqual(mockResults)
      })

      it('should return empty array when no results', () => {
        expect(resultsModule.getters.allResults(state)).toEqual([])
      })
    })

    describe('resultsCount', () => {
      it('should return correct count of results', () => {
        state.results = mockResults
        expect(resultsModule.getters.resultsCount(state)).toBe(2)
      })

      it('should return 0 when no results', () => {
        expect(resultsModule.getters.resultsCount(state)).toBe(0)
      })
    })

    describe('getResultByRound', () => {
      beforeEach(() => {
        state.results = mockResults
      })

      it('should find result by round number', () => {
        const getter = resultsModule.getters.getResultByRound(state)
        const result = getter(1)

        expect(result).toBeDefined()
        expect(result.raceRound).toBe(1)
      })

      it('should return undefined for non-existent round', () => {
        const getter = resultsModule.getters.getResultByRound(state)
        const result = getter(999)

        expect(result).toBeUndefined()
      })

      it('should find correct result among multiple rounds', () => {
        const getter = resultsModule.getters.getResultByRound(state)
        const result = getter(2)

        expect(result).toBeDefined()
        expect(result.raceRound).toBe(2)
        expect(result.distance).toBe(1400)
      })
    })

    describe('latestResult', () => {
      it('should return last result in array', () => {
        state.results = mockResults
        const latest = resultsModule.getters.latestResult(state)

        expect(latest).toEqual(mockResults[1])
        expect(latest.raceRound).toBe(2)
      })

      it('should return null when no results', () => {
        expect(resultsModule.getters.latestResult(state)).toBeNull()
      })

      it('should return only result when there is one', () => {
        state.results = [mockResults[0]]
        const latest = resultsModule.getters.latestResult(state)

        expect(latest).toEqual(mockResults[0])
      })
    })
  })

  describe('Mutations', () => {
    describe('ADD_RESULT', () => {
      it('should add result to results array', () => {
        resultsModule.mutations.ADD_RESULT(state, mockResults[0])

        expect(state.results).toHaveLength(1)
        expect(state.results[0]).toEqual(mockResults[0])
      })

      it('should add multiple results in order', () => {
        resultsModule.mutations.ADD_RESULT(state, mockResults[0])
        resultsModule.mutations.ADD_RESULT(state, mockResults[1])

        expect(state.results).toHaveLength(2)
        expect(state.results[0]).toEqual(mockResults[0])
        expect(state.results[1]).toEqual(mockResults[1])
      })

      it('should preserve existing results when adding new ones', () => {
        state.results = [mockResults[0]]
        resultsModule.mutations.ADD_RESULT(state, mockResults[1])

        expect(state.results).toHaveLength(2)
        expect(state.results[0].raceRound).toBe(1)
        expect(state.results[1].raceRound).toBe(2)
      })
    })

    describe('SET_RESULTS', () => {
      it('should set results array', () => {
        resultsModule.mutations.SET_RESULTS(state, mockResults)

        expect(state.results).toEqual(mockResults)
        expect(state.results).toHaveLength(2)
      })

      it('should replace existing results', () => {
        state.results = [mockResults[0]]
        resultsModule.mutations.SET_RESULTS(state, mockResults)

        expect(state.results).toEqual(mockResults)
        expect(state.results).toHaveLength(2)
      })

      it('should set empty array', () => {
        state.results = mockResults
        resultsModule.mutations.SET_RESULTS(state, [])

        expect(state.results).toEqual([])
      })
    })

    describe('CLEAR_RESULTS', () => {
      it('should clear all results', () => {
        state.results = mockResults
        resultsModule.mutations.CLEAR_RESULTS(state)

        expect(state.results).toEqual([])
      })

      it('should work when already empty', () => {
        resultsModule.mutations.CLEAR_RESULTS(state)
        expect(state.results).toEqual([])
      })
    })
  })

  describe('Actions', () => {
    let commit

    beforeEach(() => {
      commit = vi.fn()
    })

    describe('addResult', () => {
      it('should commit ADD_RESULT mutation', () => {
        resultsModule.actions.addResult({ commit }, mockResults[0])

        expect(commit).toHaveBeenCalledWith('ADD_RESULT', mockResults[0])
      })

      it('should pass correct result object', () => {
        const result = mockResults[1]
        resultsModule.actions.addResult({ commit }, result)

        expect(commit).toHaveBeenCalledWith('ADD_RESULT', result)
      })
    })

    describe('setResults', () => {
      it('should commit SET_RESULTS mutation', () => {
        resultsModule.actions.setResults({ commit }, mockResults)

        expect(commit).toHaveBeenCalledWith('SET_RESULTS', mockResults)
      })

      it('should pass correct results array', () => {
        resultsModule.actions.setResults({ commit }, mockResults)

        expect(commit).toHaveBeenCalledWith('SET_RESULTS', mockResults)
        expect(commit.mock.calls[0][1]).toHaveLength(2)
      })

      it('should handle empty array', () => {
        resultsModule.actions.setResults({ commit }, [])

        expect(commit).toHaveBeenCalledWith('SET_RESULTS', [])
      })
    })

    describe('clearResults', () => {
      it('should commit CLEAR_RESULTS mutation', () => {
        resultsModule.actions.clearResults({ commit })

        expect(commit).toHaveBeenCalledWith('CLEAR_RESULTS')
      })
    })

    describe('resetResults', () => {
      it('should commit CLEAR_RESULTS mutation', () => {
        resultsModule.actions.resetResults({ commit })

        expect(commit).toHaveBeenCalledWith('CLEAR_RESULTS')
      })

      it('should be alias for clearResults', () => {
        resultsModule.actions.clearResults({ commit })
        const clearCalls = commit.mock.calls.length

        commit.mockClear()

        resultsModule.actions.resetResults({ commit })
        const resetCalls = commit.mock.calls.length

        // Both should make the same number of calls
        expect(resetCalls).toBe(clearCalls)
        // Both should call CLEAR_RESULTS
        expect(commit).toHaveBeenCalledWith('CLEAR_RESULTS')
      })
    })
  })

  describe('Integration', () => {
    it('should handle complete results lifecycle', () => {
      // Start with empty results
      expect(resultsModule.getters.allResults(state)).toEqual([])

      // Add first result
      resultsModule.mutations.ADD_RESULT(state, mockResults[0])
      expect(resultsModule.getters.resultsCount(state)).toBe(1)
      expect(resultsModule.getters.latestResult(state)).toEqual(mockResults[0])

      // Add second result
      resultsModule.mutations.ADD_RESULT(state, mockResults[1])
      expect(resultsModule.getters.resultsCount(state)).toBe(2)
      expect(resultsModule.getters.latestResult(state)).toEqual(mockResults[1])

      // Get result by round
      const round1Result = resultsModule.getters.getResultByRound(state)(1)
      expect(round1Result.raceRound).toBe(1)

      // Clear results
      resultsModule.mutations.CLEAR_RESULTS(state)
      expect(resultsModule.getters.resultsCount(state)).toBe(0)
      expect(resultsModule.getters.latestResult(state)).toBeNull()
    })

    it('should handle setting and replacing results', () => {
      // Set initial results
      resultsModule.mutations.SET_RESULTS(state, mockResults)
      expect(resultsModule.getters.resultsCount(state)).toBe(2)

      // Replace with new results
      const newResults = [mockResults[0]]
      resultsModule.mutations.SET_RESULTS(state, newResults)
      expect(resultsModule.getters.resultsCount(state)).toBe(1)
      expect(resultsModule.getters.allResults(state)).toEqual(newResults)
    })
  })
})
