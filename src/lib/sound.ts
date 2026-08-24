let ctx: AudioContext | null = null

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const AudioCtor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AudioCtor) return null
  if (!ctx) ctx = new AudioCtor()
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

function tone(freq: number, startOffset: number, duration: number, type: OscillatorType, peakGain: number) {
  const c = getCtx()
  if (!c) return
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.type = type
  osc.frequency.value = freq
  const startAt = c.currentTime + startOffset
  gain.gain.setValueAtTime(0.0001, startAt)
  gain.gain.linearRampToValueAtTime(peakGain, startAt + 0.012)
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration)
  osc.connect(gain).connect(c.destination)
  osc.start(startAt)
  osc.stop(startAt + duration + 0.03)
}

export function playClick() {
  tone(680, 0, 0.05, 'square', 0.05)
}

export function playLocked() {
  tone(180, 0, 0.16, 'sawtooth', 0.07)
  tone(140, 0.08, 0.18, 'sawtooth', 0.07)
}

export function playCorrect() {
  tone(523.25, 0, 0.14, 'sine', 0.12)
  tone(783.99, 0.09, 0.2, 'sine', 0.12)
}

export function playIncorrect() {
  tone(220, 0, 0.2, 'sawtooth', 0.07)
  tone(196, 0.1, 0.25, 'sawtooth', 0.07)
}

export function playFootstep() {
  tone(140 + Math.random() * 30, 0, 0.045, 'triangle', 0.035)
}

export function playLevelUp() {
  ;[523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, i * 0.09, 0.16, 'sine', 0.13))
}

export function playMissionComplete() {
  ;[659.25, 783.99, 987.77, 1318.51].forEach((f, i) => tone(f, i * 0.1, 0.22, 'triangle', 0.12))
}

export function playTreasure() {
  ;[987.77, 1318.51, 1567.98].forEach((f, i) => tone(f, i * 0.07, 0.18, 'sine', 0.11))
}

export function playOpenPanel() {
  tone(440, 0, 0.06, 'sine', 0.05)
}
