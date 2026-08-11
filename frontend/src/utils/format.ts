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

export const formatDistance = (value: string | number) => `${Number(value).toFixed(1)} km`
