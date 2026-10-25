import { Activity, ArrowUpRight, Wind } from 'lucide-react';
import type { AirResponse } from '../types/weather';
import { getAqiInfo } from '../utils/weather';

type Props = { air: AirResponse | null; loading: boolean; error?: string | null };
export function AirQualityCard({ air, loading, error }: Props) {
  if (loading && !air) return <div className="air-loading glass-card"><span className="skeleton-line"/><span className="skeleton-line short"/><span className="skeleton-line"/></div>;
  if (!air) return <section className="air-card glass-card"><div className="air-card-heading"><div className="section-icon"><Activity size={19}/></div><div><h3>Kualitas udara</h3><p>Data model kualitas udara</p></div></div><div className="air-empty">{error || 'Data kualitas udara belum tersedia. Coba perbarui data.'}</div></section>;
  const aqi = air.current.european_aqi;
  const info = getAqiInfo(aqi);
  const value = Math.min(100, Math.max(0, aqi));
  return <section className="air-card glass-card"><div className="air-card-heading"><div className="section-icon"><Activity size={19}/></div><div><h3>Kualitas udara</h3><p>European Air Quality Index</p></div><span className={`status-label level-${info.level}`}>{info.label}</span></div><div className="aq-main"><div className="aq-number"><strong>{Math.round(aqi)}</strong><span>EU AQI</span></div><div className="aq-gauge"><div className="aq-gauge-fill" style={{ width: `${value}%` }}/><div className="aq-scale"><span>Baik</span><span>Sedang</span><span>Buruk</span></div></div></div><p className="aq-advice">{info.advice}</p><div className="pollutant-row"><div><span>PM2.5</span><strong>{air.current.pm2_5.toFixed(1)} <small>µg/m³</small></strong></div><div><span>PM10</span><strong>{air.current.pm10.toFixed(1)} <small>µg/m³</small></strong></div></div><p className="data-disclaimer"><Wind size={13}/> Estimasi model area; bukan sensor langsung di alamat pengguna.</p></section>;
}
