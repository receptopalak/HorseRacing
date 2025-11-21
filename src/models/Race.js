/**
 * Race model representing a single race round
 */
export class Race {
  /**
   * @param {number} round - Round number (1-6)
   * @param {number} distance - Race distance in meters
   * @param {Array<Horse>} horses - Participating horses (10)
   */
  constructor(round, distance, horses) {
    this.round = round
    this.distance = distance
    this.horses = horses
    this.status = 'pending' // pending, running, completed
  }

  /**
   * Get formatted round number with ordinal suffix
   */
  get roundOrdinal() {
    const suffixes = ['th', 'st', 'nd', 'rd']
    const v = this.round % 100
    return this.round + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0])
  }

  /**
   * Get race title for display
   */
  get title() {
    return `${this.roundOrdinal} Lap - ${this.distance}m`
  }

  /**
   * Serialize for Vuex
   */
  toJSON() {
    return {
      round: this.round,
      distance: this.distance,
      horses: this.horses.map(h => h.toJSON ? h.toJSON() : h),
      status: this.status
    }
  }

  /**
   * Deserialize from plain object
   */
  static fromJSON(data) {
    const race = new Race(data.round, data.distance, data.horses)
    race.status = data.status
    return race
  }
}
