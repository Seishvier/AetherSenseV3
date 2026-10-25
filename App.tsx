import { useMemo, useState } from 'react';
import { Bell, CloudSun, LoaderCircle, RefreshCw } from 'lucide-react';
import { Sidebar, MenuButton, type ViewKey } from './components/Sidebar';
import { SearchBar } from './components/SearchBar';
import { CurrentWeather } from './components/CurrentWeather';
import { HourlyForecast } from './components/HourlyForecast';
import { WeeklyForecast } from './components/WeeklyForecast';
import { AirQualityCard } from './components/AirQualityCard';
import { Recommendations } from './components/Recommendations';
import { TrendChart } from './components/TrendChart';
import { AboutTeam } from './components/AboutTeam';
import { useWeather } from './hooks/useWeather';

const viewLabels: Record<ViewKey, { eyebrow: string; title: string; subtitle: string }> = {
  overview: { eyebrow: 'ENVIRONMENTAL OVERVIEW', title: 'Cuaca, dalam konteks.', subtitle: 'Baca kondisi langit hari ini dan pahami artinya bagi aktivitasmu.' },
  trends: { eyebrow: 'HISTORICAL SIGNALS', title: 'Jejak perubahan.', subtitle: 'Bandingkan pola cuaca dan kualitas udara sepanjang waktu.' },
  agriculture: { eyebrow: 'AGRICULTURAL INTELLIGENCE', title: 'Insight untuk lahan.', subtitle: 'Saran awal yang mempertimbangkan cuaca dan profil komoditas lokal.' },
  about: { eyebrow: 'ABOUT AETHERSENSE', title: 'Teknologi, dengan tujuan.', subtitle: 'Open data, UI yang tenang, dan insight yang lebih kontekstual.' },
};

