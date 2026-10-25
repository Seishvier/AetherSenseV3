import { Umbrella } from 'lucide-react';
import type { WeatherResponse } from '../types/weather';
import { formatTime, hourIndexForCurrent, weatherCodeInfo } from '../utils/weather';
import { WeatherIcon } from './CurrentWeather';

export function HourlyForecast({ weather, units }: { weather: WeatherResponse; units: 'C' | 'F' }) {
  const start = hourIndexForCurrent(weather);
  const hours = weather.hourly.time.slice(start, start + 8);
  const temp = (value: number) => Math.round(units === 'C' ? value : value * 9 / 5 + 32);
  return <div className="hourly-rail">{hours.map((time, offset) => {
    const i = start + offset;
    return <article className={`hour-card ${offset === 0 ? 'hour-current' : ''}`} key={time}><span className="hour-time">{offset === 0 ? 'Sekarang' : formatTime(time)}</span><div className="hour-weather-icon"><WeatherIcon code={weather.hourly.weather_code[i]} size={27}/></div><strong>{temp(weather.hourly.temperature_2m[i])}°</strong><span className="hour-rain"><Umbrella size={12}/>{weather.hourly.precipitation_probability[i] ?? 0}%</span></article>;
  })}</div>;
}
