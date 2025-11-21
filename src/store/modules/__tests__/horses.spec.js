import { describe, it, expect, beforeEach } from 'vitest'
import { createStore } from 'vuex'
import horses from '../horses'

describe('horses module', () => {
  let store

  beforeEach(() => {
    store = createStore({
      modules: {
        horses
      }
    })
  })

  it('should have initial state', () => {
    expect(store.state.horses.horses).toEqual([])
    expect(store.state.horses.isGenerated).toBe(false)
  })

  it('should generate horses', () => {
    store.dispatch('horses/generateHorses')

    expect(store.getters['horses/horseCount']).toBe(20)
    expect(store.getters['horses/isGenerated']).toBe(true)
  })

  it('should reset horses', () => {
    store.dispatch('horses/generateHorses')
    store.dispatch('horses/resetHorses')

    expect(store.getters['horses/horseCount']).toBe(0)
    expect(store.getters['horses/isGenerated']).toBe(false)
  })

  it('should get horse by id', () => {
    store.dispatch('horses/generateHorses')
    const horse = store.getters['horses/getHorseById'](5)

    expect(horse).toBeTruthy()
    expect(horse.id).toBe(5)
  })
})
