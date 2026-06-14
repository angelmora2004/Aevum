const STORAGE_KEY = 'aevum-device-id'
const SESSION_KEY = 'aevum-session-id'

function generateId() {
  return 'dev_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 10)
}

export function useDeviceId() {
  let id

  // Try sessionStorage first (unique per tab, survives refresh)
  id = sessionStorage.getItem(SESSION_KEY)
  if (id) return { deviceId: id }

  // Try localStorage (persists across tabs in same browser)
  id = localStorage.getItem(STORAGE_KEY)
  if (id) {
    sessionStorage.setItem(SESSION_KEY, id)
    return { deviceId: id }
  }

  // Generate new ID
  id = generateId()
  try {
    localStorage.setItem(STORAGE_KEY, id)
  } catch {}
  sessionStorage.setItem(SESSION_KEY, id)
  return { deviceId: id }
}
