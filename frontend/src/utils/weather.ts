export type TrailCoordinates = {
  latitude: number
  longitude: number
}

export type WeatherCondition =
  'clear' | 'cloudy' | 'drizzle' | 'fog' | 'rain' | 'snow' | 'thunderstorm'

export type TrailWeather = {
  current: {
    apparentTemperature: number
    condition: WeatherCondition
    precipitation: number
    temperature: number
    windSpeed: number
  }
  daily: Array<{
    condition: WeatherCondition
    date: string
    precipitationProbability: number
    temperatureMax: number
    temperatureMin: number
    windSpeedMax: number
  }>
}

type OpenMeteoResponse = {
  current?: {
    apparent_temperature?: number
    precipitation?: number
    temperature_2m?: number
    weather_code?: number
    wind_speed_10m?: number
  }
  daily?: {
    precipitation_probability_max?: number[]
    temperature_2m_max?: number[]
    temperature_2m_min?: number[]
    time?: string[]
    weather_code?: number[]
    wind_speed_10m_max?: number[]
  }
}

const endpoint = 'https://api.open-meteo.com/v1/forecast'

export const weatherConditionFromCode = (code?: number): WeatherCondition => {
  if (code === 0 || code === 1) return 'clear'
  if (code === 2 || code === 3) return 'cloudy'
  if (code === 45 || code === 48) return 'fog'
  if ([51, 53, 55, 56, 57].includes(code ?? -1)) return 'drizzle'
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code ?? -1)) return 'rain'
  if ([71, 73, 75, 77, 85, 86].includes(code ?? -1)) return 'snow'
  if ([95, 96, 99].includes(code ?? -1)) return 'thunderstorm'
  return 'cloudy'
}

export async function fetchTrailWeather(
  coordinates: TrailCoordinates,
  signal?: AbortSignal,
): Promise<TrailWeather> {
  const search = new URLSearchParams({
    current: 'temperature_2m,apparent_temperature,weather_code,precipitation,wind_speed_10m',
    daily:
      'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max',
    forecast_days: '3',
    latitude: String(coordinates.latitude),
    longitude: String(coordinates.longitude),
    temperature_unit: 'celsius',
    timezone: 'auto',
    wind_speed_unit: 'kmh',
  })
  const response = await fetch(`${endpoint}?${search.toString()}`, { signal })

  if (!response.ok) throw new Error('Weather request failed.')

  const payload = (await response.json()) as OpenMeteoResponse
  const current = payload.current
  const daily = payload.daily

  if (
    !current ||
    !daily?.time ||
    current.temperature_2m == null ||
    current.apparent_temperature == null ||
    current.precipitation == null ||
    current.wind_speed_10m == null
  ) {
    throw new Error('Weather data is incomplete.')
  }

  return {
    current: {
      apparentTemperature: current.apparent_temperature,
      condition: weatherConditionFromCode(current.weather_code),
      precipitation: current.precipitation,
      temperature: current.temperature_2m,
      windSpeed: current.wind_speed_10m,
    },
    daily: daily.time.slice(0, 3).map((date, index) => ({
      condition: weatherConditionFromCode(daily.weather_code?.[index]),
      date,
      precipitationProbability: daily.precipitation_probability_max?.[index] ?? 0,
      temperatureMax: daily.temperature_2m_max?.[index] ?? 0,
      temperatureMin: daily.temperature_2m_min?.[index] ?? 0,
      windSpeedMax: daily.wind_speed_10m_max?.[index] ?? 0,
    })),
  }
}