export default function App() {
  const { location, weather, air, loading, error, airError, updatedAt, recentLocations, snapshots, load, clearSnapshots } = useWeather();
  const [activeView, setActiveView] = useState<ViewKey>('overview');
  const [units, setUnits] = useState<'C' | 'F'>('C');
  const [light, setLight] = useState(() => localStorage.getItem('aethersense.v2.theme') === 'light');
  const [menuOpen, setMenuOpen] = useState(false);
  const page = viewLabels[activeView];
  const historyForLocation = useMemo(() => snapshots.filter((item) => item.locationKey === `${location.latitude.toFixed(2)},${location.longitude.toFixed(2)}`).slice(0, 8), [snapshots, location]);

  function toggleTheme() {
    const next = !light;
    setLight(next);
    localStorage.setItem('aethersense.v2.theme', next ? 'light' : 'dark');
  }

  function geolocate() {
    if (!navigator.geolocation) { window.alert('Browser ini tidak mendukung lokasi perangkat.'); return; }
    navigator.geolocation.getCurrentPosition((position) => {
      void load({ name: 'Lokasi saya', admin1: 'Koordinat perangkat', country: '', latitude: position.coords.latitude, longitude: position.coords.longitude, timezone: 'auto' }, false);
    }, (geoError) => {
      window.alert(geoError.code === 1 ? 'Izin lokasi ditolak. Kamu tetap dapat mencari kota secara manual.' : 'Lokasi tidak tersedia. Coba lagi atau cari kota secara manual.');
    }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 });
  }

  return <div className={`app-shell ${light ? 'light-mode' : ''}`} data-weather={weather ? weather.current.weather_code : 'default'}>
    <Sidebar active={activeView} onChange={setActiveView} light={light} onToggleTheme={toggleTheme} open={menuOpen} onClose={() => setMenuOpen(false)}/>
    <main className="main-content">
      <header className="topbar"><MenuButton onClick={() => setMenuOpen(true)}/><SearchBar recent={recentLocations} selected={location} onSelect={(nextLocation) => void load(nextLocation)} loading={loading} onGeolocate={geolocate}/><div className="topbar-right"><button className="icon-button refresh-button" title="Perbarui data" aria-label="Perbarui data" disabled={loading} onClick={() => void load(location, false)}>{loading ? <LoaderCircle className="spin" size={18}/> : <RefreshCw size={17}/>}</button><div className="profile-chip"><span className="profile-avatar">A</span><span><strong>AetherSense</strong><small>Environmental AI</small></span></div></div></header>
      {error && <div className="error-banner" role="alert"><span>{error}</span><button onClick={() => void load(location, false)}>Coba lagi</button></div>}
      {airError && !error && <div className="soft-banner" role="status">{airError}</div>}
      <div className="page-heading"><div><p className="eyebrow">{page.eyebrow}</p><h1>{page.title}</h1><p className="page-subtitle">{page.subtitle}</p></div><div className="header-meta"><div className="sync-indicator"><span className={`sync-dot ${loading ? 'syncing' : ''}`}/><span>{loading ? 'Memuat data…' : updatedAt ? `Diperbarui ${updatedAt.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}` : 'Menunggu data'}</span></div><span className="meta-location"><CloudSun size={14}/>{location.name}</span></div></div>
      {activeView === 'overview' && <>{weather ? <><div className="overview-grid"><div className="overview-main"><CurrentWeather weather={weather} units={units} onToggleUnits={() => setUnits(units === 'C' ? 'F' : 'C')}/><section className="section-block"><div className="section-heading"><div><p className="eyebrow">THE NEXT HOURS</p><h2>Prakiraan per jam</h2></div><span className="section-note">8 titik berikutnya</span></div><HourlyForecast weather={weather} units={units}/></section><section className="section-block"><div className="section-heading"><div><p className="eyebrow">CONTEXTUAL INTELLIGENCE</p><h2>Rekomendasi untuk hari ini</h2></div><span className="section-note"><Activity size={13}/> Disesuaikan dengan cuaca</span></div><Recommendations weather={weather} air={air?.current ?? null}/></section></div><div className="overview-side"><AirQualityCard air={air} loading={loading} error={airError}/><section className="weekly-card glass-card"><div className="section-heading"><div><p className="eyebrow">SEVEN-DAY OUTLOOK</p><h2>Prakiraan mingguan</h2></div><span className="weekly-mark"><CloudSun size={18}/></span></div><WeeklyForecast weather={weather} units={units}/><div className="weekly-footnote">Prakiraan model dapat berubah. Tinjau pembaruan sebelum mengambil keputusan penting.</div></section><section className="mini-note glass-card"><div className="mini-note-icon"><Bell size={17}/></div><div><strong>Catatan lingkungan</strong><p>Gunakan data sebagai gambaran area. Kondisi lokal dapat berbeda dari keluaran model.</p></div></section></div></div><section className="section-block"><div className="section-heading"><div><p className="eyebrow">HISTORICAL SIGNALS</p><h2>Tren dan riwayat</h2></div><button className="text-link" onClick={() => setActiveView('trends')}>Lihat semua tren ↗</button></div><TrendChart weather={weather} air={air}/><HistoryTable items={historyForLocation} onClear={clearSnapshots}/></section></> : <LoadingPanel loading={loading}/>}</>}
      {activeView === 'trends' && (weather ? <><TrendChart weather={weather} air={air}/><HistoryTable items={historyForLocation} onClear={clearSnapshots}/></> : <LoadingPanel loading={loading}/>) }
      {activeView === 'agriculture' && (weather ? <><div className="agriculture-intro glass-card"><div className="crop-illustration"><span>♧</span><i/><b/></div><div><p className="eyebrow">FIELD INTELLIGENCE</p><h2>Cuaca adalah salah satu bagian dari cerita tanaman.</h2><p className="muted-copy">Pilih komoditas untuk melihat rekomendasi awal berdasarkan suhu, kelembapan, angin, hujan, dan ET₀. Sistem ini belum mengetahui kelembapan tanah secara langsung.</p></div></div><Recommendations weather={weather} air={air?.current ?? null}/><div className="agri-disclaimer">Rekomendasi bersifat edukatif, bukan diagnosis penyakit atau instruksi agronomi. Periksa kondisi lahan, fase tanaman, dan panduan penyuluh setempat.</div></> : <LoadingPanel loading={loading}/>) }
      {activeView === 'about' && <AboutTeam/>}
      <footer className="app-footer"><span>© 2026 AetherSense</span><span>Built with open data <i>·</i> Made for meaningful decisions</span><a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Data by Open-Meteo ↗</a></footer>
    </main>
  </div>;
}

function LoadingPanel({ loading }: { loading: boolean }) {
  return <div className="loading-panel glass-card"><div className="loading-orbit"><CloudSun size={29}/></div><h2>{loading ? 'Mengumpulkan data lingkungan…' : 'Data belum tersedia'}</h2><p>{loading ? 'Menghubungkan pencarian lokasi, cuaca, dan kualitas udara.' : 'Coba perbarui data atau pilih lokasi lain.'}</p></div>;
}

function HistoryTable({ items, onClear }: { items: import('./types/weather').Snapshot[]; onClear: () => void }) {
  return <section className="history-panel glass-card"><div className="section-heading"><div><p className="eyebrow">LOCAL SNAPSHOTS</p><h2>Riwayat di perangkat ini</h2><p className="muted-copy">Cuplikan disimpan di browser saat data berhasil dimuat.</p></div><button className="text-link" onClick={onClear}>Hapus riwayat</button></div>{items.length ? <div className="history-table">{items.map((item) => <div className="history-row" key={item.id}><span>{new Date(item.savedAt).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span><strong>{item.locationName}</strong><span>{item.temperature.toFixed(1)}°C</span><span>RH {item.humidity}%</span><span>AQI {item.aqi == null ? '—' : Math.round(item.aqi)}</span></div>)}</div> : <div className="empty-history">Belum ada cuplikan untuk lokasi ini.</div>}<p className="history-disclaimer">Riwayat lokal bukan sensor berkelanjutan; hanya menyimpan cuplikan ketika aplikasi berhasil memuat data.</p></section>;
}

