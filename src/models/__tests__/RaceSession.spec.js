import { describe, it, expect, beforeEach } from 'vitest'
import { RaceSession } from '../RaceSession'
import { Horse } from '../Horse'
import { RaceResult } from '../RaceResult'

describe('RaceSession', () => {
  let session

  beforeEach(() => {
    session = new RaceSession('test-id-123', 'Test Race Session')
  })

  describe('Constructor', () => {
    it('should create a session with correct initial properties', () => {
      expect(session.id).toBe('test-id-123')
      expect(session.name).toBe('Test Race Session')
      expect(session.status).toBe('active')
      expect(session.horses).toEqual([])
      expect(session.program).toEqual([])
      expect(session.results).toEqual([])
      expect(session.currentRaceIndex).toBe(-1)
      expect(session.completedRaces).toBe(0)
      expect(session.totalRaces).toBe(6)
    })

    it('should set createdAt and lastAccessedAt to current time', () => {
      const now = Date.now()
      expect(session.createdAt.getTime()).toBeGreaterThanOrEqual(now - 1000)
      expect(session.createdAt.getTime()).toBeLessThanOrEqual(now + 1000)
      expect(session.lastAccessedAt.getTime()).toBe(session.createdAt.getTime())
    })

    it('should accept custom createdAt', () => {
      const customDate = new Date('2024-01-01')
      const customSession = new RaceSession('id', 'name', customDate)
      expect(customSession.createdAt).toEqual(customDate)
    })

    it('should accept custom status', () => {
      const completedSession = new RaceSession('id', 'name', new Date(), 'completed')
      expect(completedSession.status).toBe('completed')
    })
  })

  describe('updateProgress', () => {
    it('should update session data', () => {
      const horses = [new Horse(1, 'Test Horse', 80, '#FF0000')]
      const program = [{ round: 1, distance: 1200, horses, status: 'pending' }]
      const results = []

      session.updateProgress(horses, program, results, 0)

      expect(session.horses).toEqual(horses)
      expect(session.program).toEqual(program)
      expect(session.results).toEqual(results)
      expect(session.currentRaceIndex).toBe(0)
      expect(session.completedRaces).toBe(0)
    })

    it('should update lastAccessedAt when progress is updated', () => {
      const oldAccessTime = session.lastAccessedAt

      // Wait a bit to ensure time difference
      const delay = () => new Promise(resolve => setTimeout(resolve, 10))
      return delay().then(() => {
        session.updateProgress([], [], [], 0)
        expect(session.lastAccessedAt.getTime()).toBeGreaterThan(oldAccessTime.getTime())
      })
    })

    it('should update completedRaces based on results length', () => {
      const mockResults = [{}, {}, {}] // 3 results
      session.updateProgress([], [], mockResults, 2)
      expect(session.completedRaces).toBe(3)
    })
  })

  describe('complete', () => {
    it('should set status to completed', () => {
      session.complete()
      expect(session.status).toBe('completed')
    })
  })

  describe('interrupt', () => {
    it('should set status to interrupted', () => {
      session.interrupt()
      expect(session.status).toBe('interrupted')
    })

    it('should update lastAccessedAt when interrupted', () => {
      const oldAccessTime = session.lastAccessedAt

      const delay = () => new Promise(resolve => setTimeout(resolve, 10))
      return delay().then(() => {
        session.interrupt()
        expect(session.lastAccessedAt.getTime()).toBeGreaterThan(oldAccessTime.getTime())
      })
    })
  })

  describe('toJSON', () => {
    it('should serialize to JSON with all properties', () => {
      const horses = [new Horse(1, 'Test Horse', 80, '#FF0000')]
      const program = [{ round: 1, distance: 1200, horses, status: 'pending' }]
      const results = []

      session.updateProgress(horses, program, results, 0)
      const json = session.toJSON()

      expect(json).toHaveProperty('id', 'test-id-123')
      expect(json).toHaveProperty('name', 'Test Race Session')
      expect(json).toHaveProperty('createdAt')
      expect(json).toHaveProperty('lastAccessedAt')
      expect(json).toHaveProperty('status', 'active')
      expect(json).toHaveProperty('horses')
      expect(json).toHaveProperty('program')
      expect(json).toHaveProperty('results')
      expect(json).toHaveProperty('currentRaceIndex', 0)
      expect(json).toHaveProperty('completedRaces', 0)
      expect(json).toHaveProperty('totalRaces', 6)
    })
  })

  describe('fromJSON', () => {
    it('should deserialize from JSON', () => {
      const data = {
        id: 'json-id',
        name: 'JSON Session',
        createdAt: new Date('2024-01-01').toISOString(),
        lastAccessedAt: new Date('2024-01-02').toISOString(),
        status: 'interrupted',
        horses: [{ id: 1, name: 'Horse', condition: 80, color: '#FF0000' }],
        program: [],
        results: [],
        currentRaceIndex: 2,
        completedRaces: 2,
        totalRaces: 6
      }

      const restored = RaceSession.fromJSON(data)

      expect(restored).toBeInstanceOf(RaceSession)
      expect(restored.id).toBe('json-id')
      expect(restored.name).toBe('JSON Session')
      expect(restored.status).toBe('interrupted')
      expect(restored.currentRaceIndex).toBe(2)
      expect(restored.completedRaces).toBe(2)
      expect(restored.totalRaces).toBe(6)
      expect(restored.horses[0]).toBeInstanceOf(Horse)
    })

    it('should handle missing lastAccessedAt by using createdAt', () => {
      const data = {
        id: 'id',
        name: 'name',
        createdAt: new Date('2024-01-01').toISOString(),
        status: 'active',
        horses: [],
        program: [],
        results: [],
        currentRaceIndex: -1,
        completedRaces: 0,
        totalRaces: 6
      }

      const restored = RaceSession.fromJSON(data)
      expect(restored.lastAccessedAt.toISOString()).toBe(new Date('2024-01-01').toISOString())
    })

    it('should rehydrate Horse instances in horses array', () => {
      const data = {
        id: 'id',
        name: 'name',
        createdAt: new Date().toISOString(),
        status: 'active',
        horses: [{ id: 1, name: 'Horse', condition: 80, color: '#FF0000' }],
        program: [],
        results: [],
        currentRaceIndex: -1,
        completedRaces: 0,
        totalRaces: 6
      }

      const restored = RaceSession.fromJSON(data)
      expect(restored.horses[0]).toBeInstanceOf(Horse)
      expect(restored.horses[0].name).toBe('Horse')
    })

    it('should rehydrate Horse instances in program races', () => {
      const data = {
        id: 'id',
        name: 'name',
        createdAt: new Date().toISOString(),
        status: 'active',
        horses: [],
        program: [{
          round: 1,
          distance: 1200,
          horses: [{ id: 1, name: 'Horse', condition: 80, color: '#FF0000' }],
          status: 'pending'
        }],
        results: [],
        currentRaceIndex: -1,
        completedRaces: 0,
        totalRaces: 6
      }

      const restored = RaceSession.fromJSON(data)
      expect(restored.program[0].horses[0]).toBeInstanceOf(Horse)
    })

    it('should rehydrate RaceResult instances', () => {
      const data = {
        id: 'id',
        name: 'name',
        createdAt: new Date().toISOString(),
        status: 'active',
        horses: [],
        program: [],
        results: [{
          raceTitle: 'Test Race',
          distance: 1200,
          rankings: []
        }],
        currentRaceIndex: -1,
        completedRaces: 0,
        totalRaces: 6
      }

      const restored = RaceSession.fromJSON(data)
      expect(restored.results[0]).toBeInstanceOf(RaceResult)
    })
  })

  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = RaceSession.generateId()
      const id2 = RaceSession.generateId()

      expect(id1).toMatch(/^race_\d+_[a-z0-9]+$/)
      expect(id2).toMatch(/^race_\d+_[a-z0-9]+$/)
      expect(id1).not.toBe(id2)
    })

    it('should include timestamp in ID', () => {
      const before = Date.now()
      const id = RaceSession.generateId()
      const after = Date.now()

      const timestamp = parseInt(id.split('_')[1])
      expect(timestamp).toBeGreaterThanOrEqual(before)
      expect(timestamp).toBeLessThanOrEqual(after)
    })
  })
})
