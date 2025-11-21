import { describe, it, expect } from 'vitest'
import { RaceScheduler } from '../RaceScheduler'
import { HorseGenerator } from '../HorseGenerator'
import { Race } from '@/models/Race'

describe('RaceScheduler', () => {
  it('should generate program with 6 races', () => {
    const horses = HorseGenerator.generateHorsePool(20)
    const program = RaceScheduler.generateProgram(horses)

    expect(program).toHaveLength(6)
    program.forEach(race => {
      expect(race).toBeInstanceOf(Race)
    })
  })

  it('should generate races with correct distances', () => {
    const horses = HorseGenerator.generateHorsePool(20)
    const program = RaceScheduler.generateProgram(horses)

    expect(program[0].distance).toBe(1200)
    expect(program[1].distance).toBe(1400)
    expect(program[2].distance).toBe(1600)
    expect(program[3].distance).toBe(1800)
    expect(program[4].distance).toBe(2000)
    expect(program[5].distance).toBe(2200)
  })

  it('should assign 10 horses to each race', () => {
    const horses = HorseGenerator.generateHorsePool(20)
    const program = RaceScheduler.generateProgram(horses)

    program.forEach(race => {
      expect(race.horses).toHaveLength(10)
    })
  })

  it('should validate valid program', () => {
    const horses = HorseGenerator.generateHorsePool(20)
    const program = RaceScheduler.generateProgram(horses)

    expect(RaceScheduler.validateProgram(program)).toBe(true)
  })

  it('should get distance for specific round', () => {
    expect(RaceScheduler.getDistanceForRound(1)).toBe(1200)
    expect(RaceScheduler.getDistanceForRound(3)).toBe(1600)
    expect(RaceScheduler.getDistanceForRound(6)).toBe(2200)
  })
})
