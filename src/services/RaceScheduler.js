import { Race } from '@/models/Race'
import { HorseGenerator } from './HorseGenerator'

/**
 * Service for creating race schedules
 * Manages the 6-round structure with varying distances
 */
export class RaceScheduler {
  static RACE_DISTANCES = [1200, 1400, 1600, 1800, 2000, 2200]

  /**
   * Generate a complete race program (6 rounds)
   * @param {Array<Horse>} horsePool - Available horses
   * @returns {Array<Race>}
   */
  static generateProgram(horsePool) {
    return this.RACE_DISTANCES.map((distance, index) => {
      const round = index + 1
      const selectedHorses = HorseGenerator.selectRandomHorses(horsePool, 10)
      return new Race(round, distance, selectedHorses)
    })
  }

  /**
   * Get distance for a specific round
   * @param {number} round - Round number (1-6)
   * @returns {number} Distance in meters
   */
  static getDistanceForRound(round) {
    return this.RACE_DISTANCES[round - 1] || 1200
  }

  /**
   * Validate race program
   * @param {Array<Race>} program
   * @returns {boolean}
   */
  static validateProgram(program) {
    return program.length === 6 &&
           program.every(race => race.horses.length === 10) &&
           program.every((race, i) => race.distance === this.RACE_DISTANCES[i])
  }
}
