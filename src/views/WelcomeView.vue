<template>
  <WelcomeScreen />
</template>

<script setup>
import { onMounted } from 'vue'
import { useStore } from 'vuex'
import WelcomeScreen from '@/components/WelcomeScreen.vue'

const store = useStore()

// Ensure any running races are stopped when welcome screen is shown
onMounted(() => {
  store.commit('races/PAUSE_RACING')
  store.commit('SET_INTERRUPTION_MODAL', false)
})
</script>
