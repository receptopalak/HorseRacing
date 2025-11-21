# 🏇 Horse Racing Championship Game

A modern, interactive horse racing simulation game built with Vue 3. Experience the thrill of horse racing with realistic animations, live standings, and comprehensive race management features.

![Vue 3](https://img.shields.io/badge/Vue-3.x-brightgreen)
![Vite](https://img.shields.io/badge/Vite-5.x-646CFF)
![Cypress](https://img.shields.io/badge/Cypress-13.x-17202C)
![Vitest](https://img.shields.io/badge/Vitest-Latest-729B1B)

## 🎮 What Can You Do?

### Race Management
- **Create Custom Race Sessions**: Name your race championship and start competing
- **Automatic Horse Generation**: System generates 20 unique horses with distinct colors and stats
- **Dynamic Race Program**: 6 races automatically created with varying distances (1200m-2200m)
- **Live Race Simulation**: Watch real-time horse racing with smooth animations
- **Session Persistence**: Your progress is saved - continue anytime, even after closing the browser

### Race Features
- **Real-time Standings**: Live leaderboard showing horse positions during races
- **Race Results**: Detailed results with finishing times and rankings
- **Sequential Racing**: Races automatically progress one after another
- **Interruption Recovery**: Refresh the page? No problem! Resume right where you left off
- **Race History**: View all completed races and their results

### Visual Experience
- **Modern Glassmorphism UI**: Beautiful glass-effect design with smooth gradients
- **Animated Race Track**: Dynamic racing animations with horse movements
- **Lottie Animations**: Professional horse animations using Lottie
- **Responsive Design**: Works seamlessly on desktop and tablet devices
- **Countdown Timer**: Exciting 3-2-1-START countdown before each race

## 🚀 Quick Start

### Prerequisites
- Node.js 18.x or higher
- npm or yarn package manager

### Installation & Running

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5174`

### Build for Production

```bash
# Build the application
npm run build

# Preview production build
npm run preview
```

## 🏗️ Technical Architecture

### Technology Stack

**Frontend Framework:**
- **Vue 3** - Composition API with `<script setup>` syntax
- **Vue Router** - Client-side routing
- **Vuex 4** - Centralized state management
- **Vite 5** - Lightning-fast build tool

**Styling:**
- **CSS3** - Custom styling with glassmorphism effects
- **CSS Variables** - Dynamic theming
- **Scoped Styles** - Component-level styling

**Testing:**
- **Vitest** - Unit testing (214 tests)
- **Cypress 13** - E2E testing (~110 tests)
- **@vue/test-utils** - Vue component testing utilities

**Animation & Graphics:**
- **Lottie** - Professional horse animations
- **CSS Animations** - Smooth transitions and movements

**Data Persistence:**
- **secure-ls** - Encrypted local storage
- **LocalStorage API** - Browser-based data persistence

### Key Technical Features

#### 1. **Physics-Based Race Engine**
```javascript
// Realistic horse racing simulation
- Speed variation based on horse condition
- Distance-based timing calculations
- Random performance factors
- Realistic finishing times
```

#### 2. **State Management Architecture**
```
Store Modules:
├── horses/     - Horse data and statistics
├── races/      - Race program and current race state
├── sessions/   - Session management and persistence
└── results/    - Race results and history
```

#### 3. **Session Persistence**
- Automatic save on every state change
- Encrypted data storage
- Interruption detection and recovery
- Multi-session support

#### 4. **Component Architecture**
```
Views/
├── WelcomeView      - Entry point, session selection
└── RaceView         - Main race interface

Components/
├── HorseList        - Horse pool display
├── ProgramSchedule  - Race program cards
├── RaceTrack        - Live race animation
├── ResultsPanel     - Completed race results
├── LiveStandingsSidebar - Real-time standings
├── InterruptionModal - Resume/regenerate dialog
└── WinnersAnnouncement - Race completion popup
```

## 📁 Project Structure

```
horse-racing-game/
├── src/
│   ├── assets/          # Static assets (Lottie animations)
│   ├── components/      # Vue components
│   │   ├── HorseList.vue
│   │   ├── RaceTrack.vue
│   │   ├── ProgramSchedule.vue
│   │   └── ...
│   ├── models/          # Data models
│   │   ├── Horse.js
│   │   ├── Race.js
│   │   ├── RaceSession.js
│   │   └── RaceResult.js
│   ├── services/        # Business logic
│   │   ├── RaceEngine.js      # Race simulation
│   │   ├── HorseGenerator.js  # Horse creation
│   │   └── RaceScheduler.js   # Race program
│   ├── store/           # Vuex store modules
│   │   ├── index.js
│   │   ├── modules/
│   │   │   ├── horses.js
│   │   │   ├── races.js
│   │   │   ├── results.js
│   │   │   └── sessions.js
│   ├── views/           # Page components
│   │   ├── WelcomeView.vue
│   │   └── RaceView.vue
│   ├── router/          # Vue Router config
│   └── main.js          # Application entry
├── tests/
│   └── unit/            # Vitest unit tests
│       ├── models/
│       ├── services/
│       └── store/
├── cypress/
│   ├── e2e/             # E2E test specs
│   ├── support/         # Cypress helpers
│   └── E2E-TESTS-README.md
└── public/              # Static public files
```

## 🎯 How It Works

### Race Simulation Algorithm

1. **Horse Generation**
   - Each horse gets unique attributes (speed, stamina, condition)
   - Random color assignment from predefined palette
   - Creative name generation

2. **Race Program Creation**
   - 6 races with varying distances (1200m to 2200m)
   - Each race selects 10 random horses
   - Distance affects race duration

3. **Race Execution**
   ```javascript
   Race Physics:
   - Base time = distance / horse.speed
   - Variation = random factor (±10%)
   - Final time = base time + variation
   - Update positions every 100ms
   ```

4. **Animation System**
   - CSS transforms for smooth movement
   - Lottie animations for horse graphics
   - Progress tracking (0-100%)
   - Position interpolation

### State Flow

```
User Action → Vuex Action → Service Layer → Model Update
     ↓
State Change → Component Re-render → UI Update
     ↓
LocalStorage → Persistence → Recovery on Reload
```

### Session Management

```javascript
Session Lifecycle:
1. Create → Generate horses & races
2. Start → Begin race execution
3. Interrupt → Save current state
4. Resume → Restore from saved state
5. Complete → Archive results
```

## 🧪 Testing

### Unit Tests
```bash
# Run all unit tests
npm run test:unit

# Run with coverage
npm run test:unit -- --coverage

# Watch mode
npm run test:unit -- --watch
```

**Test Coverage:**
- **214 passing tests**
- Models: Horse, Race, RaceSession, RaceResult
- Services: RaceEngine, HorseGenerator, RaceScheduler
- Store Modules: All Vuex modules

### E2E Tests
```bash
# Open Cypress Test Runner
npm run test:e2e

# Run headless (CI mode)
npm run test:e2e:ci

# Run specific spec
npx cypress run --spec "cypress/e2e/welcome-screen.cy.js"
```

**Test Coverage:**
- ~110 E2E tests across 4 test files
- User flows and interactions
- Race creation and execution
- Session management
- Navigation and routing
- State persistence

See [E2E Tests Documentation](cypress/E2E-TESTS-README.md) for details.

## 🎨 Design System

### Color Palette
```css
Primary: #FF6B35 (Orange)
Secondary: #4ECDC4 (Turquoise)
Success: #95E1D3
Warning: #F7B731
Background: Linear gradient (deep purple to midnight blue)
Glass Effect: rgba(255, 255, 255, 0.1) with backdrop blur
```

### UI Components
- **Glassmorphism Cards**: Translucent panels with blur effects
- **Gradient Buttons**: Animated hover states
- **Live Indicators**: Pulsing dots for active races
- **Modern Badges**: Rounded status indicators
- **Smooth Transitions**: 300ms ease-in-out animations

## 🔧 Configuration

### Race Parameters
```javascript
// src/services/RaceScheduler.js
const RACE_DISTANCES = [1200, 1400, 1600, 1800, 2000, 2200]
const RACES_PER_SESSION = 6
const HORSES_PER_RACE = 10
```

### Horse Pool Settings
```javascript
// src/services/HorseGenerator.js
const TOTAL_HORSES = 20
const MIN_CONDITION = 70
const MAX_CONDITION = 100
```

### Customization

**Adjust Animation Speed:**
```javascript
// src/services/RaceEngine.js
const ANIMATION_INTERVAL = 100 // milliseconds
const RACE_SPEED_MULTIPLIER = 1.0
```

**Modify Horse Colors:**
```javascript
// src/services/HorseGenerator.js
const HORSE_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1',
  '#FFA07A', '#98D8C8', '#F7DC6F'
  // Add more colors as needed
]
```

## 🎮 How to Play

### Starting a New Race
1. Click **"New Race"** on the welcome screen
2. Enter a name for your race session
3. Click **"Start Race"** to generate horses and races
4. Your race program will be created automatically

### During the Race
1. Click **"START RACES"** to begin the championship
2. Watch the countdown: 3... 2... 1... START!
3. Observe horses racing on the track
4. View live standings in the sidebar
5. See results after each race completes

### Managing Sessions
- **Continue**: Resume an interrupted race from where you left off
- **Previous Races**: View history of completed races
- **Back to Menu**: Return to main menu (with confirmation)

## 🐛 Troubleshooting

### Common Issues

**Port Already in Use:**
```bash
# Kill process using port 5174
lsof -ti:5174 | xargs kill -9

# Or change port in vite.config.js
server: { port: 3000 }
```

**Tests Failing:**
```bash
# Clear caches
rm -rf node_modules/.vite
rm -rf node_modules/.cache
npm install
```

**Race Not Starting:**
- Check browser console for errors
- Verify localStorage is not full
- Clear browser cache and reload
- Ensure JavaScript is enabled

**Animations Stuttering:**
- Close other browser tabs
- Check GPU acceleration is enabled
- Reduce browser zoom level

## 📊 Performance

### Optimization Techniques
- **Virtual DOM**: Vue 3's optimized rendering
- **Computed Properties**: Cached calculations
- **Lazy Loading**: Route-based code splitting
- **CSS Containment**: Isolated component rendering
- **RequestAnimationFrame**: Smooth 60fps animations

### Benchmarks
- Initial Load: ~500ms
- Race Start Delay: <100ms
- Animation FPS: 60fps consistent
- Memory Usage: ~50MB average



---

**Built with using Vue 3 and modern web technologies**

For questions or support, please open an issue on GitHub.
