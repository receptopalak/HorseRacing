// Custom Cypress commands for Horse Racing Game

/**
 * Create a new race session
 * @param {string} raceName - Name for the race session
 */
Cypress.Commands.add('createRaceSession', (raceName = 'Test Race') => {
  // Click Create New Race
  cy.contains('.menu-card', 'New Race').click()

  // Enter race name in modal
  cy.get('input[type="text"]').type(raceName)

  // Click Start Race button in modal
  cy.contains('button', 'Start Race').click()

  // Wait for race view to load
  cy.url().should('include', '/race/')
  cy.contains('START RACES').should('be.visible')
})

/**
 * Continue the last interrupted race
 */
Cypress.Commands.add('continueLastRace', () => {
  cy.contains('.menu-card', 'Continue Last Race').click()
  cy.url().should('include', '/race/')
})

/**
 * Start all races and wait for them to begin
 */
Cypress.Commands.add('startRaces', () => {
  cy.contains('button', 'START RACES').click()
  // Wait for countdown to finish and first race to start
  cy.get('.race-track-modern', { timeout: 10000 }).should('be.visible')
})

/**
 * Wait for a specific number of races to complete
 * @param {number} count - Number of races to wait for (default: 6)
 */
Cypress.Commands.add('waitForRacesComplete', (count = 6) => {
  // Wait for all races to appear in completed races section
  // Using a very generous timeout as races take time
  cy.get('.completed-race-item', { timeout: 120000 }).should('have.length', count)
})

/**
 * Wait for a single race to complete
 */
Cypress.Commands.add('waitForSingleRace', () => {
  // Wait for countdown to disappear
  cy.get('.countdown-overlay', { timeout: 10000 }).should('not.exist')

  // Wait for race to finish (look for completed status)
  cy.get('.race-card-modern.race-completed', { timeout: 60000 }).should('exist')
})

/**
 * Navigate back to welcome screen
 */
Cypress.Commands.add('backToMenu', () => {
  cy.contains('button', 'Back to Menu').click()
  // Confirm in alert
  cy.on('window:confirm', () => true)
  cy.url().should('eq', Cypress.config().baseUrl + '/')
})

/**
 * View previous races
 */
Cypress.Commands.add('viewPreviousRaces', () => {
  cy.contains('.menu-card', 'Previous Races').click()
  cy.get('.previous-races-modal', { timeout: 5000 }).should('be.visible')
})

/**
 * Clear local storage (reset app state)
 */
Cypress.Commands.add('clearAppState', () => {
  cy.clearLocalStorage()
  cy.reload()
})

/**
 * Wait for interruption modal and handle it
 * @param {string} action - 'continue' or 'regenerate'
 */
Cypress.Commands.add('handleInterruptionModal', (action = 'continue') => {
  cy.get('.interruption-modal', { timeout: 5000 }).should('be.visible')

  if (action === 'continue') {
    cy.contains('button', 'Continue').click()
  } else {
    cy.contains('button', 'Regenerate').click()
  }

  cy.get('.interruption-modal').should('not.exist')
})

/**
 * Verify race results structure
 */
Cypress.Commands.add('verifyRaceResults', () => {
  // Check that results container exists
  cy.get('.results-container').should('exist')

  // Check that there are completed races
  cy.get('.completed-race-item').should('have.length.at.least', 1)

  // Verify first result has rankings
  cy.get('.completed-race-item').first().within(() => {
    cy.get('.ranking-row').should('have.length', 10)
    cy.get('.position-1').should('exist') // Winner
  })
})

/**
 * Verify current race state
 * @param {number} expectedRace - Expected current race number (1-6)
 */
Cypress.Commands.add('verifyCurrentRace', (expectedRace) => {
  cy.get('.race-card-modern').eq(expectedRace - 1).should('have.class', 'current')
})
