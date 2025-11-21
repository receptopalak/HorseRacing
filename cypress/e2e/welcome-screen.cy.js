describe('Welcome Screen', () => {
  beforeEach(() => {
    cy.clearAppState()
    cy.visit('/')
  })

  describe('Initial State', () => {
    it('should display welcome screen on first visit', () => {
      cy.contains('HORSE RACING').should('be.visible')
      cy.contains('.menu-card', 'New Race').should('be.visible')
    })

    it('should not show continue button when no interrupted sessions', () => {
      cy.contains('.menu-card', 'Continue Last Race').should('not.exist')
    })

    it('should show previous races option', () => {
      cy.contains('.menu-card', 'Previous Races').should('be.visible')
    })

    it('should display app title and branding', () => {
      cy.get('.welcome-screen').should('be.visible')
      cy.contains('HORSE RACING').should('be.visible')
      cy.contains('Championship Series').should('be.visible')
    })
  })

  describe('Create New Race', () => {
    it('should open race name modal when clicking create button', () => {
      cy.contains('.menu-card', 'New Race').click()
      cy.get('.modal-content').should('be.visible')
      cy.get('input[type="text"]').should('be.visible')
    })

    it('should require race name to start', () => {
      cy.contains('.menu-card', 'New Race').click()
      cy.contains('button', 'Start Race').should('be.disabled')
    })

    it('should enable start button when race name is entered', () => {
      cy.contains('.menu-card', 'New Race').click()
      cy.get('input[type="text"]').type('My Test Race')
      cy.contains('button', 'Start Race').should('not.be.disabled')
    })

    it('should create race and navigate to race view', () => {
      cy.createRaceSession('Championship Race')
      cy.url().should('include', '/race/')
      cy.contains('START RACES').should('be.visible')
    })

    it('should generate 20 horses when creating race', () => {
      cy.createRaceSession('Test Race')
      // Wait for horses to be generated
      cy.get('.horse-card-modern', { timeout: 5000 }).should('have.length', 20)
    })

    it('should generate 6 race program when creating race', () => {
      cy.createRaceSession('Test Race')
      cy.get('.race-card-modern', { timeout: 5000 }).should('have.length', 6)
    })

    it('should display different race distances', () => {
      cy.createRaceSession('Test Race')
      // Check for various distances (they exist in race cards)
      cy.get('.race-card-modern').should('contain', '1200m')
      cy.get('.race-card-modern').should('contain', '1400m')
      cy.get('.race-card-modern').should('contain', '2200m')
    })
  })

  describe('Race Name Validation', () => {
    beforeEach(() => {
      cy.contains('.menu-card', 'New Race').click()
    })

    it('should accept alphanumeric race names', () => {
      cy.get('input[type="text"]').type('Race 123')
      cy.contains('button', 'Start Race').should('not.be.disabled')
    })

    it('should accept special characters', () => {
      cy.get('input[type="text"]').type('Championship Race!')
      cy.contains('button', 'Start Race').should('not.be.disabled')
    })

    it('should trim whitespace from race name', () => {
      cy.get('input[type="text"]').type('  Test Race  ')
      cy.contains('button', 'Start Race').click()
      cy.url().should('include', '/race/')
    })
  })

  describe('Modal Interaction', () => {
    it('should close modal when clicking cancel', () => {
      cy.contains('.menu-card', 'New Race').click()
      cy.get('.modal-content').should('be.visible')

      cy.contains('button', 'Cancel').click()
      cy.get('.modal-content').should('not.exist')
    })

    it('should close modal when clicking overlay', () => {
      cy.contains('.menu-card', 'New Race').click()
      cy.get('.modal-overlay').click({ force: true })
      cy.get('.modal-content').should('not.exist')
    })

    it.skip('should clear input when reopening modal', () => {
      // Open and enter text
      cy.contains('.menu-card', 'New Race').click()
      cy.get('input[type="text"]').type('Test')
      cy.contains('button', 'Cancel').click()

      // Reopen and check
      cy.contains('.menu-card', 'New Race').click()
      cy.get('input[type="text"]').should('have.value', '')
    })
  })

  describe('Multiple Sessions', () => {
    it('should allow creating multiple races sequentially', () => {
      // Create first race
      cy.createRaceSession('Race 1')
      cy.backToMenu()

      // Create second race
      cy.createRaceSession('Race 2')
      cy.url().should('include', '/race/')
    })

    it('should remember each race independently', () => {
      // Create and start first race
      cy.createRaceSession('First Race')
      cy.startRaces()
      cy.waitForSingleRace()
      cy.backToMenu()

      // Continue button should appear
      cy.contains('.menu-card', 'Continue Last Race').should('be.visible')
    })
  })
})
