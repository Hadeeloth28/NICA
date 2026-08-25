import type { LocationNode as LocationNodeData } from '../data/locations'
import BuildingIcon from './BuildingIcon'

interface Props {
  loc: LocationNodeData
  unlocked: boolean
  isCurrent: boolean
  isMissionTarget: boolean
  onClick: () => void
}

export default function LocationNode({ loc, unlocked, isCurrent, isMissionTarget, onClick }: Props) {
  return (
    <button
      type="button"
      className={[
        'location-node',
        `theme-${loc.theme}`,
        unlocked ? 'unlocked' : 'locked',
        isCurrent ? 'current' : '',
        isMissionTarget ? 'mission-target' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ left: `${loc.x}%`, top: `${loc.y}%` }}
      onClick={onClick}
    >
      {isMissionTarget && <span className="mission-flag">!</span>}
      <div className="location-icon">
        {unlocked ? <BuildingIcon id={loc.id} /> : '\u{1F512}'}
      </div>
      <div className="location-label">
        <div className="location-name">{loc.name}</div>
        <div className="location-subtitle">{unlocked ? loc.subtitle : `Level ${loc.lockLevel}`}</div>
      </div>
    </button>
  )
}
