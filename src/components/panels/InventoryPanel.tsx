import { useGameStore } from '../../state/store'
import { ITEMS } from '../../data/catalog'
import Modal from '../Modal'

export default function InventoryPanel({ onClose }: { onClose: () => void }) {
  const inventory = useGameStore((s) => s.inventory)
  const coins = useGameStore((s) => s.coins)

  return (
    <Modal title="Inventory" icon={'\u{1F392}'} onClose={onClose}>
      <p className="modal-note">{'\u{1FA99}'} {coins} coins</p>
      {inventory.length === 0 ? (
        <p className="modal-note">No items yet. Complete missions to earn rewards.</p>
      ) : (
        <ul className="catalog-list">
          {inventory.map((id, i) => {
            const item = ITEMS[id]
            if (!item) return null
            return (
              <li key={`${id}-${i}`} className="catalog-row">
                <span className="catalog-icon">{item.icon}</span>
                <div>
                  <div className="catalog-name">{item.name}</div>
                  <div className="catalog-desc">{item.description}</div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </Modal>
  )
}
