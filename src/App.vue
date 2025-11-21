<template>
  <div id="app" class="modern-app">
    <router-view />
  </div>
</template>

<script setup>
// No auto-check for interrupted races
// User should explicitly choose to continue from welcome screen
</script>

<style>
/* Global Reset & Base Styles */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  background: #0a0a0f;
  overflow: hidden;
  color: #ffffff;
}

#app.modern-app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: radial-gradient(ellipse at top, #1a1a2e 0%, #0f0f1a 50%, #000000 100%);
  position: relative;
  overflow: hidden;
}

/* Animated Background */
#app.modern-app::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(255, 121, 63, 0.1) 0%, transparent 50%);
  animation: bg-shift 10s ease-in-out infinite;
  pointer-events: none;
}

@keyframes bg-shift {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.1); }
}

/* Modern Header */
.app-header-modern {
  position: relative;
  background: linear-gradient(135deg, rgba(26, 26, 46, 0.95) 0%, rgba(15, 15, 26, 0.98) 100%);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5), 0 2px 8px rgba(255, 215, 0, 0.1);
  z-index: 100;
  overflow: hidden;
}

.header-bg-animation {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg,
    transparent 0%,
    rgba(255, 215, 0, 0.05) 25%,
    rgba(255, 121, 63, 0.05) 50%,
    rgba(120, 119, 198, 0.05) 75%,
    transparent 100%
  );
  animation: header-flow 8s linear infinite;
}

@keyframes header-flow {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.header-content {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 40px;
  max-width: 1800px;
  margin: 0 auto;
}

.brand {
  display: flex;
  align-items: center;
  gap: 20px;
}

.brand-icon {
  font-size: 48px;
  filter: drop-shadow(0 4px 12px rgba(255, 215, 0, 0.3));
}

.brand-text h1 {
  font-size: 32px;
  font-weight: 900;
  letter-spacing: 3px;
  background: linear-gradient(135deg, #ffffff 0%, #ffd700 50%, #ff7f3f 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 30px rgba(255, 215, 0, 0.3);
  margin: 0;
}

.brand-subtitle {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  letter-spacing: 2px;
  margin: 4px 0 0 2px;
  font-weight: 600;
  text-transform: uppercase;
}

/* Modern Controls */
.controls-modern {
  display: flex;
  gap: 15px;
}

.btn-wrapper {
  position: relative;
  display: inline-block;
}

.btn-modern {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 28px;
  border: none;
  border-radius: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.btn-modern::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.btn-modern:hover::before {
  width: 300px;
  height: 300px;
}

.btn-modern:active {
  transform: scale(0.95);
}

.btn-modern:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none;
}

.btn-modern:disabled::before {
  display: none;
}

.btn-icon {
  font-size: 24px;
  z-index: 1;
}

.btn-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  z-index: 1;
}

.btn-label {
  font-size: 14px;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.btn-sublabel {
  font-size: 10px;
  opacity: 0.8;
  font-weight: 500;
}

.btn-menu {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.btn-menu:hover:not(:disabled) {
  box-shadow: 0 6px 30px rgba(102, 126, 234, 0.5);
  transform: translateY(-2px);
}

.btn-generate {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.btn-generate:hover:not(:disabled) {
  box-shadow: 0 6px 30px rgba(79, 172, 254, 0.5);
  transform: translateY(-2px);
}

.btn-start {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.btn-start:hover:not(:disabled) {
  box-shadow: 0 6px 30px rgba(245, 87, 108, 0.5);
  transform: translateY(-2px);
}

.btn-pulse {
  animation: btn-pulse-animation 2s ease-in-out infinite;
}

@keyframes btn-pulse-animation {
  0%, 100% {
    box-shadow: 0 4px 20px rgba(245, 87, 108, 0.4);
  }
  50% {
    box-shadow: 0 6px 40px rgba(245, 87, 108, 0.8);
  }
}

/* Main Content Layout */
.app-content-modern {
  flex: 1;
  display: grid;
  grid-template-columns: 280px 1fr 380px;
  gap: 0;
  overflow: hidden;
  position: relative;
}

/* Sidebars */
.sidebar-modern {
  position: relative;
  display: flex;
  flex-direction: column;
  background: rgba(15, 15, 26, 0.6);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  overflow: hidden;
}

.sidebar-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 215, 0, 0.05) 0%, transparent 70%);
  animation: glow-rotate 10s linear infinite;
  pointer-events: none;
}

@keyframes glow-rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.sidebar-left {
  border-right: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-right {
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
}

.sidebar-panel {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  position: relative;
}

.sidebar-panel:not(:last-child) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

/* Main Content */
.main-content-modern {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

/* Loading Overlay */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-content {
  text-align: center;
  color: white;
}

.loading-spinner {
  width: 60px;
  height: 60px;
  margin: 0 auto 20px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-top-color: #ffd700;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-content h3 {
  font-size: 24px;
  margin-bottom: 8px;
  font-weight: 700;
}

.loading-content p {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
}

/* Transitions */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Scrollbar Styling */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 215, 0, 0.3);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 215, 0, 0.5);
}

/* Responsive Design */
@media (max-width: 1400px) {
  .app-content-modern {
    grid-template-columns: 250px 1fr 350px;
  }
}

@media (max-width: 1200px) {
  .app-content-modern {
    grid-template-columns: 220px 1fr 320px;
  }

  .header-content {
    padding: 15px 20px;
  }

  .brand-text h1 {
    font-size: 24px;
  }

  .btn-modern {
    padding: 12px 20px;
  }
}

@media (max-width: 900px) {
  .app-content-modern {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr auto;
  }

  .sidebar-left, .sidebar-right {
    border: none;
    max-height: 200px;
  }

  .sidebar-right {
    flex-direction: row;
  }

  .sidebar-panel {
    flex: 1;
  }

  .sidebar-panel:not(:last-child) {
    border-bottom: none;
    border-right: 1px solid rgba(255, 255, 255, 0.1);
  }

  .controls-modern {
    flex-direction: column;
    gap: 8px;
  }

  .btn-modern {
    padding: 10px 16px;
    font-size: 12px;
  }
}
</style>
