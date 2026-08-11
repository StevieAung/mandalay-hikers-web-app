const toValidDate = (value?: null | string) => {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

// Laravel serializes datetimes with a Z suffix even though they are stored as
// Mandalay wall-clock times, so render them back in UTC to avoid an offset.
const WALL_CLOCK_ZONE = 'UTC'

export const formatDate = (value?: null | string) => {
  const date = toValidDate(value)
  if (!date) return 'Not set'

  return new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: 'short',
    timeZone: WALL_CLOCK_ZONE,
    year: 'numeric',
  }).format(date)
}

export const formatTime = (value?: null | string) => {
  const date = toValidDate(value)
  if (!date) return 'Not set'

  return new Intl.DateTimeFormat('en', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: WALL_CLOCK_ZONE,
  }).format(date)
}

// Calendar day bucket for a wall-clock datetime, as YYYY-MM-DD.
export const toDayKey = (value?: null | string) => {
  const date = toValidDate(value)
  if (!date) return null

  return new Intl.DateTimeFormat('en-CA', {
    day: '2-digit',
    month: '2-digit',
    timeZone: WALL_CLOCK_ZONE,
    year: 'numeric',
  }).format(date)
}

export const dayKeyOf = (year: number, month: number, day: number) =>
  `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

export const formatDistance = (value: string | number) => `${Number(value).toFixed(1)} km`

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

// Record timestamps are genuine UTC (the backend runs on APP_TIMEZONE=UTC), so a
// plain elapsed-time comparison is correct here, unlike the wall-clock fields above.
export const formatRelativeTime = (value?: null | string) => {
  const date = toValidDate(value)
  if (!date) return ''

  const elapsed = Date.now() - date.getTime()
  if (elapsed < MINUTE) return 'Just now'
  if (elapsed < HOUR) return `${Math.floor(elapsed / MINUTE)}m`
  if (elapsed < DAY) return `${Math.floor(elapsed / HOUR)}h`
  if (elapsed < 7 * DAY) return `${Math.floor(elapsed / DAY)}d`

  return formatDate(value)
}

const TRAIL_STATUS_LABELS: Record<string, string> = {
  closed: 'Closed',
  maintenance: 'Under Maintenance',
  open: 'Open',
}

export const trailStatusLabel = (status?: string | null) =>
  TRAIL_STATUS_LABELS[status || 'open'] ?? 'Open'

// Badge modifiers reuse the difficulty palette: orange for highlights, red for
// anything that is no longer bookable, pale for finished treks.
const EVENT_STATUS_TONES: Record<string, string> = {
  cancelled: 'full',
  completed: 'pale',
  featured: 'orange',
  upcoming: '',
}

export const eventStatusTone = (status?: string | null) =>
  EVENT_STATUS_TONES[status || 'upcoming'] ?? ''
