import type { ReactNode } from 'react'

interface Props {
  title: string
  onClose: () => void
  children: ReactNode
  icon?: string
}

export default function Modal({ title, onClose, children, icon }: Props) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            {icon && <span className="modal-icon">{icon}</span>}
            {title}
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            {'✕'}
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}
