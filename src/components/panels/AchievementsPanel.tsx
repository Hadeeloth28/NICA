import { useGameStore } from '../../state/store'
import { BADGES } from '../../data/catalog'
import Modal from '../Modal'

export default function AchievementsPanel({ onClose }: { onClose: () => void }) {
  const badges = useGameStore((s) => s.badges)

  return (
    <Modal title="Achievements" icon={'\u{1F3C6}'} onClose={onClose}>
      <ul className="catalog-list">
        {Object.values(BADGES).map((badge) => {
          const earned = badges.includes(badge.id)
          return (
            <li key={badge.id} className={`catalog-row ${earned ? '' : 'catalog-row-locked'}`}>
              <span className="catalog-icon">{earned ? badge.icon : '\u{1F512}'}</span>
              <div>
                <div className="catalog-name">{badge.name}</div>
                <div className="catalog-desc">{badge.description}</div>
              </div>
            </li>
          )
        })}
      </ul>
    </Modal>
  )
}
