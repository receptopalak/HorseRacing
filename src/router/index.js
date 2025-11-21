import { createRouter, createWebHistory } from 'vue-router'
import store from '@/store'

const routes = [
  {
    path: '/',
    name: 'Welcome',
    component: () => import('@/views/WelcomeView.vue')
  },
  {
    path: '/race/:sessionId',
    name: 'Race',
    component: () => import('@/views/RaceView.vue'),
    meta: { requiresSession: true }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Global navigation guard
router.beforeEach(async (to, from, next) => {
  // If going to race route with session ID
  if (to.name === 'Race' && to.params.sessionId) {
    const sessionId = to.params.sessionId
    const currentSession = store.getters['sessions/currentSession']

    // If current session doesn't match URL session ID, try to load it
    if (!currentSession || currentSession.id !== sessionId) {
      // Find session in stored sessions
      const allSessions = store.getters['sessions/allSessions']
      const session = allSessions.find(s => s.id === sessionId)

      if (session) {
        // Load the session
        await store.dispatch('sessions/loadSession', session)
        await store.dispatch('horses/setHorses', session.horses)
        await store.dispatch('races/setProgram', session.program)
        await store.dispatch('results/setResults', session.results)

        // CRITICAL: Check if this is a brand new session (no races started yet)
        // If so, don't try to reset interrupted races - just load it fresh
        const hasStartedAnyRace = session.results && session.results.length > 0

        if (hasStartedAnyRace) {
          // This is a resumed session - check for interrupted races
          const program = session.program
          const interruptedIndex = program.findIndex(race =>
            race.status === 'running' || race.status === 'interrupted'
          )

          if (interruptedIndex !== -1) {
            // Reset interrupted race - it will start from beginning (0%)
            store.commit('races/RESET_INTERRUPTED_RACE', interruptedIndex)
          } else {
            store.commit('races/SET_CURRENT_INDEX', session.currentRaceIndex || -1)
          }
        } else {
          // This is a brand new session - just set the index to -1 (no race started)
          store.commit('races/SET_CURRENT_INDEX', -1)
        }

        store.commit('SET_APP_STATUS', 'ready')
        next()
      } else {
        // Session not found, redirect to welcome
        next('/')
      }
    } else {
      // Current session matches, allow navigation
      next()
    }
  }
  // If going to race route but no session ID in URL, redirect to welcome
  else if (to.meta.requiresSession && !to.params.sessionId) {
    next('/')
  }
  // Otherwise allow navigation
  else {
    next()
  }
})

export default router
