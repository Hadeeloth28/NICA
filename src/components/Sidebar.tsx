import type { PanelKind } from './BottomNav'

const NAV_ITEMS: { id: PanelKind; label: string; icon: string }[] = [
  { id: 'achievements', label: 'Achievements', icon: '✓' },
  { id: 'inventory', label: 'Inventory', icon: '◆' },
  { id: 'leaderboard', label: 'Leaderboard', icon: '\u{1F465}' },
  { id: 'calendar', label: 'Calendar', icon: '\u{1F4C5}' },
  { id: 'messages', label: 'Messages', icon: '✉️' },
]

export default function Sidebar({
  activePanel,
  onOpen,
  onHome,
}: {
  activePanel: PanelKind | null
  onOpen: (panel: PanelKind) => void
  onHome: () => void
}) {
  return (
    <nav className="sidebar" aria-label="Main navigation">
      <button
        type="button"
        className={`sidebar-item sidebar-home ${activePanel === null ? 'active' : ''}`}
        title="Map"
        aria-label="Map"
        onClick={onHome}
      >
        <span className="sidebar-icon">{'\u{1F3E0}'}</span>
      </button>
      {NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`sidebar-item ${activePanel === item.id ? 'active' : ''}`}
          title={item.label}
          aria-label={item.label}
          onClick={() => onOpen(item.id)}
        >
          <span className="sidebar-icon">{item.icon}</span>
        </button>
      ))}
    </nav>
  )
}
