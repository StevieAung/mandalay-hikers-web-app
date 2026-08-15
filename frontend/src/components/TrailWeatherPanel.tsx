import { useEffect, useState } from 'react'
import { useLocale } from '../context/useLocale'
import {
  fetchTrailWeather,
  type TrailCoordinates,
  type WeatherCondition,
  type TrailWeather,
} from '../utils/weather'

const weatherIcons: Record<WeatherCondition, string> = {
  clear: 'sunny',
  cloudy: 'cloudy',
  drizzle: 'grain',
  fog: 'foggy',
  rain: 'rainy',
  snow: 'ac_unit',
  thunderstorm: 'thunderstorm',
}

const weatherLabelKeys: Record<WeatherCondition, Parameters<ReturnType<typeof useLocale>['t']>[0]> =
  {
    clear: 'weather.clear',
    cloudy: 'weather.cloudy',
    drizzle: 'weather.drizzle',
    fog: 'weather.fog',
    rain: 'weather.rain',
    snow: 'weather.snow',
    thunderstorm: 'weather.thunderstorm',
  }

export function TrailWeatherPanel({ coordinates }: { coordinates: TrailCoordinates | null }) {
  const { locale, t } = useLocale()
  const [weatherState, setWeatherState] = useState<{
    error: boolean
    key: string
    weather: TrailWeather | null
  }>({ error: false, key: '', weather: null })
  const latitude = coordinates?.latitude
  const longitude = coordinates?.longitude
  const weatherKey = coordinates ? `${coordinates.latitude},${coordinates.longitude}` : null

  useEffect(() => {
    if (latitude == null || longitude == null) return

    const controller = new AbortController()
    const key = `${latitude},${longitude}`

    void fetchTrailWeather({ latitude, longitude }, controller.signal)
      .then((response) => {
        setWeatherState({ error: false, key, weather: response })
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return
        setWeatherState({ error: true, key, weather: null })
      })

    return () => controller.abort()
  }, [latitude, longitude])

  if (!coordinates) {
    return (
      <section className="trail-weather-panel trail-weather-state">
        <span className="material-symbols-outlined">location_off</span>
        <div>
          <strong>{t('weather.unavailableTitle')}</strong>
          <p>{t('weather.notMapped')}</p>
        </div>
      </section>
    )
  }

  const weather = weatherState.key === weatherKey ? weatherState.weather : null
  const hasError = weatherState.key === weatherKey && weatherState.error

  if (!weather) {
    return (
      <section className="trail-weather-panel trail-weather-state" aria-live="polite">
        <span className="material-symbols-outlined">progress_activity</span>
        <div>
          <strong>{hasError ? t('weather.unavailableTitle') : t('weather.loading')}</strong>
          <p>{hasError ? t('weather.unavailable') : t('weather.loadingDetail')}</p>
        </div>
      </section>
    )
  }

  const dateLocale = locale === 'my' ? 'my-MM' : 'en'

  return (
    <section className="trail-weather-panel" aria-label={t('weather.accessibilityLabel')}>
      <div className="trail-weather-current">
        <div>
          <span className="weather-eyebrow">{t('weather.current')}</span>
          <div className="weather-condition">
            <span className="material-symbols-outlined" aria-hidden="true">
              {weatherIcons[weather.current.condition]}
            </span>
            <strong>{t(weatherLabelKeys[weather.current.condition])}</strong>
          </div>
        </div>
        <strong className="weather-temperature">{Math.round(weather.current.temperature)}°C</strong>
        <dl className="weather-current-facts">
          <div>
            <dt>{t('weather.feelsLike')}</dt>
            <dd>{Math.round(weather.current.apparentTemperature)}°C</dd>
          </div>
          <div>
            <dt>{t('weather.wind')}</dt>
            <dd>{Math.round(weather.current.windSpeed)} km/h</dd>
          </div>
          <div>
            <dt>{t('weather.rain')}</dt>
            <dd>{weather.current.precipitation.toFixed(1)} mm</dd>
          </div>
        </dl>
      </div>
      <div className="trail-weather-forecast" aria-label={t('weather.forecast')}>
        {weather.daily.map((day) => (
          <article className="weather-day" key={day.date}>
            <span>
              {new Intl.DateTimeFormat(dateLocale, { weekday: 'short' }).format(
                new Date(`${day.date}T12:00:00`),
              )}
            </span>
            <i
              className="material-symbols-outlined"
              aria-label={t(weatherLabelKeys[day.condition])}
            >
              {weatherIcons[day.condition]}
            </i>
            <strong>
              {Math.round(day.temperatureMax)}° / {Math.round(day.temperatureMin)}°
            </strong>
            <small>
              {day.precipitationProbability}% {t('weather.rainChance')}
            </small>
            <small>
              {Math.round(day.windSpeedMax)} km/h {t('weather.wind')}
            </small>
          </article>
        ))}
      </div>
    </section>
  )
}
