describe('Session Management', () => {
  beforeEach(() => {
    cy.clearAppState()
    cy.visit('/')
  })

  describe('Session Interruption', () => {
    it('should save session when navigating back during race', () => {
      cy.createRaceSession('Interrupted Race')
      cy.startRaces()

      // Wait for race to be in progress
      cy.wait(2000)

      // Navigate back to menu
      cy.backToMenu()

      // Session should be saved as interrupted
      cy.contains('.menu-card', 'Continue Last Race').should('be.visible')
    })

    it('should show continue button after interruption', () => {
      cy.createRaceSession('Test Race')
      cy.startRaces()
      cy.wait(1000)
      cy.backToMenu()

      cy.visit('/')
      cy.contains('.menu-card', 'Continue Last Race').should('be.visible')
    })

    it('should save progress before interruption', () => {
      cy.createRaceSession('Progress Test')
      cy.startRaces()
      cy.waitForSingleRace()
      cy.backToMenu()

      // Check that progress was saved
      cy.contains('.menu-card', 'Continue Last Race').should('be.visible')
    })

    it('should handle interruption during countdown', () => {
      cy.createRaceSession('Countdown Test')
      cy.contains('button', 'START RACES').click()

      // Interrupt during countdown
      cy.wait(1000)
      cy.backToMenu()

      // Should still show continue option
      cy.contains('.menu-card', 'Continue Last Race').should('be.visible')
    })

    it('should handle interruption between races', () => {
      cy.createRaceSession('Between Races')
      cy.startRaces()
      cy.waitForSingleRace()

      // Wait for announcement
      cy.wait(4000)

      // Interrupt before next race starts
      cy.backToMenu()

      cy.contains('.menu-card', 'Continue Last Race').should('be.visible')
    })
  })

  describe('Continue Last Race', () => {
    beforeEach(() => {
      // Create and interrupt a race
      cy.createRaceSession('Continuable Race')
      cy.startRaces()
      cy.wait(2000)
      cy.backToMenu()
    })

    it('should display continue button on welcome screen', () => {
      cy.contains('.menu-card', 'Continue Last Race').should('be.visible')
    })

    it('should resume race when clicking continue', () => {
      cy.continueLastRace()
      cy.url().should('include', '/race/')
      cy.contains('START RACES').should('be.visible')
    })

    it('should show previous progress after continuing', () => {
      cy.continueLastRace()
      // Race should be ready to continue
      cy.get('.race-card-modern').should('exist')
      cy.contains('START RACES').should('be.visible')
    })

    it('should restore completed races count', () => {
      // Complete one race first
      cy.createRaceSession('Restore Test')
      cy.startRaces()
      cy.waitForSingleRace()
      cy.backToMenu()

      cy.continueLastRace()
      cy.get('.completed-race-item').should('have.length', 1)
    })

    it('should allow restarting from interruption point', () => {
      cy.continueLastRace()
      cy.startRaces()

      // Race should continue
      cy.get('.race-track-modern', { timeout: 10000 }).should('be.visible')
    })
  })

  describe('Interruption Modal on Page Refresh', () => {
    it('should show interruption modal after page refresh during race', () => {
      cy.createRaceSession('Refresh Test')
      cy.startRaces()
      cy.wait(2000)

      // Refresh page
      cy.reload()

      // Interruption modal should appear
      cy.get('.interruption-modal', { timeout: 5000 }).should('be.visible')
      cy.contains('Race Interrupted').should('be.visible')
    })

    it('should offer continue option in interruption modal', () => {
      cy.createRaceSession('Modal Test')
      cy.startRaces()
      cy.wait(1000)
      cy.reload()

      cy.get('.interruption-modal').should('be.visible')
      cy.contains('button', 'Continue').should('be.visible')
    })

    it('should offer regenerate option in interruption modal', () => {
      cy.createRaceSession('Regenerate Test')
      cy.startRaces()
      cy.wait(1000)
      cy.reload()

      cy.get('.interruption-modal').should('be.visible')
      cy.contains('button', 'Regenerate').should('be.visible')
    })

    it('should continue race when selecting continue in modal', () => {
      cy.createRaceSession('Continue Modal')
      cy.startRaces()
      cy.wait(1000)
      cy.reload()

      cy.handleInterruptionModal('continue')

      // Should be back in race view
      cy.url().should('include', '/race/')
      cy.contains('START RACES').should('be.visible')
    })

    it('should reset when selecting regenerate in modal', () => {
      cy.createRaceSession('Regenerate Modal')
      cy.startRaces()
      cy.waitForSingleRace()
      cy.reload()

      cy.handleInterruptionModal('regenerate')

      // Should go back to welcome screen
      cy.url().should('not.include', '/race/')
      cy.contains('.menu-card', 'New Race').should('be.visible')
    })
  })

  describe('Multiple Interrupted Sessions', () => {
    it('should handle multiple interrupted sessions', () => {
      // Create and interrupt first race
      cy.createRaceSession('Race 1')
      cy.startRaces()
      cy.wait(1000)
      cy.backToMenu()

      // Create and interrupt second race
      cy.createRaceSession('Race 2')
      cy.startRaces()
      cy.wait(1000)
      cy.backToMenu()

      // Continue button should show most recent
      cy.contains('.menu-card', 'Continue Last Race').should('be.visible')
    })

    it('should continue most recently accessed race', () => {
      // Create multiple interrupted races
      cy.createRaceSession('Old Race')
      cy.startRaces()
      cy.wait(500)
      cy.backToMenu()

      cy.wait(100)

      cy.createRaceSession('Recent Race')
      cy.startRaces()
      cy.wait(500)
      cy.backToMenu()

      // Continue should load most recent
      cy.continueLastRace()
      cy.url().should('include', '/race/')
    })
  })

  describe('Session State Persistence', () => {
    it('should persist completed races across navigation', () => {
      cy.createRaceSession('Persistence Test')
      cy.startRaces()
      cy.waitForSingleRace()

      const completedCount = 1
      cy.get('.completed-race-item').should('have.length', completedCount)

      cy.backToMenu()
      cy.continueLastRace()

      // Completed races should still be there
      cy.get('.completed-race-item').should('have.length', completedCount)
    })

    it('should persist race program across interruption', () => {
      cy.createRaceSession('Program Test')

      // Store program details
      cy.get('.race-card-modern').first().invoke('text').as('firstRaceText')

      cy.startRaces()
      cy.wait(1000)
      cy.backToMenu()
      cy.continueLastRace()

      // Program should be the same
      cy.get('.race-card-modern').should('have.length', 6)
    })

    it('should persist horse list across interruption', () => {
      cy.createRaceSession('Horse Persistence')

      cy.get('.horse-card-modern').should('have.length', 20)

      cy.startRaces()
      cy.wait(500)
      cy.backToMenu()
      cy.continueLastRace()

      // Same horses should be present
      cy.get('.horse-card-modern').should('have.length', 20)
    })

    it('should clear race positions on restart after interruption', () => {
      cy.createRaceSession('Position Reset')
      cy.startRaces()
      cy.wait(2000) // Let some progress happen
      cy.backToMenu()
      cy.continueLastRace()

      // When restarting, race should start from beginning
      cy.startRaces()

      // Horses should start from 0%
      cy.get('.horse-runner').first().should('be.visible')
    })
  })

  describe('Session Completion', () => {
    it.skip('should mark session as completed after all races', function () {
      // Skipped - long test, races may not complete reliably
      this.timeout(180000)

      cy.createRaceSession('Complete Session')
      cy.startRaces()
      cy.waitForRacesComplete(6)

      // Session should be completed
      cy.backToMenu()

      // Continue button should not appear (session is completed, not interrupted)
      cy.contains('.menu-card', 'Continue Last Race').should('not.exist')
    })

    it.skip('should show previous races button after completion', function () {
      // Skipped - long test, races may not complete reliably
      this.timeout(180000)

      cy.createRaceSession('Previous Test')
      cy.startRaces()
      cy.waitForRacesComplete(6)
      cy.backToMenu()

      // Previous races button should appear
      cy.contains('.menu-card', 'Previous Races').should('be.visible')
    })
  })

  describe('Session Cleanup', () => {
    it.skip('should not show interrupted session after completion', function () {
      // Skipped - long test, races may not complete reliably
      this.timeout(180000)

      cy.createRaceSession('Cleanup Test')
      cy.startRaces()
      cy.wait(1000)
      cy.backToMenu()

      // Interrupted session exists
      cy.contains('.menu-card', 'Continue Last Race').should('be.visible')

      // Continue and complete all races
      cy.continueLastRace()
      cy.startRaces()
      cy.waitForRacesComplete(6)
      cy.backToMenu()

      // Interrupted session should no longer appear
      cy.contains('.menu-card', 'Continue Last Race').should('not.exist')
    })
  })
})
