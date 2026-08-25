import { useEffect, useState } from 'react'
import { useGameStore } from '../state/store'
import { getMission } from '../data/missions'
import { QUIZZES } from '../data/quizzes'
import RoomSceneArt from './RoomSceneArt'
import CombatScene from './CombatScene'
import QuizModal from './QuizModal'

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function RoomScene() {
  const session = useGameStore((s) => s.roomSession)
  const answerRoomStation = useGameStore((s) => s.answerRoomStation)
  const resolveCombatVictory = useGameStore((s) => s.resolveCombatVictory)
  const finishRoomSuccess = useGameStore((s) => s.finishRoomSuccess)
  const finishRoomFail = useGameStore((s) => s.finishRoomFail)
  const checkRoomComplete = useGameStore((s) => s.checkRoomComplete)

  const [openStationId, setOpenStationId] = useState<string | null>(null)

  useEffect(() => {
    if (session?.phase === 'success') {
      const t = setTimeout(() => finishRoomSuccess(), 2600)
      return () => clearTimeout(t)
    }
  }, [session?.phase, finishRoomSuccess])

  // Safety net: if every station is ever marked solved while still in the
  // stations phase (should already be handled by answerRoomStation), force
  // the success transition instead of leaving the player stuck.
  useEffect(() => {
    checkRoomComplete()
  }, [session?.solvedStationIds, session?.phase, checkRoomComplete])

  if (!session) return null

  const mission = getMission(session.missionId)
  if (!mission || !mission.room) return null

  const timedOut = session.timeLeftSec <= 0

  return (
    <div className="room-overlay">
      <div className="room-hud">
        <div className="room-hud-tag">{mission.title.toUpperCase()} · LOCKED</div>
        <div className={`room-timer ${session.timeLeftSec <= 60 ? 'room-timer-danger' : ''}`}>
          {'⏱️'} {formatTime(Math.max(0, session.timeLeftSec))}
        </div>
        <div className="room-attempts" title="Attempts remaining">
          {Array.from({ length: session.maxAttempts }, (_, i) => (
            <span key={i} className={i < session.attemptsLeft ? 'heart heart-full' : 'heart heart-empty'}>
              {i < session.attemptsLeft ? '❤️' : '\u{1F5A4}'}
            </span>
          ))}
        </div>
      </div>

      <RoomSceneArt locationId={mission.targetLocationId} />

      {session.phase === 'combat' && (
        <CombatScene enemyName={session.enemyName} onVictory={resolveCombatVictory} />
      )}

      {session.phase === 'stations' && (
        <div className="room-body">
          <div className="room-locks">
            {mission.room.stations.map((st) => {
              const done = session.solvedStationIds.includes(st.id)
              return (
                <div key={st.id} className={`room-lock ${done ? 'room-lock-done' : ''}`}>
                  <span className="room-lock-dot" />
                  {done ? 'LINK UP' : 'LINK DOWN'}
                </div>
              )
            })}
          </div>
          <div className="room-stations">
            {mission.room.stations.map((st, i) => {
              const done = session.solvedStationIds.includes(st.id)
              return (
                <button
                  key={st.id}
                  type="button"
                  className={`room-station ${done ? 'room-station-done' : ''}`}
                  disabled={done}
                  onClick={() => setOpenStationId(st.id)}
                >
                  <span className="room-station-num">{done ? '✓' : i + 1}</span>
                  <span className="room-station-label">{st.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {session.phase === 'success' && (
        <div className="room-result room-result-success">
          <div className="room-result-title">ACCESS GRANTED</div>
          <p>Every link restored. The door releases.</p>
        </div>
      )}

      {session.phase === 'failed' && (
        <div className="room-result room-result-fail">
          <div className="room-result-title">{timedOut ? 'TIME EXPIRED' : 'OUT OF ATTEMPTS'}</div>
          <p>{mission.room.enemyName} overwhelmed the room. You're ejected back outside.</p>
          <button type="button" className="btn btn-danger" onClick={finishRoomFail}>
            Return to Map
          </button>
        </div>
      )}

      {openStationId && (
        <QuizModal
          quiz={QUIZZES[mission.room.stations.find((s) => s.id === openStationId)!.quizId]}
          onClose={() => setOpenStationId(null)}
          onSolved={() => {
            answerRoomStation(openStationId, true)
            setOpenStationId(null)
          }}
          onIncorrect={() => {
            answerRoomStation(openStationId, false)
            setOpenStationId(null)
          }}
        />
      )}
    </div>
  )
}
