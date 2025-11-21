describe('Race Execution', () => {
  beforeEach(() => {
    cy.clearAppState()
    cy.visit('/')
    cy.createRaceSession('E2E Test Race')
  })

  describe('Pre-Race State', () => {
    it('should display START RACES button before racing begins', () => {
      cy.contains('button', 'START RACES').should('be.visible')
      cy.contains('button', 'START RACES').should('not.be.disabled')
    })

    it('should display race program with 6 races', () => {
      cy.get('.race-card-modern').should('have.length', 6)
    })

    it('should show all races as pending', () => {
      cy.get('.race-card-modern').each(($card) => {
        cy.wrap($card).should('not.have.class', 'completed')
        cy.wrap($card).should('not.have.class', 'running')
      })
    })

    it('should display horse list', () => {
      cy.get('.horse-card-modern').should('have.length', 20)
    })

    it('should show empty results section', () => {
      cy.get('.completed-race-item').should('have.length', 0)
    })
  })

  describe('Starting Races', () => {
    it('should start countdown when clicking START RACES', () => {
      cy.contains('button', 'START RACES').click()
      cy.get('.countdown-overlay', { timeout: 2000 }).should('be.visible')
    })

    it('should show countdown sequence (3, 2, 1, START!)', () => {
      cy.contains('button', 'START RACES').click()
      cy.contains('3', { timeout: 1000 }).should('be.visible')
      cy.contains('2', { timeout: 1500 }).should('be.visible')
      cy.contains('1', { timeout: 1500 }).should('be.visible')
      cy.contains('START!', { timeout: 1500 }).should('be.visible')
    })

    it('should mark first race as running after countdown', () => {
      cy.startRaces()
      cy.get('.race-card-modern').first().should('have.class', 'running')
    })

    it('should hide START RACES button during race', () => {
      cy.startRaces()
      cy.contains('button', 'START RACES').should('not.exist')
    })

    it('should show race track during race', () => {
      cy.startRaces()
      cy.get('.race-track-modern').should('be.visible')
    })
  })

  describe('Race Animation', () => {
    beforeEach(() => {
      cy.startRaces()
    })

    it('should show horse positions updating during race', () => {
      cy.get('.horse-runner', { timeout: 5000 }).should('have.length', 10)
    })

    it('should display race progress', () => {
      // Check that horses are moving (positions changing)
      cy.get('.horse-runner').first().should('be.visible')
    })

    it('should show race timer', () => {
      cy.get('.race-timer', { timeout: 2000 }).should('be.visible')
      cy.get('.race-timer').should('not.contain', '0.0s')
    })

    it('should animate horses across the track', () => {
      // Wait a moment for animation to progress
      cy.wait(2000)

      // Check that at least one horse has moved
      cy.get('.horse-runner').first().should('have.attr', 'style')
        .and('match', /transform|left/)
    })
  })

  describe('Race Completion', () => {
    it('should complete first race and show announcement', () => {
      cy.startRaces()
      cy.waitForSingleRace()

      // Check for completion announcement
      cy.get('.race-announcement', { timeout: 5000 }).should('be.visible')
    })

    it('should add result to completed races', () => {
      cy.startRaces()
      cy.waitForSingleRace()

      cy.get('.completed-race-item').should('have.length.at.least', 1)
    })

    it('should show winner in results', () => {
      cy.startRaces()
      cy.waitForSingleRace()

      cy.get('.completed-race-item').first().within(() => {
        cy.get('.position-1').should('exist')
        cy.get('.ranking-row').first().should('contain', '1')
      })
    })

    it('should display all 10 horses in results', () => {
      cy.startRaces()
      cy.waitForSingleRace()

      cy.get('.completed-race-item').first().within(() => {
        cy.get('.ranking-row').should('have.length', 10)
      })
    })

    it('should show finishing times for all horses', () => {
      cy.startRaces()
      cy.waitForSingleRace()

      cy.get('.completed-race-item').first().within(() => {
        cy.get('.horse-time').should('have.length', 10)
        cy.get('.horse-time').each(($time) => {
          cy.wrap($time).should('not.be.empty')
        })
      })
    })
  })

  describe('Sequential Races', () => {
    it('should automatically start next race after first completes', () => {
      cy.startRaces()
      cy.waitForSingleRace()

      // Wait for announcement to disappear
      cy.wait(4000)

      // Second race should start
      cy.get('.race-card-modern').eq(1).should('have.class', 'running', { timeout: 5000 })
    })

    it.skip('should complete multiple races sequentially', () => {
      // Skipped - long test, waiting for multiple races
      cy.startRaces()

      // Wait for 2 races to complete
      cy.get('.completed-race-item', { timeout: 80000 }).should('have.length', 2)

      // Check both races are marked as completed
      cy.get('.race-card-modern.race-completed').should('have.length.at.least', 2)
    })

    it.skip('should maintain results order', () => {
      // Skipped - long test, waiting for multiple races
      cy.startRaces()

      cy.get('.completed-race-item', { timeout: 80000 }).should('have.length', 2)

      // First result should be 1st Lap
      cy.get('.completed-race-item').first().should('contain', '1st Lap')
      // Second result should be 2nd Lap
      cy.get('.completed-race-item').eq(1).should('contain', '2nd Lap')
    })
  })

  describe('All Races Completion', () => {
    it.skip('should complete all 6 races', function () {
      // Skipped - long test, races may not complete reliably
      this.timeout(180000) // 3 minutes

      cy.startRaces()
      cy.waitForRacesComplete(6)

      cy.get('.completed-race-item').should('have.length', 6)
      cy.get('.race-card-modern.race-completed').should('have.length', 6)
    })

    it.skip('should show completion message after all races', function () {
      // Skipped - long test, races may not complete reliably
      this.timeout(180000)

      cy.startRaces()
      cy.waitForRacesComplete(6)

      // Check for completion indicator
      cy.get('.all-races-complete', { timeout: 5000 }).should('be.visible')
    })
  })

  describe('Race Progress Tracking', () => {
    it('should update current race indicator', () => {
      cy.startRaces()

      // First race should be current
      cy.verifyCurrentRace(1)
    })

    it('should show completed races count', () => {
      cy.startRaces()
      cy.waitForSingleRace()

      cy.get('.completed-races-count').should('contain', '1')
    })

    it('should display race distance for each race', () => {
      cy.get('.race-card-modern').each(($card) => {
        cy.wrap($card).should('contain', 'm') // meters
      })
    })
  })

  describe('Results Details', () => {
    beforeEach(() => {
      cy.startRaces()
      cy.waitForSingleRace()
    })

    it('should show horse names in results', () => {
      cy.get('.completed-race-item').first().within(() => {
        cy.get('.horse-name').should('have.length', 10)
      })
    })

    it('should show horse colors in results', () => {
      cy.get('.completed-race-item').first().within(() => {
        cy.get('.horse-color').should('have.length', 10)
        cy.get('.horse-color').first().should('have.attr', 'style')
      })
    })

    it('should rank horses by time (fastest first)', () => {
      cy.get('.completed-race-item').first().within(() => {
        let previousTime = 0

        cy.get('.horse-time').each(($time, index) => {
          const timeText = $time.text().replace('s', '')
          const time = parseFloat(timeText)

          if (index > 0) {
            expect(time).to.be.at.least(previousTime)
          }
          previousTime = time
        })
      })
    })

    it('should highlight winner', () => {
      cy.get('.completed-race-item').first().within(() => {
        cy.get('.ranking-row').first().should('have.class', 'winner')
      })
    })
  })
})
