import { useGameStore } from '../../state/store'
import { NPC_LEADERBOARD } from '../../data/catalog'
import Modal from '../Modal'

export default function LeaderboardPanel({ onClose }: { onClose: () => void }) {
  const xp = useGameStore((s) => s.xp)
  const playerName = useGameStore((s) => s.playerName)

  const rows = [...NPC_LEADERBOARD, { name: playerName, xp, isPlayer: true }].sort((a, b) => b.xp - a.xp)

  return (
    <Modal title="Leaderboard" icon={'\u{1F4CB}'} onClose={onClose}>
      <ol className="leaderboard-list">
        {rows.map((row, i) => (
          <li key={row.name} className={`leaderboard-row ${'isPlayer' in row && row.isPlayer ? 'leaderboard-row-you' : ''}`}>
            <span className="leaderboard-rank">#{i + 1}</span>
            <span className="leaderboard-name">{row.name}</span>
            <span className="leaderboard-xp">{row.xp} XP</span>
          </li>
        ))}
      </ol>
    </Modal>
  )
}
