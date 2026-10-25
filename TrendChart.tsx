import { useMemo, useState } from 'react';
import { Activity, CloudRain, Droplets, Thermometer } from 'lucide-react';
import type { AirResponse, WeatherResponse } from '../types/weather';
import { formatTime } from '../utils/weather';

type Metric = 'temperature' | 'humidity' | 'rain' | 'aqi';
type Range = '24h' | '7d' | '14d';
const metrics: { key: Metric; title: string; unit: string; icon: typeof Activity }[] = [
  { key: 'temperature', title: 'Suhu', unit: '°C', icon: Thermometer },
  { key: 'humidity', title: 'Kelembapan', unit: '%', icon: Droplets },
  { key: 'rain', title: 'Curah hujan', unit: 'mm', icon: CloudRain },
  { key: 'aqi', title: 'European AQI', unit: 'AQI', icon: Activity },
];
type Point = { time: string; value: number };

function makeSeries(metric: Metric, range: Range, weather: WeatherResponse, air: AirResponse | null): Point[] {
  if (metric === 'aqi') {
    const times = air?.hourly.time ?? [];
    const values = air?.hourly.european_aqi ?? [];
    const points = times.flatMap((time, i) => Number.isFinite(values[i]) ? [{ time, value: values[i] }] : []);
    return range === '24h' ? points.slice(-24) : range === '7d' ? dailyAggregate(points, false).slice(-7) : dailyAggregate(points, false).slice(-14);
  }
  const hourly = weather.hourly;
  const values = metric === 'temperature' ? hourly.temperature_2m : metric === 'humidity' ? hourly.relative_humidity_2m : hourly.precipitation;
  const points = hourly.time.flatMap((time, i) => Number.isFinite(values[i]) ? [{ time, value: values[i] }] : []);
  if (range === '24h') return points.slice(-24);
  return dailyAggregate(points, metric === 'rain').slice(-(range === '7d' ? 7 : 14));
}
function dailyAggregate(points: Point[], sum: boolean): Point[] {
  const groups = new Map<string, number[]>();
  points.forEach((p) => { const day = p.time.slice(0, 10); groups.set(day, [...(groups.get(day) ?? []), p.value]); });
  return [...groups.entries()].map(([day, values]) => ({ time: `${day}T12:00`, value: sum ? values.reduce((a, b) => a + b, 0) : values.reduce((a, b) => a + b, 0) / values.length }));
}

export function TrendChart({ weather, air }: { weather: WeatherResponse; air: AirResponse | null }) {
  const [metric, setMetric] = useState<Metric>('temperature');
  const [range, setRange] = useState<Range>('7d');
  const [hover, setHover] = useState<number | null>(null);
  const points = useMemo(() => makeSeries(metric, range, weather, air), [metric, range, weather, air]);
  const selectedMetric = metrics.find((item) => item.key === metric)!;
  const width = 720, height = 260, padX = 24, padY = 24;
  const values = points.map((point) => point.value);
  const low = values.length ? Math.min(...values) : 0;
  const high = values.length ? Math.max(...values) : 1;
  const padding = high === low ? 1 : (high - low) * 0.14;
  const min = low - padding;
  const max = high + padding;
  const coords = points.map((point, i) => ({ ...point, x: padX + (points.length <= 1 ? .5 : i / (points.length - 1)) * (width - padX * 2), y: height - padY - ((point.value - min) / (max - min)) * (height - padY * 2) }));
  const line = coords.map((point, i) => `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
  const area = coords.length ? `${line} L ${coords[coords.length - 1].x} ${height - padY} L ${coords[0].x} ${height - padY} Z` : '';
  return <section className="trend-panel glass-card"><div className="section-heading trend-header"><div><p className="eyebrow">HISTORICAL SIGNALS</p><h2>Jejak perubahan</h2><p className="muted-copy">Tinjau riwayat model dan prakiraan mendatang untuk lokasi terpilih.</p></div><div className="trend-current"><span>Variabel</span><strong>{selectedMetric.title}</strong></div></div><div className="trend-controls"><div className="metric-pills">{metrics.map(({ key, title, icon: Icon }) => <button className={metric === key ? 'active' : ''} key={key} onClick={() => { setMetric(key); setHover(null); }}><Icon size={15}/>{title}</button>)}</div><div className="range-switch">{(['24h', '7d', '14d'] as Range[]).map((value) => <button key={value} className={range === value ? 'active' : ''} onClick={() => { setRange(value); setHover(null); }}>{value === '24h' ? '24 jam' : value === '7d' ? '7 hari' : '14 hari'}</button>)}</div></div><div className="chart-legend"><span><i/> Seri waktu model</span><small>{points.length} titik data · satuan {selectedMetric.unit}</small></div><div className="chart-canvas-wrap"><svg className="trend-svg" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Grafik ${selectedMetric.title}`} preserveAspectRatio="none"><defs><linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7fded4" stopOpacity=".25"/><stop offset="100%" stopColor="#7fded4" stopOpacity="0"/></linearGradient></defs>{[0, 1, 2, 3].map((n) => { const y = padY + n * (height - padY * 2) / 3; const value = max - n * (max - min) / 3; return <g key={n}><line x1={padX} x2={width - padX} y1={y} y2={y} className="chart-grid-line"/><text x={padX - 4} y={y - 5} className="chart-axis-label" textAnchor="start">{value.toFixed(0)}</text></g>; })}{coords.length > 1 && <path d={area} fill="url(#chartFill)"/>}{coords.length > 1 && <path d={line} fill="none" stroke="#7fded4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>}{coords.map((point, index) => <circle key={`${point.time}-${index}`} cx={point.x} cy={point.y} r={hover === index ? 5 : 2.6} className={hover === index ? 'chart-point selected' : 'chart-point'} onMouseEnter={() => setHover(index)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(index)} tabIndex={0} aria-label={`${formatTime(point.time, true)}: ${point.value.toFixed(1)} ${selectedMetric.unit}`}/>)}{coords.length > 0 && [0, Math.floor((coords.length - 1) / 2), coords.length - 1].map((index) => <text key={index} x={coords[index].x} y={height - 4} className="chart-axis-label" textAnchor={index === 0 ? 'start' : index === coords.length - 1 ? 'end' : 'middle'}>{range === '24h' ? formatTime(coords[index].time) : new Date(`${coords[index].time.slice(0, 10)}T12:00:00`).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</text>)}</svg>{hover !== null && coords[hover] && <div className="chart-tooltip"><strong>{formatTime(coords[hover].time, true)}</strong><span>{coords[hover].value.toFixed(1)} {selectedMetric.unit}</span></div>}</div><div className="trend-footer"><p>{points.length ? `Rentang nilai: ${low.toFixed(1)}–${high.toFixed(1)} ${selectedMetric.unit}.` : 'Data belum tersedia untuk grafik.'}</p><small>Data historis berasal dari model API, bukan sensor pribadi.</small></div></section>;
}
