import type { WeatherResponse } from '../types/weather';
import { weatherCodeInfo } from '../utils/weather';
import { WeatherIcon } from './CurrentWeather';

export function WeeklyForecast({ weather, units }: { weather: WeatherResponse; units: 'C' | 'F' }) {
  const temp = (v: number) => Math.round(units === 'C' ? v : v * 9 / 5 + 32);
  const min = Math.min(...weather.daily.temperature_2m_min);
  const max = Math.max(...weather.daily.temperature_2m_max);
  const span = Math.max(1, max - min);
  return <div className="weekly-list">{weather.daily.time.slice(0, 7).map((day, i) => {
    const date = new Date(`${day}T12:00:00`);
    const label = i === 0 ? 'Hari ini' : i === 1 ? 'Besok' : date.toLocaleDateString('id-ID', { weekday: 'long' });
    const lo = weather.daily.temperature_2m_min[i];
    const hi = weather.daily.temperature_2m_max[i];
    const left = ((lo - min) / span) * 100;
    const width = ((hi - lo) / span) * 100;
    return <div className="weekly-row" key={day}><div className="weekly-day"><strong>{label}</strong><small>{date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</small></div><div className="weekly-condition"><WeatherIcon code={weather.daily.weather_code[i]} size={22}/><span>{weatherCodeInfo(weather.daily.weather_code[i]).label}</span></div><div className="weekly-rain">{weather.daily.precipitation_probability_max[i] ?? 0}% <span>hujan</span></div><div className="weekly-range"><b>{temp(lo)}°</b><div className="range-track"><i style={{ left: `${left}%`, width: `${Math.max(width, 4)}%` }}/></div><b>{temp(hi)}°</b></div></div>;
  })}</div>;
}
