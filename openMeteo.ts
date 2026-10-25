import type { AirResponse, Location, WeatherResponse } from '../types/weather';

const WEATHER_BASE = 'https://api.open-meteo.com/v1/forecast';
const AIR_BASE = 'https://air-quality-api.open-meteo.com/v1/air-quality';
const GEOCODING_BASE = 'https://geocoding-api.open-meteo.com/v1/search';

async function fetchJSON<T>(url: URL, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal, headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`Layanan data merespons ${response.status}.`);
  const data: unknown = await response.json();
  if (data && typeof data === 'object' && 'error' in data && data.error) {
    const reason = 'reason' in data && typeof data.reason === 'string' ? data.reason : 'Permintaan data ditolak.';
    throw new Error(reason);
  }
  return data as T;
}

function createURL(base: string, params: Record<string, string | number>): URL {
  const url = new URL(base);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, String(value)));
  return url;
}

export async function searchLocations(query: string, signal?: AbortSignal): Promise<Location[]> {
  const url = createURL(GEOCODING_BASE, { name: query, count: 8, language: 'id', format: 'json' });
  const data = await fetchJSON<{ results?: Array<Location> }>(url, signal);
  return (data.results ?? []).filter((location) => Number.isFinite(location.latitude) && Number.isFinite(location.longitude));
}

export async function getWeather(location: Location, signal?: AbortSignal): Promise<WeatherResponse> {
  const url = createURL(WEATHER_BASE, {
    latitude: location.latitude,
    longitude: location.longitude,
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure',
    hourly: 'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,uv_index,visibility,wind_speed_10m,et0_fao_evapotranspiration',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,uv_index_max,et0_fao_evapotranspiration,wind_speed_10m_max',
    past_days: 7,
    forecast_days: 7,
    timezone: 'auto',
  });
  return fetchJSON<WeatherResponse>(url, signal);
}

export async function getAirQuality(location: Location, signal?: AbortSignal): Promise<AirResponse> {
  const url = createURL(AIR_BASE, {
    latitude: location.latitude,
    longitude: location.longitude,
    current: 'european_aqi,pm2_5,pm10',
    hourly: 'european_aqi,pm2_5,pm10',
    past_days: 7,
    forecast_days: 7,
    timezone: 'auto',
  });
  return fetchJSON<AirResponse>(url, signal);
}

export function locationLabel(location: Location): string {
  return [location.name, location.admin1, location.country]
    .filter(Boolean)
    .filter((value, index, list) => list.indexOf(value) === index)
    .join(', ');
}
