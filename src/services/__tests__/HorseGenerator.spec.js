import { describe, it, expect } from 'vitest'
import { HorseGenerator } from '../HorseGenerator'
import { Horse } from '@/models/Horse'

describe('HorseGenerator', () => {
  it('should generate a single horse', () => {
    const horse = HorseGenerator.generateHorse(1)

    expect(horse).toBeInstanceOf(Horse)
    expect(horse.id).toBe(1)
    expect(horse.name).toBeTruthy()
    expect(horse.condition).toBeGreaterThanOrEqual(1)
    expect(horse.condition).toBeLessThanOrEqual(100)
    expect(horse.color).toBeTruthy()
  })

  it('should generate horse pool of 20', () => {
    const pool = HorseGenerator.generateHorsePool(20)

    expect(pool).toHaveLength(20)
    expect(pool[0]).toBeInstanceOf(Horse)
    expect(pool[19]).toBeInstanceOf(Horse)
  })

  it('should generate horses with unique IDs', () => {
    const pool = HorseGenerator.generateHorsePool(20)
    const ids = pool.map(h => h.id)
    const uniqueIds = new Set(ids)

    expect(uniqueIds.size).toBe(20)
  })

  it('should select random horses from pool', () => {
    const pool = HorseGenerator.generateHorsePool(20)
    const selected = HorseGenerator.selectRandomHorses(pool, 10)

    expect(selected).toHaveLength(10)
    selected.forEach(horse => {
      expect(horse).toBeInstanceOf(Horse)
    })
  })

  it('should select different horses on multiple calls', () => {
    const pool = HorseGenerator.generateHorsePool(20)
    const selected1 = HorseGenerator.selectRandomHorses(pool, 10)
    const selected2 = HorseGenerator.selectRandomHorses(pool, 10)

    const ids1 = selected1.map(h => h.id).sort()
    const ids2 = selected2.map(h => h.id).sort()

    // Very unlikely to be identical
    expect(JSON.stringify(ids1)).not.toBe(JSON.stringify(ids2))
  })
})
