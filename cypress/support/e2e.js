// Cypress E2E support file
// This file runs before every single test file

// Import commands
import './commands'

// Disable uncaught exception handling for demo purposes
Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from failing the test
  return false
})
