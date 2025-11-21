import { createApp } from 'vue'
import App from './App.vue'
import store from './store'
import router from './router'
import '@lottiefiles/dotlottie-wc'

/**
 * Application entry point
 * Initializes Vue app with Vuex store, Vue Router, and Lottie web components
 */
const app = createApp(App)

app.use(store)
app.use(router)

app.mount('#app')
