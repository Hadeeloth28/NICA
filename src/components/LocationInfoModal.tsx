import { useGameStore } from '../state/store'
import { LOCATIONS, type LocationId } from '../data/locations'
import Modal from './Modal'

export default function LocationInfoModal({
  locationId,
  onClose,
}: {
  locationId: LocationId
  onClose: () => void
}) {
  const loc = LOCATIONS[locationId]
  const grottoClaimed = useGameStore((s) => s.grottoClaimed)
  const level = useGameStore((s) => s.level())

  return (
    <Modal title={loc.name} icon={loc.icon} onClose={onClose}>
      <p>{loc.description}</p>
      {locationId === 'grotto' && (
        <p className="modal-note">
          {grottoClaimed
            ? 'You already claimed the treasure hidden here.'
            : 'Something glimmers in the shadows...'}
        </p>
      )}
      {locationId === 'cisco' && (
        <p className="modal-note">
          Coursework unlocks here at Level 20. You are currently Level {level}.
        </p>
      )}
      {locationId === 'security' && (
        <p className="modal-note">Central command. New missions will appear here as they unlock.</p>
      )}
      {locationId === 'lab' && (
        <p className="modal-note">High-clearance wing. Only accessible once Sophia grants you access.</p>
      )}
    </Modal>
  )
}
