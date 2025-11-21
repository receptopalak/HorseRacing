import { RaceResult } from '@/models/RaceResult'
import { Horse } from '@/models/Horse'

/**
 * Service for executing races and calculating results
 * Handles race simulation with realistic timing
 */
export class RaceEngine {
  /**
   * Simulate a race and return results
   * @param {Race} race - The race to simulate
   * @returns {RaceResult}
   */
  static simulateRace(race) {
    // Ensure all horses are Horse instances before simulation
    const validatedRace = {
      ...race,
      horses: race.horses.map(horse =>
        horse instanceof Horse ? horse : Horse.fromJSON(horse)
      )
    }

    const rankings = validatedRace.horses.map(horse => {
      const speed = horse.calculateSpeed(validatedRace.distance)
      // Base time for the distance (in seconds) + variation based on speed
      const baseTime = validatedRace.distance / 15 // ~15 m/s average
      const time = baseTime / speed

      return {
        horse: horse.toJSON ? horse.toJSON() : horse,
        speed: speed.toFixed(3),
        time: time.toFixed(2)
      }
    })

    // Sort by time (fastest first)
    rankings.sort((a, b) => parseFloat(a.time) - parseFloat(b.time))

    // Add positions
    rankings.forEach((ranking, index) => {
      ranking.position = index + 1
    })

    return new RaceResult(validatedRace, rankings)
  }

  /**
   * Animate a race with progress updates
   * @param {Race} race - The race to run
   * @param {Function} onProgress - Callback for progress updates
   * @param {number} duration - Race duration in milliseconds
   * @returns {Promise<RaceResult>}
   */
  static async runRace(race, onProgress, duration = 5000) {
    // Ensure all horses are Horse instances before running
    const validatedRace = {
      ...race,
      horses: race.horses.map(horse =>
        horse instanceof Horse ? horse : Horse.fromJSON(horse)
      )
    }

    // Pre-calculate ranking order
    const result = this.simulateRace(validatedRace)

    return new Promise((resolve) => {
      const startTime = Date.now()
      const updateInterval = 100 // Update every 100ms for smoother animation

      // Calculate speed multiplier for each horse based on their ranking
      // This creates more realistic separation between horses
      const speedMultipliers = {}
      const finishTimes = {} // Track actual finish times

      result.rankings.forEach((ranking, index) => {
        // First place gets 1.0, gradually decrease but minimum 0.98 (98%)
        // Smaller step (0.003) creates tighter racing with less spread
        const multiplier = 1.0 - (index * 0.003)
        speedMultipliers[ranking.horse.id] = Math.max(multiplier, 0.98)
      })

      // Track last progress for each horse to ensure monotonic increase
      const lastProgress = {}
      // Create unique speed variation pattern for each horse
      const speedPatterns = {}
      validatedRace.horses.forEach(horse => {
        lastProgress[horse.id] = 0
        // Each horse gets unique frequency and phase for speed variation
        speedPatterns[horse.id] = {
          frequency: 5 + Math.random() * 5, // 5-10 cycles during race
          phase: Math.random() * Math.PI * 2, // Random starting phase
          amplitude: 0.06 + Math.random() * 0.06 // 6-12% speed variation
        }
      })

      const interval = setInterval(() => {
        // Check if race should continue (callback returns false to stop)
        // Pass current positions to callback
        // We calculate positions first to pass them, but if callback returns false, we abort
        
        const elapsed = Date.now() - startTime
        const elapsedSeconds = elapsed / 1000
        const progress = Math.min(elapsed / duration, 1)

        // Calculate current positions based on each horse's individual speed
        const positions = validatedRace.horses.map(horse => {
          const finalRanking = result.rankings.find(r => r.horse.id === horse.id)
          const horseSpeed = parseFloat(finalRanking.speed)
          const speedMultiplier = speedMultipliers[horse.id]

          // Dynamic speed variation using sine wave (horses speed up and slow down)
          const pattern = speedPatterns[horse.id]
          const waveInput = progress * pattern.frequency + pattern.phase
          const rawVariation = Math.sin(waveInput) * pattern.amplitude

          // Make speedups more noticeable than slowdowns (asymmetric)
          // Positive values (speedup) stay same, negative values (slowdown) are reduced by 60%
          const speedVariation = rawVariation > 0 ? rawVariation : rawVariation * 0.4

          // Apply speed variation with bounds to prevent extreme speeds
          // Minimum 95% of base speed, maximum 112% of base speed
          const dynamicMultiplier = Math.max(0.95, Math.min(1.12, speedMultiplier * (1 + speedVariation)))

          // Each horse progresses at their own rate with dynamic speed changes
          // Faster horses reach 100% earlier, slower horses later
          // Allow up to 110% so horses fully cross the finish line
          const horseProgress = Math.min(progress * horseSpeed * dynamicMultiplier * 3.0, 1.1)

          // Ensure progress never goes backwards
          const finalProgress = Math.max(horseProgress, lastProgress[horse.id])
          lastProgress[horse.id] = finalProgress

          // Record finish time when horse reaches 100%
          if (finalProgress >= 1.0 && !finishTimes[horse.id]) {
            finishTimes[horse.id] = elapsedSeconds
          }

          return {
            horseId: horse.id,
            distance: finalProgress * validatedRace.distance,
            progress: finalProgress
          }
        })

        // Report progress and check if we should continue
        const shouldContinue = onProgress(positions)
        if (shouldContinue === false) {
          clearInterval(interval)
          // Resolve with null to indicate cancellation
          resolve(null)
          return
        }

        // Check if ALL horses have finished (not just the first one)
        // Check at 1.05 so all horses fully cross the finish line
        const minProgress = Math.min(...positions.map(p => p.progress))
        const allHorsesFinished = minProgress >= 1.05

        // Wait until ALL horses finish, then end race
        if (allHorsesFinished) {
          clearInterval(interval)

          // Ensure final positions show horses past finish line
          const finalPositions = validatedRace.horses.map(horse => ({
            horseId: horse.id,
            distance: validatedRace.distance * 1.1,
            progress: 1.1
          }))
          onProgress(finalPositions)

          // Update result with actual finish times
          result.rankings.forEach(ranking => {
            ranking.time = (finishTimes[ranking.horse.id] || elapsedSeconds).toFixed(2)
          })

          resolve(result)
        } else if (progress >= 1.5) {
          // Safety timeout to ensure race ends (increased to 1.5x duration)
          clearInterval(interval)

          const finalPositions = validatedRace.horses.map(horse => ({
            horseId: horse.id,
            distance: validatedRace.distance * 1.1,
            progress: 1.1
          }))
          onProgress(finalPositions)

          // Update result with actual finish times
          result.rankings.forEach(ranking => {
            ranking.time = (finishTimes[ranking.horse.id] || elapsedSeconds).toFixed(2)
          })

          resolve(result)
        }
      }, updateInterval)
    })
  }

  /**
   * Calculate estimated race duration based on distance
   * @param {number} distance - Race distance in meters
   * @returns {number} Duration in milliseconds
   */
  static calculateRaceDuration(distance) {
    // Realistic race durations with better viewing experience
    // 1200m = 30 seconds, 1400m = 35 seconds, 1600m = 40 seconds
    // 1800m = 45 seconds, 2000m = 50 seconds, 2200m = 55 seconds
    return 30000 + (distance - 1200) * 25
  }
}
