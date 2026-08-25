import { useEffect, useRef, useState } from 'react'
import { useGameStore } from '../state/store'
import { EDGES, LOCATIONS, findPath, type LocationId } from '../data/locations'
import { getMission } from '../data/missions'
import { levelForXp } from '../data/catalog'
import { playFootstep, playLocked } from '../lib/sound'
import LocationNode from './LocationNode'
import LocationInfoModal from './LocationInfoModal'

const INFO_LOCATIONS: LocationId[] = ['cisco', 'security', 'grotto', 'cafe', 'lab']

const FOLIAGE: { x: number; y: number; icon: string; size: number; delay: number }[] = [
  { x: 6, y: 30, icon: '\u{1F334}', size: 2.4, delay: 0 },
  { x: 4, y: 68, icon: '\u{1F33F}', size: 1.6, delay: 0.6 },
  { x: 34, y: 5, icon: '\u{1F334}', size: 2, delay: 1.1 },
  { x: 60, y: 6, icon: '\u{1F33F}', size: 1.4, delay: 0.3 },
  { x: 95, y: 34, icon: '\u{1F334}', size: 2.2, delay: 0.9 },
  { x: 40, y: 92, icon: '\u{1F33F}', size: 1.6, delay: 1.4 },
  { x: 65, y: 90, icon: '\u{1F334}', size: 2, delay: 0.4 },
  { x: 24, y: 45, icon: '\u{1F33F}', size: 1.3, delay: 1.7 },
]

export default function WorldMap() {
  const currentLocationId = useGameStore((s) => s.currentLocationId)
  const xp = useGameStore((s) => s.xp)
  const extraUnlockedLocations = useGameStore((s) => s.extraUnlockedLocations)
  const activeMissionId = useGameStore((s) => s.activeMissionId)
  const arriveAt = useGameStore((s) => s.arriveAt)
  const pushToast = useGameStore((s) => s.pushToast)
  const walkTarget = useGameStore((s) => s.walkTarget)
  const clearWalkTarget = useGameStore((s) => s.clearWalkTarget)
  const soundEnabled = useGameStore((s) => s.soundEnabled)
  const enterRoom = useGameStore((s) => s.enterRoom)
  const roomSession = useGameStore((s) => s.roomSession)

  const level = levelForXp(xp)
  const isLocationUnlocked = (id: LocationId) =>
    extraUnlockedLocations.includes(id) || level >= LOCATIONS[id].lockLevel
  const mission = activeMissionId ? getMission(activeMissionId) : undefined

  const [displayPos, setDisplayPos] = useState(() => LOCATIONS[currentLocationId])
  const [walking, setWalking] = useState(false)
  const [infoLocation, setInfoLocation] = useState<LocationId | null>(null)
  const timeoutRef = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timeoutRef.current), [])

  useEffect(() => {
    if (walkTarget && !walking) {
      clearWalkTarget()
      handleNodeClick(walkTarget)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walkTarget])

  const isMissionTarget = (id: LocationId) => mission?.targetLocationId === id

  function handleNodeClick(id: LocationId) {
    if (walking) return
    if (id === currentLocationId) {
      if (isMissionTarget(id) && mission?.room && !roomSession) {
        enterRoom(mission.id)
        return
      }
      if (INFO_LOCATIONS.includes(id) && !isMissionTarget(id)) setInfoLocation(id)
      return
    }
    if (!isLocationUnlocked(id)) {
      pushToast(`${LOCATIONS[id].name} requires Level ${LOCATIONS[id].lockLevel}`)
      if (soundEnabled) playLocked()
      return
    }
    const path = findPath(currentLocationId, id)
    walkPath(path)
  }

  function walkPath(path: LocationId[]) {
    setWalking(true)
    let i = 1
    const step = () => {
      if (i >= path.length) {
        setWalking(false)
        const finalId = path[path.length - 1]
        if (INFO_LOCATIONS.includes(finalId) && !isMissionTarget(finalId)) setInfoLocation(finalId)
        return
      }
      const nodeId = path[i]
      setDisplayPos(LOCATIONS[nodeId])
      if (soundEnabled) playFootstep()
      const duration = 750
      timeoutRef.current = window.setTimeout(() => {
        arriveAt(nodeId)
        i++
        step()
      }, duration)
    }
    step()
  }

  return (
    <div className="world-map">
      <div className="map-foliage" aria-hidden="true" />
      {FOLIAGE.map((f, i) => (
        <div
          key={i}
          className="foliage-deco"
          style={{ left: `${f.x}%`, top: `${f.y}%`, fontSize: `${f.size}rem`, animationDelay: `${f.delay}s` }}
          aria-hidden="true"
        >
          {f.icon}
        </div>
      ))}
      <svg className="path-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
        {EDGES.map(([a, b]) => (
          <line
            key={`${a}-${b}`}
            x1={LOCATIONS[a].x}
            y1={LOCATIONS[a].y}
            x2={LOCATIONS[b].x}
            y2={LOCATIONS[b].y}
            className="path-line"
          />
        ))}
      </svg>

      {(Object.values(LOCATIONS) as (typeof LOCATIONS)[LocationId][])
        .filter((loc) => loc.id !== 'start')
        .map((loc) => (
          <LocationNode
            key={loc.id}
            loc={loc}
            unlocked={isLocationUnlocked(loc.id)}
            isCurrent={loc.id === currentLocationId}
            isMissionTarget={mission?.targetLocationId === loc.id}
            onClick={() => handleNodeClick(loc.id)}
          />
        ))}

      <div
        className={`avatar ${walking ? 'walking' : ''}`}
        style={{ left: `${displayPos.x}%`, top: `${displayPos.y}%` }}
      >
        <div className="avatar-figure">{'\u{1F9D1}\u{200D}\u{1F4BB}'}</div>
        <div className="avatar-tag">YOU &middot; Lvl {level}</div>
      </div>

      {infoLocation && (
        <LocationInfoModal locationId={infoLocation} onClose={() => setInfoLocation(null)} />
      )}
    </div>
  )
}
