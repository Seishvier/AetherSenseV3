import { useMemo, useState } from 'react';
import { Activity, Leaf, MapPinned, ShieldCheck, Sun, Wind } from 'lucide-react';
import type { AirCurrent, CropKey, RecommendationCategory, WeatherResponse } from '../types/weather';
import { getRecommendations } from '../utils/recommendations';

const categories: { key: RecommendationCategory; label: string; icon: typeof ShieldCheck; caption: string }[] = [
  { key: 'health', label: 'Kesehatan', icon: ShieldCheck, caption: 'Paparan udara, panas, dan UV' },
  { key: 'agriculture', label: 'Pertanian', icon: Leaf, caption: 'Cuaca untuk komoditas lokal' },
  { key: 'outdoor', label: 'Aktivitas luar ruang', icon: Sun, caption: 'Waktu dan kondisi perjalanan' },
];
const crops: { key: CropKey; label: string }[] = [
  { key: 'rice', label: 'Padi' }, { key: 'highlandVeg', label: 'Sayuran dataran tinggi' }, { key: 'apple', label: 'Apel' }, { key: 'coffee', label: 'Kopi' },
];

export function Recommendations({ weather, air }: { weather: WeatherResponse; air: AirCurrent | null }) {
  const [category, setCategory] = useState<RecommendationCategory>('health');
  const [crop, setCrop] = useState<CropKey>(() => (localStorage.getItem('aethersense.v2.crop') as CropKey) || 'rice');
  const recommendations = useMemo(() => getRecommendations(category, weather, air, crop), [category, weather, air, crop]);
  const profile = crops.find((item) => item.key === crop)?.label ?? 'Padi';
  return <section className="recommendations-panel glass-card"><div className="section-heading"><div><p className="eyebrow">CONTEXTUAL INTELLIGENCE</p><h2>Rekomendasi yang bermakna</h2><p className="muted-copy">Saran berbasis kondisi model terkini, bukan diagnosis medis atau agronomi.</p></div><div className="recommendation-spark"><Activity size={19}/></div></div><div className="recommendation-tabs">{categories.map(({ key, label, icon: Icon, caption }) => <button key={key} className={`recommendation-tab ${category === key ? 'active' : ''}`} onClick={() => setCategory(key)} title={caption}><Icon size={17}/><span>{label}</span></button>)}</div>{category === 'agriculture' && <div className="crop-picker"><label htmlFor="crop-profile">Komoditas</label><select id="crop-profile" value={crop} onChange={(e) => { const next = e.target.value as CropKey; setCrop(next); localStorage.setItem('aethersense.v2.crop', next); }}>{crops.map((item) => <option value={item.key} key={item.key}>{item.label}</option>)}</select><span>Profil saat ini: {profile}</span></div>}<div className="recommendation-list">{recommendations.map((item, index) => <article className="recommendation-item" key={`${category}-${index}`}><div className={`recommendation-icon priority-${item.priority.toLowerCase()}`}>{item.icon === 'sun' ? <Sun size={18}/> : item.icon === 'wind' ? <Wind size={18}/> : item.icon === 'leaf' || item.icon === 'sprout' ? <Leaf size={18}/> : item.icon === 'compass' ? <MapPinned size={18}/> : item.icon === 'thermometer' ? <Activity size={18}/> : <Activity size={18}/>}</div><div className="recommendation-body"><div className="recommendation-titleline"><h3>{item.title}</h3><span className={`priority-tag priority-${item.priority.toLowerCase()}`}>{item.priority}</span></div><p>{item.text}</p></div></article>)}</div><p className="recommendation-footnote">Informasi ini bersifat edukatif. Kondisi aktual, fase pertumbuhan, jenis tanah, dan panduan tenaga ahli tetap perlu dipertimbangkan.</p></section>;
}
