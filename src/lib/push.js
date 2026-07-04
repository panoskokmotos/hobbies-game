import { updateProfile } from './api.js'

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)))
}

export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return null
  try {
    return await navigator.serviceWorker.register('/sw.js')
  } catch {
    return null
  }
}

// Requests notification permission, subscribes to Web Push, and persists the
// subscription on the user's profile so a backend function has something
// real to target.
//
// This wires the full client-side half — previously "Enable" only called
// Notification.requestPermission() with no service worker registration and
// no actual push subscription, so granting permission did nothing (no
// subscription existed for anything to send to). Actually SENDING a push
// when a match/admirer happens still needs a backend function (e.g. a
// Butterbase serverless function) that reads push_subscription off the
// relevant profile and calls the Web Push protocol — that's server-side
// infra this repo can't provide; a VITE_VAPID_PUBLIC_KEY also needs to be
// generated and set for subscribe() to succeed at all.
export async function subscribeToPush(userId) {
  if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
    return { subscribed: false, error: 'Push not supported on this device' }
  }
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return { subscribed: false, error: 'Permission denied' }

  const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY
  if (!vapidKey) {
    return { subscribed: false, error: 'No VAPID key configured' }
  }

  try {
    const registration = await registerServiceWorker()
    if (!registration) return { subscribed: false, error: 'Service worker unavailable' }
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey),
    })
    await updateProfile(userId, { push_subscription: subscription.toJSON() })
    return { subscribed: true, error: null }
  } catch (err) {
    return { subscribed: false, error: err.message || 'Could not subscribe to push' }
  }
}
