const toValidDate = (value?: null | string) => {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export const formatDate = (value?: null | string) => {
  const date = toValidDate(value)
  if (!date) return 'Not set'

  return new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export const formatTime = (value?: null | string) => {
  const date = toValidDate(value)
  if (!date) return 'Not set'

  return new Intl.DateTimeFormat('en', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

export const formatDistance = (value: string | number) => `${Number(value).toFixed(1)} km`
