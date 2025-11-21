import { Horse } from '@/models/Horse'

/**
 * Service for generating random horses
 * Ensures diversity in names, conditions, and colors
 */
export class HorseGenerator {
  // 50 first names
  static FIRST_NAMES = [
    'Thunder', 'Lightning', 'Storm', 'Shadow', 'Midnight',
    'Golden', 'Silver', 'Ruby', 'Crystal', 'Diamond',
    'Blazing', 'Wild', 'Royal', 'Noble', 'Mystic',
    'Phoenix', 'Dragon', 'Tiger', 'Eagle', 'Falcon',
    'Spirit', 'Dream', 'Victory', 'Glory', 'Honor',
    'Brave', 'Swift', 'Flash', 'Sonic', 'Turbo',
    'Magic', 'Lucky', 'Champion', 'Star', 'Comet',
    'Rocket', 'Arrow', 'Bullet', 'Dash', 'Sprint',
    'Ocean', 'River', 'Mountain', 'Forest', 'Desert',
    'Fire', 'Ice', 'Wind', 'Earth', 'Sunset'
  ]

  // 50 last names
  static LAST_NAMES = [
    'Runner', 'Chaser', 'Striker', 'Warrior', 'Knight',
    'Prince', 'King', 'Queen', 'Baron', 'Duke',
    'Storm', 'Blaze', 'Flash', 'Thunder', 'Lightning',
    'Wind', 'Flame', 'Frost', 'Shadow', 'Light',
    'Star', 'Moon', 'Sun', 'Sky', 'Cloud',
    'Racer', 'Sprinter', 'Galloper', 'Flyer', 'Dancer',
    'Fighter', 'Hunter', 'Seeker', 'Finder', 'Winner',
    'Legend', 'Hero', 'Champion', 'Victor', 'Master',
    'Spirit', 'Soul', 'Heart', 'Dream', 'Hope',
    'Power', 'Force', 'Might', 'Glory', 'Pride'
  ]

  // 20 MAXIMALLY contrasting colors - consecutive horses get opposite colors
  // Each color jumps to opposite side of color wheel to ensure maximum distinction
  static COLORS = [
    '#FF0000', // 1. Bright Red
    '#00FFFF', // 2. Cyan (opposite)
    '#FF8800', // 3. Orange
    '#0088FF', // 4. Sky Blue (opposite)
    '#FFFF00', // 5. Yellow
    '#0000FF', // 6. Blue (opposite)
    '#00FF00', // 7. Lime
    '#FF00FF', // 8. Magenta (opposite)
    '#FFD700', // 9. Gold
    '#0066FF', // 10. Royal Blue (opposite)
    '#FF0080', // 11. Hot Pink
    '#00FF80', // 12. Spring Green (opposite)
    '#FF4400', // 13. Red-Orange
    '#00CCFF', // 14. Bright Cyan (opposite)
    '#AAFF00', // 15. Lime-Yellow
    '#5500FF', // 16. Indigo (opposite)
    '#FF6600', // 17. Bright Orange
    '#00FFAA', // 18. Turquoise (opposite)
    '#CC00FF', // 19. Purple
    '#00DD00'  // 20. Green (opposite)
  ]

  /**
   * Generate a random horse
   * @param {number} id - Horse ID
   * @returns {Horse}
   */
  static generateHorse(id) {
    // Randomly select first name and last name
    const firstName = this.FIRST_NAMES[Math.floor(Math.random() * this.FIRST_NAMES.length)]
    const lastName = this.LAST_NAMES[Math.floor(Math.random() * this.LAST_NAMES.length)]
    const name = `${firstName} ${lastName}`

    // Condition between 20% and 100% (minimum 20%)
    const condition = Math.floor(Math.random() * 81) + 20

    // Assign unique color based on ID to ensure all 20 horses have different colors
    const color = this.COLORS[(id - 1) % this.COLORS.length]

    return new Horse(id, name, condition, color)
  }

  /**
   * Generate a pool of horses
   * @param {number} count - Number of horses to generate (default: 20)
   * @returns {Array<Horse>}
   */
  static generateHorsePool(count = 20) {
    return Array.from({ length: count }, (_, i) => this.generateHorse(i + 1))
  }

  /**
   * Select random horses from a pool
   * @param {Array<Horse>} pool - Horse pool
   * @param {number} count - Number to select (default: 10)
   * @returns {Array<Horse>}
   */
  static selectRandomHorses(pool, count = 10) {
    const shuffled = [...pool].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, count)
  }
}
