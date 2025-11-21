import { describe, it, expect, beforeEach, vi } from 'vitest'
import sessionsModule from '../sessions'
import { RaceSession } from '@/models/RaceSession'
import { Horse } from '@/models/Horse'

// Mock RaceSession.generateId
vi.mock('@/models/RaceSession', async () => {
  const actual = await vi.importActual('@/models/RaceSession')
  return {
    ...actual,
    RaceSession: class extends actual.RaceSession {
      static generateId() {
        return 'mock-id-' + Date.now()
      }
    }
  }
})

describe('sessions store module', () => {
  let state

  beforeEach(() => {
    state = sessionsModule.state()
  })

  describe('State', () => {
    it('should initialize with correct default values', () => {
      expect(state.currentSession).toBeNull()
      expect(state.allSessions).toEqual([])
      expect(state.showWelcomeScreen).toBe(true)
    })
  })

  describe('Getters', () => {
    it('currentSession should return the current session', () => {
      const session = new RaceSession('id-1', 'Test Session')
      state.currentSession = session
      expect(sessionsModule.getters.currentSession(state)).toEqual(session)
    })

    it('allSessions should return all sessions', () => {
      const sessions = [
        new RaceSession('id-1', 'Session 1'),
        new RaceSession('id-2', 'Session 2')
      ]
      state.allSessions = sessions
      expect(sessionsModule.getters.allSessions(state)).toEqual(sessions)
    })

    it('showWelcomeScreen should return welcome screen state', () => {
      state.showWelcomeScreen = false
      expect(sessionsModule.getters.showWelcomeScreen(state)).toBe(false)
    })

    it('hasActiveSession should return true when session exists', () => {
      state.currentSession = new RaceSession('id-1', 'Test')
      expect(sessionsModule.getters.hasActiveSession(state)).toBe(true)
    })

    it('hasActiveSession should return false when no session', () => {
      state.currentSession = null
      expect(sessionsModule.getters.hasActiveSession(state)).toBe(false)
    })

    it('hasInterruptedSession should return true when interrupted session exists', () => {
      const session = new RaceSession('id-1', 'Test')
      session.status = 'interrupted'
      state.allSessions = [session]
      expect(sessionsModule.getters.hasInterruptedSession(state)).toBe(true)
    })

    it('hasInterruptedSession should return false when no interrupted sessions', () => {
      const session = new RaceSession('id-1', 'Test')
      session.status = 'completed'
      state.allSessions = [session]
      expect(sessionsModule.getters.hasInterruptedSession(state)).toBe(false)
    })

    it('lastInterruptedSession should return most recently accessed interrupted session', () => {
      const session1 = new RaceSession('id-1', 'Session 1', new Date('2024-01-01'))
      session1.status = 'interrupted'
      session1.lastAccessedAt = new Date('2024-01-01')

      const session2 = new RaceSession('id-2', 'Session 2', new Date('2024-01-02'))
      session2.status = 'interrupted'
      session2.lastAccessedAt = new Date('2024-01-02')

      state.allSessions = [session1, session2]

      const result = sessionsModule.getters.lastInterruptedSession(state)
      expect(result.id).toBe('id-2')
    })

    it('lastInterruptedSession should return null when no interrupted sessions', () => {
      state.allSessions = [
        new RaceSession('id-1', 'Session 1')
      ]
      expect(sessionsModule.getters.lastInterruptedSession(state)).toBeNull()
    })

    it('completedSessions should return only completed sessions', () => {
      const session1 = new RaceSession('id-1', 'Session 1')
      session1.status = 'completed'

      const session2 = new RaceSession('id-2', 'Session 2')
      session2.status = 'active'

      const session3 = new RaceSession('id-3', 'Session 3')
      session3.status = 'completed'

      state.allSessions = [session1, session2, session3]

      const result = sessionsModule.getters.completedSessions(state)
      expect(result).toHaveLength(2)
      expect(result[0].id).toBe('id-1')
      expect(result[1].id).toBe('id-3')
    })

    it('interruptedSessions should return only interrupted sessions', () => {
      const session1 = new RaceSession('id-1', 'Session 1')
      session1.status = 'interrupted'

      const session2 = new RaceSession('id-2', 'Session 2')
      session2.status = 'completed'

      const session3 = new RaceSession('id-3', 'Session 3')
      session3.status = 'interrupted'

      state.allSessions = [session1, session2, session3]

      const result = sessionsModule.getters.interruptedSessions(state)
      expect(result).toHaveLength(2)
      expect(result[0].id).toBe('id-1')
      expect(result[1].id).toBe('id-3')
    })
  })

  describe('Mutations', () => {
    describe('SET_CURRENT_SESSION', () => {
      it('should set the current session', () => {
        const session = new RaceSession('id-1', 'Test Session')
        sessionsModule.mutations.SET_CURRENT_SESSION(state, session)
        expect(state.currentSession).toEqual(session)
      })
    })

    describe('ADD_SESSION', () => {
      it('should add a session to allSessions', () => {
        const session = new RaceSession('id-1', 'Test Session')
        sessionsModule.mutations.ADD_SESSION(state, session)
        expect(state.allSessions).toHaveLength(1)
        expect(state.allSessions[0]).toEqual(session)
      })
    })

    describe('UPDATE_SESSION', () => {
      beforeEach(() => {
        const session = new RaceSession('id-1', 'Test Session')
        state.allSessions = [session]
        state.currentSession = session
      })

      it('should update session in allSessions', () => {
        const horses = [new Horse(1, 'Thunder', 90, '#FF0000')]
        const updateData = { horses, completedRaces: 2 }

        sessionsModule.mutations.UPDATE_SESSION(state, {
          sessionId: 'id-1',
          data: updateData
        })

        expect(state.allSessions[0].horses).toEqual(horses)
        expect(state.allSessions[0].completedRaces).toBe(2)
      })

      it('should update current session if it matches', () => {
        const updateData = { completedRaces: 3 }

        sessionsModule.mutations.UPDATE_SESSION(state, {
          sessionId: 'id-1',
          data: updateData
        })

        expect(state.currentSession.completedRaces).toBe(3)
      })

      it('should not update if session not found', () => {
        const originalLength = state.allSessions.length

        sessionsModule.mutations.UPDATE_SESSION(state, {
          sessionId: 'non-existent',
          data: { completedRaces: 5 }
        })

        expect(state.allSessions).toHaveLength(originalLength)
      })
    })

    describe('COMPLETE_SESSION', () => {
      beforeEach(() => {
        const session = new RaceSession('id-1', 'Test Session')
        state.allSessions = [session]
        state.currentSession = session
      })

      it('should mark session as completed in allSessions', () => {
        sessionsModule.mutations.COMPLETE_SESSION(state, 'id-1')
        expect(state.allSessions[0].status).toBe('completed')
      })

      it('should mark current session as completed', () => {
        sessionsModule.mutations.COMPLETE_SESSION(state, 'id-1')
        expect(state.currentSession.status).toBe('completed')
      })
    })

    describe('INTERRUPT_SESSION', () => {
      beforeEach(() => {
        const session = new RaceSession('id-1', 'Test Session')
        state.allSessions = [session]
        state.currentSession = session
      })

      it('should mark session as interrupted in allSessions', () => {
        sessionsModule.mutations.INTERRUPT_SESSION(state, 'id-1')
        expect(state.allSessions[0].status).toBe('interrupted')
      })

      it('should update lastAccessedAt in allSessions', () => {
        const before = Date.now()
        sessionsModule.mutations.INTERRUPT_SESSION(state, 'id-1')
        const after = Date.now()

        expect(state.allSessions[0].lastAccessedAt.getTime()).toBeGreaterThanOrEqual(before)
        expect(state.allSessions[0].lastAccessedAt.getTime()).toBeLessThanOrEqual(after)
      })

      it('should mark current session as interrupted', () => {
        sessionsModule.mutations.INTERRUPT_SESSION(state, 'id-1')
        expect(state.currentSession.status).toBe('interrupted')
      })

      it('should update lastAccessedAt in current session', () => {
        sessionsModule.mutations.INTERRUPT_SESSION(state, 'id-1')
        expect(state.currentSession.lastAccessedAt).toBeInstanceOf(Date)
      })
    })

    describe('CLEAR_CURRENT_SESSION', () => {
      it('should clear the current session', () => {
        state.currentSession = new RaceSession('id-1', 'Test')
        sessionsModule.mutations.CLEAR_CURRENT_SESSION(state)
        expect(state.currentSession).toBeNull()
      })
    })

    describe('SET_SHOW_WELCOME_SCREEN', () => {
      it('should set welcome screen visibility', () => {
        sessionsModule.mutations.SET_SHOW_WELCOME_SCREEN(state, false)
        expect(state.showWelcomeScreen).toBe(false)

        sessionsModule.mutations.SET_SHOW_WELCOME_SCREEN(state, true)
        expect(state.showWelcomeScreen).toBe(true)
      })
    })

    describe('REMOVE_SESSION', () => {
      it('should remove session from allSessions', () => {
        const session1 = new RaceSession('id-1', 'Session 1')
        const session2 = new RaceSession('id-2', 'Session 2')
        state.allSessions = [session1, session2]

        sessionsModule.mutations.REMOVE_SESSION(state, 'id-1')

        expect(state.allSessions).toHaveLength(1)
        expect(state.allSessions[0].id).toBe('id-2')
      })
    })
  })

  describe('Actions', () => {
    let commit
    let rootGetters

    beforeEach(() => {
      commit = vi.fn()
      rootGetters = {
        'races/hasStartedAnyRace': false
      }
    })

    describe('createSession', () => {
      it('should create a new session and set it as current', () => {
        const session = sessionsModule.actions.createSession(
          { commit },
          'Test Race'
        )

        expect(session).toBeInstanceOf(RaceSession)
        expect(session.name).toBe('Test Race')
        expect(commit).toHaveBeenCalledWith('ADD_SESSION', session)
        expect(commit).toHaveBeenCalledWith('SET_CURRENT_SESSION', session)
      })
    })

    describe('updateSessionProgress', () => {
      it('should update session progress when session exists', () => {
        const mockState = {
          currentSession: new RaceSession('id-1', 'Test')
        }

        const horses = [new Horse(1, 'Thunder', 90, '#FF0000')]
        const program = []
        const results = []
        const currentRaceIndex = 0

        sessionsModule.actions.updateSessionProgress(
          { commit, state: mockState },
          { horses, program, results, currentRaceIndex }
        )

        expect(commit).toHaveBeenCalledWith('UPDATE_SESSION', {
          sessionId: 'id-1',
          data: {
            horses,
            program,
            results,
            currentRaceIndex,
            completedRaces: 0
          }
        })
      })

      it('should not update when no current session', () => {
        const mockState = { currentSession: null }

        sessionsModule.actions.updateSessionProgress(
          { commit, state: mockState },
          { horses: [], program: [], results: [], currentRaceIndex: 0 }
        )

        expect(commit).not.toHaveBeenCalled()
      })
    })

    describe('completeCurrentSession', () => {
      it('should complete current session when it exists', () => {
        const mockState = {
          currentSession: new RaceSession('id-1', 'Test')
        }

        sessionsModule.actions.completeCurrentSession({ commit, state: mockState })

        expect(commit).toHaveBeenCalledWith('COMPLETE_SESSION', 'id-1')
      })

      it('should not complete when no current session', () => {
        const mockState = { currentSession: null }

        sessionsModule.actions.completeCurrentSession({ commit, state: mockState })

        expect(commit).not.toHaveBeenCalled()
      })
    })

    describe('interruptCurrentSession', () => {
      it('should interrupt current session when it exists', () => {
        const mockState = {
          currentSession: new RaceSession('id-1', 'Test')
        }

        sessionsModule.actions.interruptCurrentSession({ commit, state: mockState })

        expect(commit).toHaveBeenCalledWith('INTERRUPT_SESSION', 'id-1')
      })

      it('should not interrupt when no current session', () => {
        const mockState = { currentSession: null }

        sessionsModule.actions.interruptCurrentSession({ commit, state: mockState })

        expect(commit).not.toHaveBeenCalled()
      })
    })

    describe('loadSession', () => {
      it('should load session and update lastAccessedAt', () => {
        const session = new RaceSession('id-1', 'Test')
        const mockState = {
          allSessions: [session]
        }

        const before = Date.now()
        sessionsModule.actions.loadSession(
          { commit, state: mockState },
          session
        )
        const after = Date.now()

        expect(session.lastAccessedAt.getTime()).toBeGreaterThanOrEqual(before)
        expect(session.lastAccessedAt.getTime()).toBeLessThanOrEqual(after)
        expect(commit).toHaveBeenCalledWith('SET_CURRENT_SESSION', session)
      })

      it('should update lastAccessedAt in allSessions array', () => {
        const session = new RaceSession('id-1', 'Test')
        const mockState = {
          allSessions: [session]
        }

        sessionsModule.actions.loadSession(
          { commit, state: mockState },
          session
        )

        expect(mockState.allSessions[0].lastAccessedAt).toBeInstanceOf(Date)
      })
    })

    describe('exitToWelcome', () => {
      it('should interrupt active session when race has started', () => {
        const session = new RaceSession('id-1', 'Test')
        session.status = 'active'

        const mockState = { currentSession: session }
        const mockRootGetters = { 'races/hasStartedAnyRace': true }

        sessionsModule.actions.exitToWelcome({
          commit,
          state: mockState,
          dispatch: vi.fn(),
          rootGetters: mockRootGetters
        })

        expect(commit).toHaveBeenCalledWith('INTERRUPT_SESSION', 'id-1')
        expect(commit).toHaveBeenCalledWith('races/PAUSE_RACING', null, { root: true })
        expect(commit).toHaveBeenCalledWith('CLEAR_CURRENT_SESSION')
      })

      it('should not interrupt if no race has started', () => {
        const session = new RaceSession('id-1', 'Test')
        session.status = 'active'

        const mockState = { currentSession: session }
        const mockRootGetters = { 'races/hasStartedAnyRace': false }

        sessionsModule.actions.exitToWelcome({
          commit,
          state: mockState,
          dispatch: vi.fn(),
          rootGetters: mockRootGetters
        })

        expect(commit).not.toHaveBeenCalledWith('INTERRUPT_SESSION', 'id-1')
        expect(commit).toHaveBeenCalledWith('races/PAUSE_RACING', null, { root: true })
        expect(commit).toHaveBeenCalledWith('CLEAR_CURRENT_SESSION')
      })

      it('should not interrupt completed session', () => {
        const session = new RaceSession('id-1', 'Test')
        session.status = 'completed'

        const mockState = { currentSession: session }
        const mockRootGetters = { 'races/hasStartedAnyRace': true }

        sessionsModule.actions.exitToWelcome({
          commit,
          state: mockState,
          dispatch: vi.fn(),
          rootGetters: mockRootGetters
        })

        expect(commit).not.toHaveBeenCalledWith('INTERRUPT_SESSION', 'id-1')
      })
    })

    describe('deleteSession', () => {
      it('should delete session by id', () => {
        sessionsModule.actions.deleteSession({ commit }, 'session-id')
        expect(commit).toHaveBeenCalledWith('REMOVE_SESSION', 'session-id')
      })
    })
  })
})
