import { useMemo, useState } from 'react'
import type { ApiEvent } from '../types/api'
import { dayKeyOf, toDayKey } from '../utils/format'

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

const monthLabel = (year: number, month: number) =>
  new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(new Date(year, month, 1))

type TrekCalendarProps = {
  events: ApiEvent[]
  markedDaysLabel?: string
  onSelectDay: (day: string | null) => void
  selectedDay: string | null
}

export function TrekCalendar({
  events,
  markedDaysLabel = 'Marked days have a trek you joined.',
  onSelectDay,
  selectedDay,
}: TrekCalendarProps) {
  const trekCountByDay = useMemo(() => {
    const counts = new Map<string, number>()
    events.forEach((event) => {
      const key = toDayKey(event.starts_at)
      if (key) counts.set(key, (counts.get(key) ?? 0) + 1)
    })
    return counts
  }, [events])

  // Open on the month of the earliest trek so the markers are visible right away.
  const [cursor, setCursor] = useState(() => {
    const earliest = [...trekCountByDay.keys()].sort()[0]
    if (!earliest) {
      const today = new Date()
      return { month: today.getMonth(), year: today.getFullYear() }
    }
    const [year, month] = earliest.split('-').map(Number)
    return { month: month - 1, year }
  })

  const shiftMonth = (step: number) => {
    const next = new Date(cursor.year, cursor.month + step, 1)
    setCursor({ month: next.getMonth(), year: next.getFullYear() })
  }

  const leadingBlanks = new Date(cursor.year, cursor.month, 1).getDay()
  const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate()
  const now = new Date()
  const todayKey = dayKeyOf(now.getFullYear(), now.getMonth(), now.getDate())

  return (
    <div className="trek-calendar">
      <div className="trek-calendar-head">
        <button
          aria-label="Previous month"
          onClick={() => shiftMonth(-1)}
          type="button"
          className="trek-calendar-nav"
        >
          <span className="material-symbols-outlined">chevron_left</span>
        </button>
        <strong>{monthLabel(cursor.year, cursor.month)}</strong>
        <button
          aria-label="Next month"
          onClick={() => shiftMonth(1)}
          type="button"
          className="trek-calendar-nav"
        >
          <span className="material-symbols-outlined">chevron_right</span>
        </button>
      </div>
      <div className="trek-calendar-grid">
        {WEEKDAYS.map((weekday) => (
          <span className="trek-calendar-weekday" key={weekday}>
            {weekday}
          </span>
        ))}
        {Array.from({ length: leadingBlanks }, (_, index) => (
          <span className="trek-calendar-blank" key={`blank-${index}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, index) => {
          const day = index + 1
          const key = dayKeyOf(cursor.year, cursor.month, day)
          const count = trekCountByDay.get(key) ?? 0
          const className = [
            'trek-calendar-day',
            count ? 'has-trek' : '',
            key === selectedDay ? 'selected' : '',
            key === todayKey ? 'today' : '',
          ]
            .filter(Boolean)
            .join(' ')

          if (!count) {
            return (
              <span className={className} key={key}>
                {day}
              </span>
            )
          }

          return (
            <button
              aria-label={`${count} trek${count > 1 ? 's' : ''} on ${key}`}
              aria-pressed={key === selectedDay}
              className={className}
              key={key}
              onClick={() => onSelectDay(key === selectedDay ? null : key)}
              type="button"
            >
              {day}
              <i />
            </button>
          )
        })}
      </div>
      <p className="trek-calendar-foot">
        {selectedDay ? (
          <button onClick={() => onSelectDay(null)} type="button">
            Clear day filter
          </button>
        ) : (
          markedDaysLabel
        )}
      </p>
    </div>
  )
}
