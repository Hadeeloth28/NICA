import { useState } from 'react'
import { useGameStore } from '../../state/store'
import { MESSAGES } from '../../data/messages'
import Modal from '../Modal'

export default function MessagesPanel({ onClose }: { onClose: () => void }) {
  const readMessageIds = useGameStore((s) => s.readMessageIds)
  const markMessageRead = useGameStore((s) => s.markMessageRead)
  const [openId, setOpenId] = useState<string | null>(null)

  const openMessage = MESSAGES.find((m) => m.id === openId)

  return (
    <Modal title="Messages" icon={'✉️'} onClose={onClose}>
      {!openMessage ? (
        <ul className="catalog-list">
          {MESSAGES.map((m) => {
            const unread = !readMessageIds.includes(m.id)
            return (
              <li
                key={m.id}
                className="catalog-row catalog-row-clickable"
                onClick={() => {
                  setOpenId(m.id)
                  markMessageRead(m.id)
                }}
              >
                <span className="catalog-icon">{unread ? '\u{1F535}' : '✉️'}</span>
                <div>
                  <div className="catalog-name">{m.subject}</div>
                  <div className="catalog-desc">from {m.from}</div>
                </div>
              </li>
            )
          })}
        </ul>
      ) : (
        <div>
          <button type="button" className="btn btn-secondary" onClick={() => setOpenId(null)}>
            {'←'} Back
          </button>
          <p className="modal-note" style={{ marginTop: '0.75rem' }}>
            From {openMessage.from}
          </p>
          <p className="mission-title" style={{ fontSize: '1.05rem' }}>
            {openMessage.subject}
          </p>
          <p>{openMessage.body}</p>
        </div>
      )}
    </Modal>
  )
}
