import { RaceResult } from './RaceResult'
import { Horse } from './Horse'

/**
 * RaceSession model representing a complete race day
 * Tracks all races, results, and session status
 */
export class RaceSession {
  /**
   * @param {string} id - Unique session identifier
   * @param {string} name - User-provided session name
   * @param {Date} createdAt - Session creation timestamp
   * @param {string} status - Session status: 'active', 'completed', 'interrupted'
   * @param {Array} horses - All horses in this session
   * @param {Array} program - Race program
   * @param {Array} results - Race results
   * @param {number} currentRaceIndex - Current race index
   * @param {Date} lastAccessedAt - Last time session was accessed/modified
   */
  constructor(id, name, createdAt = new Date(), status = 'active') {
    this.id = id
    this.name = name
    this.createdAt = createdAt
    this.lastAccessedAt = createdAt // Initially same as createdAt
    this.status = status
    this.horses = []
    this.program = []
    this.results = []
    this.currentRaceIndex = -1
    this.completedRaces = 0
    this.totalRaces = 6
  }

  /**
   * Update session data and last accessed timestamp
   */
  updateProgress(horses, program, results, currentRaceIndex) {
    this.horses = horses
    this.program = program
    this.results = results
    this.currentRaceIndex = currentRaceIndex
    this.completedRaces = results.length
    this.lastAccessedAt = new Date() // Update last accessed time
  }

  /**
   * Mark session as completed
   */
  complete() {
    this.status = 'completed'
  }

  /**
   * Mark session as interrupted and update last accessed time
   */
  interrupt() {
    this.status = 'interrupted'
    this.lastAccessedAt = new Date()
  }

  /**
   * Create a plain object representation
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      createdAt: this.createdAt,
      lastAccessedAt: this.lastAccessedAt,
      status: this.status,
      horses: this.horses,
      program: this.program,
      results: this.results,
      currentRaceIndex: this.currentRaceIndex,
      completedRaces: this.completedRaces,
      totalRaces: this.totalRaces
    }
  }

  /**
   * Create RaceSession instance from plain object
   */
  static fromJSON(data) {
    const session = new RaceSession(
      data.id,
      data.name,
      new Date(data.createdAt),
      data.status
    )

    // Restore lastAccessedAt (fallback to createdAt for backward compatibility)
    session.lastAccessedAt = data.lastAccessedAt ? new Date(data.lastAccessedAt) : new Date(data.createdAt)

    // Rehydrate horses as Horse instances
    session.horses = (data.horses || []).map(horse =>
      horse instanceof Horse ? horse : Horse.fromJSON(horse)
    )

    // Rehydrate program with Horse instances
    session.program = (data.program || []).map(race => ({
      ...race,
      horses: race.horses.map(horse =>
        horse instanceof Horse ? horse : Horse.fromJSON(horse)
      )
    }))

    // Rehydrate results as RaceResult instances
    session.results = (data.results || []).map(result =>
      result instanceof RaceResult ? result : RaceResult.fromJSON(result)
    )

    session.currentRaceIndex = data.currentRaceIndex || -1
    session.completedRaces = data.completedRaces || 0
    session.totalRaces = data.totalRaces || 6
    return session
  }

  /**
   * Generate unique session ID
   */
  static generateId() {
    return `race_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}
