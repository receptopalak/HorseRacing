import { describe, it, expect, beforeEach } from 'vitest'
import { Race } from '../Race'
import { Horse } from '../Horse'

describe('Race', () => {
  let mockHorses

  beforeEach(() => {
    mockHorses = [
      new Horse(1, 'Thunder', 90, '#FF0000'),
      new Horse(2, 'Lightning', 85, '#00FF00'),
      new Horse(3, 'Storm', 80, '#0000FF'),
      new Horse(4, 'Wind', 88, '#FFFF00'),
      new Horse(5, 'Rain', 82, '#FF00FF'),
      new Horse(6, 'Snow', 87, '#00FFFF'),
      new Horse(7, 'Blizzard', 91, '#FFA500'),
      new Horse(8, 'Tornado', 86, '#800080'),
      new Horse(9, 'Hurricane', 84, '#008000'),
      new Horse(10, 'Typhoon', 89, '#000080')
    ]
  })

  describe('Constructor', () => {
    it('should create a race with correct properties', () => {
      const race = new Race(1, 1200, mockHorses)

      expect(race.round).toBe(1)
      expect(race.distance).toBe(1200)
      expect(race.horses).toEqual(mockHorses)
      expect(race.status).toBe('pending')
    })

    it('should default status to pending', () => {
      const race = new Race(1, 1200, mockHorses)
      expect(race.status).toBe('pending')
    })

    it('should accept different round numbers', () => {
      for (let i = 1; i <= 6; i++) {
        const race = new Race(i, 1200, mockHorses)
        expect(race.round).toBe(i)
      }
    })

    it('should accept different distances', () => {
      const distances = [1200, 1400, 1600, 1800, 2000, 2200]
      distances.forEach(distance => {
        const race = new Race(1, distance, mockHorses)
        expect(race.distance).toBe(distance)
      })
    })
  })

  describe('roundOrdinal getter', () => {
    it('should return correct ordinal for 1st', () => {
      const race = new Race(1, 1200, mockHorses)
      expect(race.roundOrdinal).toBe('1st')
    })

    it('should return correct ordinal for 2nd', () => {
      const race = new Race(2, 1200, mockHorses)
      expect(race.roundOrdinal).toBe('2nd')
    })

    it('should return correct ordinal for 3rd', () => {
      const race = new Race(3, 1200, mockHorses)
      expect(race.roundOrdinal).toBe('3rd')
    })

    it('should return correct ordinal for 4th-6th', () => {
      const race4 = new Race(4, 1200, mockHorses)
      expect(race4.roundOrdinal).toBe('4th')

      const race5 = new Race(5, 1200, mockHorses)
      expect(race5.roundOrdinal).toBe('5th')

      const race6 = new Race(6, 1200, mockHorses)
      expect(race6.roundOrdinal).toBe('6th')
    })

    it('should handle special cases like 11th, 12th, 13th', () => {
      const race11 = new Race(11, 1200, mockHorses)
      expect(race11.roundOrdinal).toBe('11th')

      const race12 = new Race(12, 1200, mockHorses)
      expect(race12.roundOrdinal).toBe('12th')

      const race13 = new Race(13, 1200, mockHorses)
      expect(race13.roundOrdinal).toBe('13th')
    })

    it('should handle 21st, 22nd, 23rd correctly', () => {
      const race21 = new Race(21, 1200, mockHorses)
      expect(race21.roundOrdinal).toBe('21st')

      const race22 = new Race(22, 1200, mockHorses)
      expect(race22.roundOrdinal).toBe('22nd')

      const race23 = new Race(23, 1200, mockHorses)
      expect(race23.roundOrdinal).toBe('23rd')
    })
  })

  describe('title getter', () => {
    it('should return correct title format', () => {
      const race = new Race(1, 1200, mockHorses)
      expect(race.title).toBe('1st Lap - 1200m')
    })

    it('should include correct ordinal and distance', () => {
      const race2 = new Race(2, 1400, mockHorses)
      expect(race2.title).toBe('2nd Lap - 1400m')

      const race3 = new Race(3, 1600, mockHorses)
      expect(race3.title).toBe('3rd Lap - 1600m')

      const race6 = new Race(6, 2200, mockHorses)
      expect(race6.title).toBe('6th Lap - 2200m')
    })
  })

  describe('toJSON', () => {
    it('should serialize to JSON with all properties', () => {
      const race = new Race(1, 1200, mockHorses)
      const json = race.toJSON()

      expect(json).toHaveProperty('round', 1)
      expect(json).toHaveProperty('distance', 1200)
      expect(json).toHaveProperty('horses')
      expect(json).toHaveProperty('status', 'pending')
    })

    it('should serialize horses to JSON', () => {
      const race = new Race(1, 1200, mockHorses)
      const json = race.toJSON()

      expect(json.horses).toHaveLength(10)
      expect(json.horses[0]).toHaveProperty('id')
      expect(json.horses[0]).toHaveProperty('name')
      expect(json.horses[0]).toHaveProperty('condition')
      expect(json.horses[0]).toHaveProperty('color')
    })

    it('should preserve status when serializing', () => {
      const race = new Race(1, 1200, mockHorses)
      race.status = 'running'

      const json = race.toJSON()
      expect(json.status).toBe('running')
    })

    it('should handle horses without toJSON method', () => {
      const plainHorses = [{ id: 1, name: 'Test', condition: 80, color: '#FF0000' }]
      const race = new Race(1, 1200, plainHorses)
      const json = race.toJSON()

      expect(json.horses[0]).toEqual(plainHorses[0])
    })
  })

  describe('fromJSON', () => {
    it('should deserialize from JSON', () => {
      const data = {
        round: 2,
        distance: 1400,
        horses: [
          { id: 1, name: 'Test Horse', condition: 85, color: '#FF0000' }
        ],
        status: 'completed'
      }

      const race = Race.fromJSON(data)

      expect(race).toBeInstanceOf(Race)
      expect(race.round).toBe(2)
      expect(race.distance).toBe(1400)
      expect(race.horses).toHaveLength(1)
      expect(race.status).toBe('completed')
    })

    it('should handle different status values', () => {
      const statuses = ['pending', 'running', 'completed', 'interrupted']

      statuses.forEach(status => {
        const data = {
          round: 1,
          distance: 1200,
          horses: [],
          status
        }

        const race = Race.fromJSON(data)
        expect(race.status).toBe(status)
      })
    })

    it('should work with full race data', () => {
      const data = {
        round: 3,
        distance: 1600,
        horses: mockHorses.map(h => h.toJSON()),
        status: 'pending'
      }

      const race = Race.fromJSON(data)

      expect(race.round).toBe(3)
      expect(race.distance).toBe(1600)
      expect(race.horses).toHaveLength(10)
      expect(race.status).toBe('pending')
      expect(race.title).toBe('3rd Lap - 1600m')
      expect(race.roundOrdinal).toBe('3rd')
    })

    it('should preserve horse data integrity', () => {
      const horseData = {
        id: 99,
        name: 'Special Horse',
        condition: 95,
        color: '#ABCDEF'
      }

      const data = {
        round: 1,
        distance: 1200,
        horses: [horseData],
        status: 'pending'
      }

      const race = Race.fromJSON(data)
      expect(race.horses[0]).toEqual(horseData)
    })
  })

  describe('Status transitions', () => {
    it('should allow status changes', () => {
      const race = new Race(1, 1200, mockHorses)

      expect(race.status).toBe('pending')

      race.status = 'running'
      expect(race.status).toBe('running')

      race.status = 'completed'
      expect(race.status).toBe('completed')
    })

    it('should maintain status through serialization', () => {
      const race = new Race(1, 1200, mockHorses)
      race.status = 'running'

      const json = race.toJSON()
      const restored = Race.fromJSON(json)

      expect(restored.status).toBe('running')
    })
  })

  describe('Horse management', () => {
    it('should accept exactly 10 horses', () => {
      const race = new Race(1, 1200, mockHorses)
      expect(race.horses).toHaveLength(10)
    })

    it('should maintain horse order', () => {
      const race = new Race(1, 1200, mockHorses)

      for (let i = 0; i < mockHorses.length; i++) {
        expect(race.horses[i].id).toBe(mockHorses[i].id)
        expect(race.horses[i].name).toBe(mockHorses[i].name)
      }
    })

    it('should handle Horse instances', () => {
      const race = new Race(1, 1200, mockHorses)
      expect(race.horses[0]).toBeInstanceOf(Horse)
    })
  })

  describe('Integration tests', () => {
    it('should work in a complete race lifecycle', () => {
      // Create race
      const race = new Race(1, 1200, mockHorses)
      expect(race.status).toBe('pending')
      expect(race.title).toBe('1st Lap - 1200m')

      // Start race
      race.status = 'running'
      expect(race.status).toBe('running')

      // Serialize during race
      const json = race.toJSON()
      expect(json.status).toBe('running')

      // Complete race
      race.status = 'completed'

      // Restore from JSON
      const restored = Race.fromJSON(race.toJSON())
      expect(restored.status).toBe('completed')
      expect(restored.round).toBe(1)
      expect(restored.distance).toBe(1200)
      expect(restored.horses).toHaveLength(10)
    })
  })
})
