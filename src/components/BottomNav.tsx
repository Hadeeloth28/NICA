export type PanelKind = 'inventory' | 'achievements' | 'leaderboard' | 'calendar' | 'messages'

const NAV_ITEMS: { id: PanelKind; label: string; icon: string }[] = [
  { id: 'inventory', label: 'Inventory', icon: '\u{1F392}' },
  { id: 'achievements', label: 'Achievements', icon: '\u{1F3C6}' },
  { id: 'leaderboard', label: 'Leaderboard', icon: '\u{1F4CB}' },
  { id: 'calendar', label: 'Calendar', icon: '\u{1F4C5}' },
  { id: 'messages', label: 'Messages', icon: '\u{2709}️' },
]

export default function BottomNav({ onOpen }: { onOpen: (panel: PanelKind) => void }) {
  return (
    <div className="bottom-nav">
      {NAV_ITEMS.map((item) => (
        <button key={item.id} type="button" className="bottom-nav-item" onClick={() => onOpen(item.id)}>
          <span className="bottom-nav-icon">{item.icon}</span>
          {item.label}
        </button>
      ))}
    </div>
  )
}
