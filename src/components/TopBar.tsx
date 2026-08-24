import { useGameStore } from '../state/store'
import { xpForLevel } from '../data/catalog'

export default function TopBar() {
  const xp = useGameStore((s) => s.xp)
  const level = useGameStore((s) => s.level())
  const coins = useGameStore((s) => s.coins)
  const badges = useGameStore((s) => s.badges)

  const currentLevelXp = xpForLevel(level)
  const nextLevelXp = xpForLevel(level + 1)
  const progress = Math.min(
    100,
    Math.round(((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100),
  )

  return (
    <div className="top-bar">
      <div className="brand">
        <span className="brand-mark">{'\u{1F6E1}️'}</span>
        <span className="brand-name">NICA</span>
      </div>

      <div className="level-block">
        <div className="level-badge">Lvl {level}</div>
        <div className="xp-bar">
          <div className="xp-bar-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="xp-label">
          {xp} XP <span className="xp-label-dim">/ {nextLevelXp} next</span>
        </div>
      </div>

      <div className="stat-pill" title="Badges earned">
        <span>{'\u{1F396}️'}</span>
        {badges.length}
      </div>
      <div className="stat-pill" title="Coins">
        <span>{'\u{1FA99}'}</span>
        {coins}
      </div>
    </div>
  )
}
