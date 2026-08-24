import { useGameStore } from '../state/store'
import { LOCATIONS } from '../data/locations'
import { getMission } from '../data/missions'

export default function SophiaPanel() {
  const activeMissionId = useGameStore((s) => s.activeMissionId)
  const completedObjectives = useGameStore((s) => s.completedObjectives)
  const completedMissions = useGameStore((s) => s.completedMissions)
  const currentLocationId = useGameStore((s) => s.currentLocationId)

  const mission = activeMissionId ? getMission(activeMissionId) : undefined
  let message: string

  if (!mission) {
    message =
      completedMissions.length > 0
        ? "Excellent work. You've cleared every mission I have for you right now — keep exploring the map."
        : 'Welcome to Levanta! Explore the map to find your first mission.'
  } else {
    const done = completedObjectives[mission.id] ?? []
    const next = mission.objectives.find((o) => !done.includes(o.id))
    if (done.length === 0) {
      message = mission.briefing
    } else if (next) {
      message =
        next.type === 'walk'
          ? `Good progress. Head to the ${LOCATIONS[next.locationId!].name} next.`
          : `Nice work so far. Ready for the next challenge: "${next.label}".`
    } else {
      message = `Mission complete! ${mission.completeText}`
    }
  }

  return (
    <div className="panel sophia-panel">
      <div className="sophia-avatar">{'\u{1F469}\u{200D}\u{1F4BB}'}</div>
      <div className="sophia-content">
        <div className="sophia-name">
          Sophia AI <span className="sophia-dot" />
        </div>
        <p className="sophia-message">{message}</p>
        <p className="sophia-location">
          {'\u{1F4CD}'} You are at {LOCATIONS[currentLocationId].name}
        </p>
      </div>
    </div>
  )
}
