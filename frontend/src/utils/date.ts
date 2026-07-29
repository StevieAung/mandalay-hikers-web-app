import type { Locale } from '../context/LocaleContext'

export function formatEventDate(date: string, time: string, locale: Locale) {
  if (locale === 'en') return `${date} - ${time}`

  const normalizedDate = /\d{4}/.test(date) ? date : `${date}, 2024`
  const value = new Date(`${normalizedDate} ${time}`)
  if (Number.isNaN(value.getTime())) return `${date} - ${time}`

  return new Intl.DateTimeFormat('my-MM', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(value)
}
