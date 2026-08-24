import { useState } from 'react'
import { useGameStore } from '../state/store'
import { QUIZZES } from '../data/quizzes'
import { LOCATIONS } from '../data/locations'
import { getMission } from '../data/missions'
import QuizModal from './QuizModal'

export default function MissionPanel() {
  const activeMissionId = useGameStore((s) => s.activeMissionId)
  const completedObjectives = useGameStore((s) => s.completedObjectives)
  const completeObjective = useGameStore((s) => s.completeObjective)
  const requestWalk = useGameStore((s) => s.requestWalk)
  const enterRoom = useGameStore((s) => s.enterRoom)
  const completedMissions = useGameStore((s) => s.completedMissions)

  const [openQuizId, setOpenQuizId] = useState<string | null>(null)

  const mission = activeMissionId ? getMission(activeMissionId) : undefined

  if (!mission) {
    return (
      <div className="panel mission-panel">
        <div className="panel-eyebrow">Current Mission</div>
        <div className="mission-title mission-title-done">All caught up!</div>
        <p className="modal-note">
          You've completed {completedMissions.length} mission{completedMissions.length === 1 ? '' : 's'}.
          Explore the map for more.
        </p>
      </div>
    )
  }

  const done = completedObjectives[mission.id] ?? []
  const nextObjective = mission.objectives.find((o) => !done.includes(o.id))
  const missionId = mission.id
  const missionRoom = mission.room

  function handleAction() {
    if (!nextObjective) return
    if (nextObjective.type === 'walk' && nextObjective.locationId) {
      requestWalk(nextObjective.locationId)
    } else if (missionRoom) {
      enterRoom(missionId)
    } else if (nextObjective.type === 'quiz' && nextObjective.quizId) {
      setOpenQuizId(nextObjective.quizId)
    }
  }

  const activeQuiz = openQuizId ? QUIZZES[openQuizId] : null

  return (
    <div className="panel mission-panel">
      <div className="panel-eyebrow">Current Mission</div>
      <div className="mission-title">{mission.title}</div>
      <p className="mission-briefing">{mission.briefing}</p>

      <ul className="objective-list">
        {mission.objectives.map((o) => {
          const isDone = done.includes(o.id)
          const isNext = nextObjective?.id === o.id
          return (
            <li key={o.id} className={isDone ? 'objective-done' : isNext ? 'objective-next' : 'objective-pending'}>
              <span className="objective-icon">{isDone ? '✔' : isNext ? '○' : '○'}</span>
              {o.label}
            </li>
          )
        })}
      </ul>

      {nextObjective && (
        <button type="button" className="btn btn-primary btn-block" onClick={handleAction}>
          {nextObjective.type === 'walk'
            ? `Walk to ${LOCATIONS[nextObjective.locationId!].name}`
            : mission.room
              ? `Enter ${LOCATIONS[mission.targetLocationId].name}`
              : 'Start Challenge'}
        </button>
      )}

      {activeQuiz && (
        <QuizModal
          quiz={activeQuiz}
          onClose={() => setOpenQuizId(null)}
          onSolved={() => {
            completeObjective(mission.id, nextObjective!.id)
            setOpenQuizId(null)
          }}
        />
      )}
    </div>
  )
}
