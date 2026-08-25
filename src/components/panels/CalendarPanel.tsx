import Modal from '../Modal'

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export default function CalendarPanel({ onClose }: { onClose: () => void }) {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstWeekday = new Date(year, month, 1).getDay()

  const events: Record<number, string> = {
    [Math.min(25, daysInMonth)]: 'Live Workshop: Threat Hunting',
    [Math.min(30, daysInMonth)]: 'Mission Deadline: Security Sweep',
  }

  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  const monthName = today.toLocaleString(undefined, { month: 'long' })

  return (
    <Modal title={`${monthName} ${year}`} icon={'\u{1F4C5}'} onClose={onClose}>
      <div className="calendar-grid">
        {WEEKDAYS.map((w, i) => (
          <div key={`wd-${i}`} className="calendar-weekday">
            {w}
          </div>
        ))}
        {cells.map((day, i) => (
          <div
            key={i}
            className={[
              'calendar-cell',
              day === null ? 'calendar-cell-empty' : '',
              day === today.getDate() ? 'calendar-cell-today' : '',
              day && events[day] ? 'calendar-cell-event' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            title={day ? events[day] : undefined}
          >
            {day ?? ''}
          </div>
        ))}
      </div>
      <ul className="catalog-list">
        {Object.entries(events).map(([day, title]) => (
          <li key={day} className="catalog-row">
            <span className="catalog-icon">{'\u{1F4CC}'}</span>
            <div>
              <div className="catalog-name">{title}</div>
              <div className="catalog-desc">
                {monthName} {day}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </Modal>
  )
}
