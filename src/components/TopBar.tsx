import { useGameStore } from '../state/store'

export default function TopBar() {
  const xp = useGameStore((s) => s.xp)
  const level = useGameStore((s) => s.level())
  const coins = useGameStore((s) => s.coins)
  const badges = useGameStore((s) => s.badges)
  const dayStreak = useGameStore((s) => s.dayStreak)
  const soundEnabled = useGameStore((s) => s.soundEnabled)
  const toggleSound = useGameStore((s) => s.toggleSound)

  return (
    <div className="top-bar">
      <div className="brand">
        <div className="brand-plaque">
          <span className="brand-name">LEVANTA</span>
          <span className="brand-tagline">Learn &middot; Play &middot; Build &middot; Rise</span>
        </div>
        <span className="brand-level" title="Your level">
          Lvl {level}
        </span>
      </div>

      <div className="hud-stats">
        <div className="stat-pill" title="Day streak">
          <span>{'\u{1F525}'}</span>
          {dayStreak}
        </div>
        <div className="stat-pill" title="Total XP">
          <span>⭐</span>
          {xp}
        </div>
        <div className="stat-pill" title="Badges earned">
          <span>{'\u{1F3C6}'}</span>
          {badges.length}
        </div>
        <div className="stat-pill" title="Gems">
          <span>{'\u{1F48E}'}</span>
          {coins}
        </div>
        <button
          type="button"
          className="sound-toggle"
          onClick={toggleSound}
          title={soundEnabled ? 'Mute sound' : 'Unmute sound'}
          aria-label={soundEnabled ? 'Mute sound' : 'Unmute sound'}
        >
          {soundEnabled ? '\u{1F50A}' : '\u{1F507}'}
        </button>
      </div>
    </div>
  )
}
