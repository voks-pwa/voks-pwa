import { registerSW } from 'virtual:pwa-register'

export function registerServiceWorker(): void {
  registerSW({
    immediate: true,
    onOfflineReady() {
      console.info('[PWA] App shell is ready for offline use.')
    },
    onRegistered(registration) {
      console.info('[PWA] Service worker registered.', registration)
    },
    onRegisterError(error) {
      console.error('[PWA] Service worker registration failed.', error)
    },
  })
}
