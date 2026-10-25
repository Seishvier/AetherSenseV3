import { Cloud, CloudFog, CloudLightning, CloudRain, CloudSun, Droplets, Eye, Gauge, Sun, Wind } from 'lucide-react';
import type { WeatherResponse } from '../types/weather';
import { directionLabel, formatTime, hourIndexForCurrent, weatherCodeInfo } from '../utils/weather';

function WeatherIcon({ code, size = 48 }: { code: number; size?: number }) {
  const info = weatherCodeInfo(code);
  const props = { size, strokeWidth: 1.5 };
  if (info.icon === 'sun') return <Sun {...props} className="weather-glyph sun-glyph"/>;
  if (info.icon === 'cloud-sun') return <CloudSun {...props} className="weather-glyph sun-glyph"/>;
  if (info.icon === 'cloud-fog') return <CloudFog {...props} className="weather-glyph"/>;
  if (info.icon === 'cloud-drizzle' || info.icon === 'cloud-rain') return <CloudRain {...props} className="weather-glyph rain-glyph"/>;
  if (info.icon === 'cloud-lightning') return <CloudLightning {...props} className="weather-glyph storm-glyph"/>;
  return <Cloud {...props} className="weather-glyph"/>;
}

export { WeatherIcon };

export function CurrentWeather({ weather, units, onToggleUnits }: { weather: WeatherResponse; units: 'C' | 'F'; onToggleUnits: () => void }) {
  const { current, daily, hourly } = weather;
  const index = hourIndexForCurrent(weather);
  const temperature = (value: number) => Math.round(units === 'C' ? value : value * 9 / 5 + 32);
  const tempUnit = `°${units}`;
  const uv = hourly.uv_index[index] ?? daily.uv_index_max[0] ?? 0;
  const visibilityKm = hourly.visibility[index] == null ? null : hourly.visibility[index] / 1000;
  const metrics = [
    { label: 'Kelembapan', value: `${current.relative_humidity_2m}%`, note: current.relative_humidity_2m >= 80 ? 'Udara lembap' : 'Kelembapan relatif', icon: Droplets },
    { label: 'Kecepatan angin', value: `${Math.round(current.wind_speed_10m)} km/jam`, note: directionLabel(current.wind_direction_10m), icon: Wind },
    { label: 'Tekanan udara', value: `${Math.round(current.surface_pressure)} hPa`, note: 'Tekanan permukaan', icon: Gauge },
    { label: 'Jarak pandang', value: visibilityKm == null ? '—' : `${visibilityKm.toFixed(1)} km`, note: 'Estimasi model', icon: Eye },
  ];
  const uvLabel = uv < 3 ? 'Rendah' : uv < 6 ? 'Sedang' : uv < 8 ? 'Tinggi' : uv < 11 ? 'Sangat tinggi' : 'Ekstrem';
  return <>
    <section className="hero-weather glass-card">
      <div className="hero-topline"><span className="location-marker"><span className="location-pip"/> KONDISI SAAT INI</span><button className="unit-switch" onClick={onToggleUnits} title="Ubah satuan suhu">°{units} <span>↔</span> °{units === 'C' ? 'F' : 'C'}</button></div>
      <div className="hero-main"><div className="hero-condition"><p className="hero-date">Waktu lokal model · {formatTime(current.time, true)}</p><h2>{weatherCodeInfo(current.weather_code).label}</h2><p className="hero-feels">Terasa seperti {temperature(current.apparent_temperature)}{tempUnit}</p><div className="hero-range"><span>Tertinggi <b>{temperature(daily.temperature_2m_max[0])}{tempUnit}</b></span><span>Terendah <b>{temperature(daily.temperature_2m_min[0])}{tempUnit}</b></span></div></div><div className="hero-temp-wrap"><div className="hero-icon-orbit"><WeatherIcon code={current.weather_code} size={68}/></div><div className="hero-temperature">{temperature(current.temperature_2m)}<sup>{tempUnit}</sup></div></div></div>
      <div className="hero-bottom"><div><span>Peluang hujan</span><strong>{daily.precipitation_probability_max[0] ?? 0}%</strong></div><div><span>Indeks UV</span><strong>{uv.toFixed(1)} <small>{uvLabel}</small></strong></div><div><span>Presipitasi saat ini</span><strong>{current.precipitation.toFixed(1)} <small>mm</small></strong></div></div>
      <div className="hero-decor decor-a"/><div className="hero-decor decor-b"/>
    </section>
    <div className="metric-grid">{metrics.map(({ label, value, note, icon: Icon }) => <article className="metric-card glass-card" key={label}><div className="metric-icon"><Icon size={18}/></div><div><span>{label}</span><strong>{value}</strong><small>{note}</small></div></article>)}</div>
  </>;
}
