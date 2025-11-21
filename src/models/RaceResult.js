/**
 * RaceResult model representing the outcome of a completed race
 */
export class RaceResult {
  /**
   * @param {Race} race - The race that was completed
   * @param {Array} rankings - Sorted array of race outcomes
   */
  constructor(race, rankings) {
    this.raceRound = race.round
    this.distance = race.distance
    this.rankings = rankings // [{position, horse, time, speed}]
    this.completedAt = new Date()
  }

  /**
   * Get the winner (first place)
   */
  get winner() {
    return this.rankings[0]
  }

  /**
   * Get top 3 finishers
   */
  get podium() {
    return this.rankings.slice(0, 3)
  }

  /**
   * Get race title
   */
  get title() {
    const suffixes = ['th', 'st', 'nd', 'rd']
    const v = this.raceRound % 100
    const ordinal = this.raceRound + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0])
    return `${ordinal} Lap - ${this.distance}m`
  }

  /**
   * Alias for title (backwards compatibility)
   */
  get raceTitle() {
    return this.title
  }

  /**
   * Serialize for Vuex
   */
  toJSON() {
    return {
      raceRound: this.raceRound,
      distance: this.distance,
      rankings: this.rankings,
      completedAt: this.completedAt.toISOString()
    }
  }

  /**
   * Deserialize from plain object
   */
  static fromJSON(data) {
    const result = new RaceResult(
      { round: data.raceRound, distance: data.distance },
      data.rankings
    )
    result.completedAt = new Date(data.completedAt)
    return result
  }
}
