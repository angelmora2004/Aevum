import { ref, watch } from 'vue'

const STORAGE_KEY = 'aevum-sound'

let audioCtx = null
let enabled = ref(localStorage.getItem(STORAGE_KEY) !== 'false')

function getCtx() {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    } catch (e) {
      return null
    }
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return audioCtx
}

function playTone({ frequency = 440, duration = 0.08, type = 'sine', volume = 0.15, attack = 0.005, release = 0.05 } = {}) {
  if (!enabled.value) return
  const ctx = getCtx()
  if (!ctx) return
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(frequency, ctx.currentTime)
  gain.gain.setValueAtTime(0, ctx.currentTime)
  gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + attack)
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration + release)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start()
  osc.stop(ctx.currentTime + duration + release)
}

function chord(frequencies, opts = {}) {
  if (!enabled.value) return
  const ctx = getCtx()
  if (!ctx) return
  frequencies.forEach((freq, i) => {
    setTimeout(() => playTone({ ...opts, frequency: freq }), i * 60)
  })
}

export function useSound() {
  function click() {
    playTone({ frequency: 1800, duration: 0.04, type: 'sine', volume: 0.08 })
  }

  function toggle() {
    playTone({ frequency: 1200, duration: 0.06, type: 'triangle', volume: 0.1 })
  }

  function complete() {
    chord([523.25, 659.25, 783.99], { duration: 0.12, type: 'sine', volume: 0.12, release: 0.15 })
  }

  function delete_() {
    playTone({ frequency: 300, duration: 0.08, type: 'sawtooth', volume: 0.06 })
    setTimeout(() => playTone({ frequency: 200, duration: 0.1, type: 'sawtooth', volume: 0.05 }), 50)
  }

  function pomodoroEnd() {
    chord([440, 554.37, 659.25, 880], { duration: 0.2, type: 'sine', volume: 0.14, release: 0.3 })
  }

  function error() {
    playTone({ frequency: 220, duration: 0.15, type: 'square', volume: 0.08 })
  }

  function notify() {
    playTone({ frequency: 880, duration: 0.08, type: 'sine', volume: 0.1 })
    setTimeout(() => playTone({ frequency: 1318.51, duration: 0.1, type: 'sine', volume: 0.1 }), 90)
  }

  function setEnabled(v) {
    enabled.value = v
    localStorage.setItem(STORAGE_KEY, String(v))
    if (v) playTone({ frequency: 660, duration: 0.06, type: 'sine', volume: 0.1 })
  }

  watch(enabled, (v) => {
    if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, String(v))
  })

  return { enabled, click, toggle, complete, delete: delete_, pomodoroEnd, error, notify, setEnabled, playTone }
}
