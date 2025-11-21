# E2E Tests for Horse Racing Game

## Overview

Comprehensive End-to-End (E2E) tests for this project are written using Cypress. The tests cover all user flows and features of the application.

## Test Files

### 1. `welcome-screen.cy.js` (19 tests)
Tests the welcome screen and race creation functionality:
- Initial visit state
- New race creation
- Race name validation
- Modal interactions
- Multiple session management

### 2. `race-execution.cy.js` (31 tests)
Tests race execution and completion processes:
- Pre-race state
- Race start and countdown
- Race animations
- Race completion
- Sequential race execution
- Result details

### 3. `session-management.cy.js` (30+ tests)
Tests session management, interruption and continuation:
- Session interruption
- Continue last race
- Interruption modal after page refresh
- Multiple interrupted session management
- Session state persistence
- Session completion

### 4. `navigation.cy.js` (30 tests)
Tests navigation and state persistence:
- URL navigation
- Back to menu functionality
- Browser navigation (back/forward)
- Page refresh
- Local storage persistence
- Session lifecycle
- Error handling
- Previous races history

## Test Commands

### Development Mode (with GUI)
```bash
npm run test:e2e
```
This command opens the Cypress Test Runner and allows you to run tests interactively.

### CI/CD Mode (Headless)
```bash
npm run test:e2e:ci
```
This command runs tests in headless mode (suitable for CI/CD).

### Running a Specific Test File
```bash
npx cypress run --spec "cypress/e2e/welcome-screen.cy.js"
```

## Prerequisites

1. **Dev server must be running:**
   ```bash
   npm run dev
   ```
   E2E tests test the application running at `http://localhost:5174`.

2. **Cypress must be installed:**
   ```bash
   npm install
   ```

## Custom Commands (Helper Functions)

Custom Cypress commands used in test files:

- `cy.createRaceSession(raceName)` - Creates a new race session
- `cy.continueLastRace()` - Continues the last interrupted race
- `cy.startRaces()` - Starts all races
- `cy.waitForRacesComplete(count)` - Waits for the specified number of races to complete
- `cy.waitForSingleRace()` - Waits for a single race to complete
- `cy.backToMenu()` - Returns to the main menu
- `cy.viewPreviousRaces()` - Goes to the previous races page
- `cy.clearAppState()` - Clears application state (local storage)
- `cy.handleInterruptionModal(action)` - Handles interruption modal ('continue' or 'regenerate')
- `cy.verifyRaceResults()` - Verifies the structure of race results
- `cy.verifyCurrentRace(raceNumber)` - Verifies current race state

## Test Scenarios

### Basic User Flows

1. **Create and Complete New Race:**
   ```javascript
   cy.createRaceSession('My Race')
   cy.startRaces()
   cy.waitForRacesComplete(6)
   ```

2. **Race Interruption and Continuation:**
   ```javascript
   cy.createRaceSession('Interrupted Race')
   cy.startRaces()
   cy.wait(2000)
   cy.backToMenu()
   cy.continueLastRace()
   ```

3. **Continue After Page Refresh:**
   ```javascript
   cy.createRaceSession('Refresh Test')
   cy.startRaces()
   cy.reload()
   cy.handleInterruptionModal('continue')
   ```

## Test Configuration

### `cypress.config.js`
```javascript
{
  e2e: {
    baseUrl: 'http://localhost:5174',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.js'
  }
}
```

## Important Notes

1. **Timeout Values:**
   - Timeout has been increased for long-running tests (all races completion)
   - Some tests use 180000ms (3 minutes) timeout

2. **Async Operations:**
   - Race animations and completions are asynchronous operations
   - Tests include appropriate wait times

3. **State Cleanup:**
   - State is cleaned with `cy.clearAppState()` before each test
   - This ensures tests run independently

4. **English UI:**
   - Application has an English interface
   - Tests use English button and text labels

## Coverage

Tests cover the following areas:

- ✅ User session management
- ✅ Race creation and configuration
- ✅ Race execution and animations
- ✅ Result viewing and validation
- ✅ Navigation and routing
- ✅ State persistence (local storage)
- ✅ Interruption management
- ✅ Error handling
- ✅ Browser navigation
- ✅ Multiple session scenarios

## CI/CD Integration

To run on GitHub Actions or similar CI/CD platforms:

```yaml
- name: Run E2E Tests
  run: |
    npm run dev &
    npx wait-on http://localhost:5174
    npm run test:e2e:ci
```

## Troubleshooting

### If tests fail:

1. Ensure dev server is running
2. Check that port 5174 is available
3. Clear local storage
4. Clear Cypress cache: `npx cypress cache clear`

### Debug Mode:

```bash
DEBUG=cypress:* npm run test:e2e
```

## Test Statistics

- **Total Test Files:** 4
- **Total Test Count:** ~110 tests
- **Average Run Time:** 5-10 minutes (full test suite)
- **Coverage Area:** All user scenarios

## Contributing

When adding new tests:

1. Use descriptive test names
2. Clean state with `beforeEach`
3. Use custom commands to reduce repetition
4. Add appropriate timeout values for async operations
5. Use `describe` blocks for test grouping

## Skipped Tests

Some tests are skipped for the following reasons:

- **Long-running tests**: Tests that wait for all 6 races to complete (3+ minutes)
- **Flaky tests**: Tests with unreliable behavior in test environment (e.g., interruption modal timing)
- **Implementation details**: Tests checking internal implementation (e.g., local storage key names)
- **Invalid routes**: Tests for routes that don't exist (app uses modals instead)

## License

These tests are part of the Horse Racing Game project.
