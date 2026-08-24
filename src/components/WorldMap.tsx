import { useEffect, useRef, useState } from 'react'
import { useGameStore } from '../state/store'
import { EDGES, LOCATIONS, findPath, type LocationId } from '../data/locations'
import { getMission } from '../data/missions'
import { levelForXp } from '../data/catalog'
import LocationNode from './LocationNode'
import LocationInfoModal from './LocationInfoModal'

const INFO_LOCATIONS: LocationId[] = ['cisco', 'security', 'grotto', 'cafe']

export default function WorldMap() {
  const currentLocationId = useGameStore((s) => s.currentLocationId)
  const xp = useGameStore((s) => s.xp)
  const extraUnlockedLocations = useGameStore((s) => s.extraUnlockedLocations)
  const activeMissionId = useGameStore((s) => s.activeMissionId)
  const arriveAt = useGameStore((s) => s.arriveAt)
  const pushToast = useGameStore((s) => s.pushToast)
  const walkTarget = useGameStore((s) => s.walkTarget)
  const clearWalkTarget = useGameStore((s) => s.clearWalkTarget)

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

  function handleNodeClick(id: LocationId) {
    if (walking) return
    if (id === currentLocationId) {
      if (INFO_LOCATIONS.includes(id)) setInfoLocation(id)
      return
    }
    if (!isLocationUnlocked(id)) {
      pushToast(`${LOCATIONS[id].name} requires Level ${LOCATIONS[id].lockLevel}`)
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
        if (INFO_LOCATIONS.includes(finalId)) setInfoLocation(finalId)
        return
      }
      const nodeId = path[i]
      setDisplayPos(LOCATIONS[nodeId])
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
        <div className="avatar-tag">YOU</div>
      </div>

      {infoLocation && (
        <LocationInfoModal locationId={infoLocation} onClose={() => setInfoLocation(null)} />
      )}
    </div>
  )
}
