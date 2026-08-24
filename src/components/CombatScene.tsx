import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { useGameStore } from '../state/store'
import { playGunshot, playEnemyHit, playEnemyDown, playPlayerHurt } from '../lib/sound'

const MAX_HP = 4
const HIDDEN_MS = 900
const EXPOSED_MS = 1300
const COVER_SPOTS = [22, 50, 78]

export default function CombatScene({
  enemyName,
  onVictory,
}: {
  enemyName: string
  onVictory: () => void
}) {
  const soundEnabled = useGameStore((s) => s.soundEnabled)
  const soundEnabledRef = useRef(soundEnabled)
  useEffect(() => {
    soundEnabledRef.current = soundEnabled
  }, [soundEnabled])

  const [hp, setHp] = useState(MAX_HP)
  const [exposed, setExposed] = useState(false)
  const [coverX, setCoverX] = useState(50)
  const [dead, setDead] = useState(false)
  const [hitFlash, setHitFlash] = useState(false)
  const [missFlash, setMissFlash] = useState(false)
  const [muzzle, setMuzzle] = useState<{ x: number; y: number } | null>(null)
  const [crosshair, setCrosshair] = useState({ x: 50, y: 50 })

  const hpRef = useRef(hp)
  const exposedRef = useRef(false)
  const hitDuringExposureRef = useRef(false)
  const deadRef = useRef(false)
  const cancelledRef = useRef(false)
  const timeoutRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    cancelledRef.current = false
    cycle()
    return () => {
      cancelledRef.current = true
      window.clearTimeout(timeoutRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function cycle() {
    if (cancelledRef.current || deadRef.current) return
    setExposed(false)
    exposedRef.current = false
    timeoutRef.current = window.setTimeout(() => {
      if (cancelledRef.current || deadRef.current) return
      setCoverX(COVER_SPOTS[Math.floor(Math.random() * COVER_SPOTS.length)])
      setExposed(true)
      exposedRef.current = true
      hitDuringExposureRef.current = false
      timeoutRef.current = window.setTimeout(() => {
        if (cancelledRef.current || deadRef.current) return
        if (!hitDuringExposureRef.current) {
          setMissFlash(true)
          window.setTimeout(() => setMissFlash(false), 200)
          if (soundEnabledRef.current) playPlayerHurt()
        }
        cycle()
      }, EXPOSED_MS)
    }, HIDDEN_MS)
  }

  function handleSceneClick(e: MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setMuzzle({ x, y })
    window.setTimeout(() => setMuzzle(null), 120)
    if (soundEnabledRef.current) playGunshot()
  }

  function handleHitEnemy(e: MouseEvent) {
    e.stopPropagation()
    if (!exposedRef.current || deadRef.current) return
    hitDuringExposureRef.current = true
    window.clearTimeout(timeoutRef.current)
    if (soundEnabledRef.current) {
      playGunshot()
      playEnemyHit()
    }
    setHitFlash(true)
    window.setTimeout(() => setHitFlash(false), 150)
    const nextHp = hpRef.current - 1
    setHp(nextHp)
    hpRef.current = nextHp
    if (nextHp <= 0) {
      deadRef.current = true
      setDead(true)
      setExposed(false)
      if (soundEnabledRef.current) playEnemyDown()
      window.setTimeout(() => onVictory(), 900)
    } else {
      setExposed(false)
      exposedRef.current = false
      timeoutRef.current = window.setTimeout(cycle, 500)
    }
  }

  return (
    <div
      className={`combat-scene ${missFlash ? 'combat-scene-hurt' : ''}`}
      onClick={handleSceneClick}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        setCrosshair({
          x: ((e.clientX - rect.left) / rect.width) * 100,
          y: ((e.clientY - rect.top) / rect.height) * 100,
        })
      }}
    >
      <div className="combat-hud">
        <span className="combat-enemy-name">{enemyName}</span>
        <div className="combat-hp-bar">
          <div className="combat-hp-fill" style={{ width: `${(hp / MAX_HP) * 100}%` }} />
        </div>
      </div>

      {!dead && (
        <div
          className={`combat-enemy ${exposed ? 'combat-enemy-exposed' : 'combat-enemy-hidden'} ${hitFlash ? 'combat-enemy-hit' : ''}`}
          style={{ left: `${coverX}%` }}
          onClick={handleHitEnemy}
        >
          <svg viewBox="0 0 64 64" width="90" height="90">
            <defs>
              <radialGradient id="enemy-glow" cx="50%" cy="35%" r="60%">
                <stop offset="0%" stopColor="#ff9b8a" />
                <stop offset="100%" stopColor="#8a1f14" />
              </radialGradient>
            </defs>
            <path d="M32 6 L52 20 V40 C52 52 43 59 32 61 C21 59 12 52 12 40 V20 Z" fill="url(#enemy-glow)" stroke="#4a0f08" strokeWidth="2" />
            <circle cx="32" cy="30" r="8" fill="#2a0805" />
            <circle cx="32" cy="30" r="4.5" fill="#ff3b2f" className="combat-enemy-eye" />
            <path d="M18 44 L46 44 L40 54 L24 54 Z" fill="#2a0805" opacity="0.7" />
          </svg>
        </div>
      )}

      {dead && <div className="combat-enemy-defeated">{'\u{1F4A5}'}</div>}

      <div className="crosshair" style={{ left: `${crosshair.x}%`, top: `${crosshair.y}%` }}>
        <svg viewBox="0 0 40 40" width="40" height="40">
          <circle cx="20" cy="20" r="14" fill="none" stroke="#ff6b5e" strokeWidth="2" />
          <path d="M20 2 V12 M20 28 V38 M2 20 H12 M28 20 H38" stroke="#ff6b5e" strokeWidth="2" />
        </svg>
      </div>

      {muzzle && (
        <div className="muzzle-flash" style={{ left: `${muzzle.x}%`, top: `${muzzle.y}%` }} />
      )}

      <p className="combat-hint">Click the {enemyName.toLowerCase()} when it breaks cover</p>
    </div>
  )
}
