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

function createNoiseBuffer(c: AudioContext, seconds: number): AudioBuffer {
  const length = Math.max(1, Math.floor(c.sampleRate * seconds))
  const buffer = c.createBuffer(1, length, c.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1
  return buffer
}

function noiseBurst(
  c: AudioContext,
  startOffset: number,
  duration: number,
  peakGain: number,
  filterFreq: number,
  filterType: BiquadFilterType = 'lowpass',
) {
  const noise = c.createBufferSource()
  noise.buffer = createNoiseBuffer(c, duration + 0.05)
  const filter = c.createBiquadFilter()
  filter.type = filterType
  filter.frequency.value = filterFreq
  const gain = c.createGain()
  const startAt = c.currentTime + startOffset
  gain.gain.setValueAtTime(0.0001, startAt)
  gain.gain.linearRampToValueAtTime(peakGain, startAt + 0.008)
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration)
  noise.connect(filter).connect(gain).connect(c.destination)
  noise.start(startAt)
  noise.stop(startAt + duration + 0.05)
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

/* ---------- Combat / room ---------- */

export function playGunshot() {
  const c = getCtx()
  if (!c) return
  noiseBurst(c, 0, 0.12, 0.2, 2200, 'lowpass')
  tone(90, 0, 0.09, 'square', 0.11)
}

export function playEnemyHit() {
  tone(1400, 0, 0.05, 'square', 0.08)
  tone(900, 0.02, 0.06, 'square', 0.06)
}

export function playEnemyDown() {
  const c = getCtx()
  if (!c) return
  noiseBurst(c, 0, 0.35, 0.18, 900, 'lowpass')
  tone(180, 0, 0.4, 'sawtooth', 0.1)
  tone(90, 0.08, 0.4, 'sawtooth', 0.08)
}

export function playPlayerHurt() {
  tone(140, 0, 0.18, 'sawtooth', 0.09)
  tone(110, 0.05, 0.2, 'sawtooth', 0.08)
}

export function playDoorLock() {
  const c = getCtx()
  if (!c) return
  noiseBurst(c, 0, 0.1, 0.16, 500, 'lowpass')
  tone(80, 0.05, 0.25, 'square', 0.1)
}

export function playDoorUnlock() {
  const c = getCtx()
  if (!c) return
  noiseBurst(c, 0, 0.08, 0.12, 1200, 'lowpass')
  ;[440, 660, 880].forEach((f, i) => tone(f, 0.05 + i * 0.08, 0.15, 'sine', 0.1))
}

export function playRoomFail() {
  ;[440, 370, 300, 220].forEach((f, i) => tone(f, i * 0.15, 0.2, 'sawtooth', 0.1))
}

/* ---------- Breathing (tension ambience) ---------- */

interface BreathingNodes {
  noiseSource: AudioBufferSourceNode
  lfo: OscillatorNode
  gain: GainNode
}

let breathing: BreathingNodes | null = null

export function startBreathing() {
  const c = getCtx()
  if (!c || breathing) return

  const noiseSource = c.createBufferSource()
  noiseSource.buffer = createNoiseBuffer(c, 2)
  noiseSource.loop = true

  const filter = c.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = 300
  filter.Q.value = 0.6

  const gain = c.createGain()
  gain.gain.value = 0.0001

  const lfo = c.createOscillator()
  lfo.frequency.value = 0.28
  const lfoDepth = c.createGain()
  lfoDepth.gain.value = 150
  lfo.connect(lfoDepth)
  lfoDepth.connect(filter.frequency)

  noiseSource.connect(filter).connect(gain).connect(c.destination)

  noiseSource.start()
  lfo.start()
  gain.gain.linearRampToValueAtTime(0.02, c.currentTime + 1.2)

  breathing = { noiseSource, lfo, gain }
}

export function setBreathingIntensity(level: number) {
  const c = getCtx()
  if (!c || !breathing) return
  const clamped = Math.max(0, Math.min(1, level))
  breathing.gain.gain.linearRampToValueAtTime(0.015 + clamped * 0.05, c.currentTime + 0.4)
  breathing.lfo.frequency.linearRampToValueAtTime(0.22 + clamped * 0.5, c.currentTime + 0.4)
}

export function stopBreathing() {
  const c = getCtx()
  if (!breathing) return
  const { noiseSource, lfo, gain } = breathing
  breathing = null
  if (!c) return
  gain.gain.linearRampToValueAtTime(0.0001, c.currentTime + 0.4)
  setTimeout(() => {
    noiseSource.stop()
    lfo.stop()
  }, 450)
}
