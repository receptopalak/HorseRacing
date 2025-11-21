import { describe, it, expect } from 'vitest'
import { Horse } from '../Horse'

describe('Horse', () => {
  it('should create a horse with correct properties', () => {
    const horse = new Horse(1, 'Thunder', 85, '#FF0000')

    expect(horse.id).toBe(1)
    expect(horse.name).toBe('Thunder')
    expect(horse.condition).toBe(85)
    expect(horse.color).toBe('#FF0000')
  })

  it('should calculate speed based on condition', () => {
    const horse = new Horse(1, 'Fast Horse', 90, '#FF0000')
    const speed = horse.calculateSpeed(1200)

    expect(speed).toBeGreaterThan(0)
    expect(speed).toBeLessThanOrEqual(1.5)
  })

  it('should serialize to JSON', () => {
    const horse = new Horse(1, 'Thunder', 85, '#FF0000')
    const json = horse.toJSON()

    expect(json).toEqual({
      id: 1,
      name: 'Thunder',
      condition: 85,
      color: '#FF0000'
    })
  })

  it('should deserialize from JSON', () => {
    const data = {
      id: 1,
      name: 'Thunder',
      condition: 85,
      color: '#FF0000'
    }
    const horse = Horse.fromJSON(data)

    expect(horse).toBeInstanceOf(Horse)
    expect(horse.id).toBe(1)
    expect(horse.name).toBe('Thunder')
  })
})
