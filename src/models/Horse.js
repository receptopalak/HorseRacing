/**
 * Horse model representing a racing horse
 * Each horse has unique attributes that affect race performance
 */
export class Horse {
  /**
   * @param {number} id - Unique identifier
   * @param {string} name - Horse name
   * @param {number} condition - Condition score (1-100)
   * @param {string} color - Unique color for visualization
   */
  constructor(id, name, condition, color) {
    this.id = id
    this.name = name
    this.condition = condition
    this.color = color
  }

  /**
   * Calculate speed factor based on condition and randomness
   * Higher condition = better performance, but luck plays a role
   * @param {number} distance - Race distance in meters
   * @returns {number} Speed multiplier (0.5-1.8)
   */
  calculateSpeed(distance) {
    // Condition contributes 50% to performance (0.0 - 0.5)
    const conditionFactor = (this.condition / 100) * 0.5

    // Random factor contributes 50% (0.0 - 0.8) - more variation
    const randomFactor = Math.random() * 0.8

    // Distance stamina: longer races favor higher condition horses (0.0 - 0.2)
    const staminaBonus = (distance / 2200) * (this.condition / 100) * 0.2

    // Base speed minimum to prevent too slow horses
    const baseSpeed = 0.3

    return baseSpeed + conditionFactor + randomFactor + staminaBonus
  }

  /**
   * Create a plain object representation
   * Useful for Vuex state serialization
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      condition: this.condition,
      color: this.color
    }
  }

  /**
   * Create Horse instance from plain object
   * @param {Object} data - Plain object with horse data
   */
  static fromJSON(data) {
    return new Horse(data.id, data.name, data.condition, data.color)
  }
}
