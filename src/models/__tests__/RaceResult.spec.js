import { describe, it, expect, beforeEach } from 'vitest'
import { RaceResult } from '../RaceResult'
import { Horse } from '../Horse'

describe('RaceResult', () => {
  let mockRace
  let mockRankings

  beforeEach(() => {
    const horse1 = new Horse(1, 'Thunder', 90, '#FF0000')
    const horse2 = new Horse(2, 'Lightning', 85, '#00FF00')
    const horse3 = new Horse(3, 'Storm', 80, '#0000FF')

    mockRace = {
      round: 1,
      distance: 1200,
      horses: [horse1, horse2, horse3],
      status: 'completed'
    }

    mockRankings = [
      { horse: horse1.toJSON(), position: 1, time: '75.50', speed: '1.150' },
      { horse: horse2.toJSON(), position: 2, time: '76.20', speed: '1.120' },
      { horse: horse3.toJSON(), position: 3, time: '77.00', speed: '1.100' }
    ]
  })

  describe('Constructor', () => {
    it('should create a result with correct properties', () => {
      const result = new RaceResult(mockRace, mockRankings)

      expect(result.raceTitle).toBe('1st Lap - 1200m')
      expect(result.raceRound).toBe(1)
      expect(result.distance).toBe(1200)
      expect(result.rankings).toEqual(mockRankings)
      expect(result.completedAt).toBeInstanceOf(Date)
    })

    it('should set completedAt to current time', () => {
      const before = Date.now()
      const result = new RaceResult(mockRace, mockRankings)
      const after = Date.now()

      expect(result.completedAt.getTime()).toBeGreaterThanOrEqual(before)
      expect(result.completedAt.getTime()).toBeLessThanOrEqual(after)
    })

    it('should format race title correctly for different rounds', () => {
      const race2 = { ...mockRace, round: 2 }
      const result2 = new RaceResult(race2, mockRankings)
      expect(result2.raceTitle).toBe('2nd Lap - 1200m')

      const race3 = { ...mockRace, round: 3 }
      const result3 = new RaceResult(race3, mockRankings)
      expect(result3.raceTitle).toBe('3rd Lap - 1200m')

      const race4 = { ...mockRace, round: 4 }
      const result4 = new RaceResult(race4, mockRankings)
      expect(result4.raceTitle).toBe('4th Lap - 1200m')
    })

    it('should handle different distances', () => {
      const longRace = { ...mockRace, distance: 2200 }
      const result = new RaceResult(longRace, mockRankings)
      expect(result.distance).toBe(2200)
      expect(result.raceTitle).toBe('1st Lap - 2200m')
    })
  })

  describe('winner', () => {
    it('should return the first horse in rankings', () => {
      const result = new RaceResult(mockRace, mockRankings)
      const winner = result.winner

      expect(winner).toEqual(mockRankings[0])
      expect(winner.position).toBe(1)
      expect(winner.horse.name).toBe('Thunder')
    })

    it('should return undefined if rankings are empty', () => {
      const result = new RaceResult(mockRace, [])
      expect(result.winner).toBeUndefined()
    })
  })

  describe('toJSON', () => {
    it('should serialize to JSON with all properties', () => {
      const result = new RaceResult(mockRace, mockRankings)
      const json = result.toJSON()

      expect(json).toHaveProperty('raceRound', 1)
      expect(json).toHaveProperty('distance', 1200)
      expect(json).toHaveProperty('rankings')
      expect(json).toHaveProperty('completedAt')
      expect(json.rankings).toHaveLength(3)
    })

    it('should preserve ranking order', () => {
      const result = new RaceResult(mockRace, mockRankings)
      const json = result.toJSON()

      expect(json.rankings[0].position).toBe(1)
      expect(json.rankings[1].position).toBe(2)
      expect(json.rankings[2].position).toBe(3)
    })

    it('should include all ranking properties', () => {
      const result = new RaceResult(mockRace, mockRankings)
      const json = result.toJSON()

      const firstRanking = json.rankings[0]
      expect(firstRanking).toHaveProperty('horse')
      expect(firstRanking).toHaveProperty('position')
      expect(firstRanking).toHaveProperty('time')
      expect(firstRanking).toHaveProperty('speed')
    })
  })

  describe('fromJSON', () => {
    it('should deserialize from JSON', () => {
      const data = {
        raceRound: 2,
        distance: 1400,
        rankings: mockRankings,
        completedAt: new Date('2024-01-01').toISOString()
      }

      const result = RaceResult.fromJSON(data)

      expect(result).toBeInstanceOf(RaceResult)
      expect(result.raceRound).toBe(2)
      expect(result.raceTitle).toBe('2nd Lap - 1400m')
      expect(result.distance).toBe(1400)
      expect(result.rankings).toEqual(mockRankings)
      expect(result.completedAt).toEqual(new Date('2024-01-01'))
    })

    it('should handle missing completedAt', () => {
      const data = {
        raceRound: 1,
        distance: 1200,
        rankings: mockRankings
      }

      const result = RaceResult.fromJSON(data)
      expect(result.completedAt).toBeInstanceOf(Date)
    })

    it('should preserve ranking data integrity', () => {
      const data = {
        raceRound: 1,
        distance: 1200,
        rankings: [
          { horse: { id: 1, name: 'Horse1' }, position: 1, time: '75.0', speed: '1.2' }
        ],
        completedAt: new Date().toISOString()
      }

      const result = RaceResult.fromJSON(data)
      expect(result.rankings[0].horse.id).toBe(1)
      expect(result.rankings[0].position).toBe(1)
      expect(result.rankings[0].time).toBe('75.0')
      expect(result.rankings[0].speed).toBe('1.2')
    })

    it('should handle empty rankings array', () => {
      const data = {
        raceRound: 1,
        distance: 1200,
        rankings: [],
        completedAt: new Date().toISOString()
      }

      const result = RaceResult.fromJSON(data)
      expect(result.rankings).toEqual([])
      expect(result.winner).toBeUndefined()
    })
  })

  describe('Formatting helpers', () => {
    it('should format ordinal suffixes correctly', () => {
      const races = [
        { round: 1, expected: '1st' },
        { round: 2, expected: '2nd' },
        { round: 3, expected: '3rd' },
        { round: 4, expected: '4th' },
        { round: 11, expected: '11th' },
        { round: 21, expected: '21st' },
        { round: 22, expected: '22nd' },
        { round: 23, expected: '23rd' }
      ]

      races.forEach(({ round, expected }) => {
        const race = { ...mockRace, round }
        const result = new RaceResult(race, mockRankings)
        expect(result.raceTitle).toContain(expected)
      })
    })
  })

  describe('Integration with Horse model', () => {
    it('should work with Horse instances in rankings', () => {
      const horse = new Horse(1, 'TestHorse', 85, '#FFFFFF')
      const rankings = [
        { horse: horse.toJSON(), position: 1, time: '75.0', speed: '1.2' }
      ]

      const result = new RaceResult(mockRace, rankings)
      expect(result.winner.horse.name).toBe('TestHorse')
      expect(result.winner.horse.id).toBe(1)
    })
  })
})
