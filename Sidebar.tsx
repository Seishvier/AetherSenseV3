import { Activity, CloudSun, Leaf, Menu, Moon, Sun, Info, X } from 'lucide-react';

export type ViewKey = 'overview' | 'trends' | 'agriculture' | 'about';

const navigation: { id: ViewKey; label: string; icon: typeof CloudSun }[] = [
  { id: 'overview', label: 'Ringkasan', icon: CloudSun },
  { id: 'trends', label: 'Tren & Riwayat', icon: Activity },
  { id: 'agriculture', label: 'Asisten Tanaman', icon: Leaf },
  { id: 'about', label: 'Tentang & Tim', icon: Info },
];

type Props = { active: ViewKey; onChange: (view: ViewKey) => void; light: boolean; onToggleTheme: () => void; open: boolean; onClose: () => void };

export function Sidebar({ active, onChange, light, onToggleTheme, open, onClose }: Props) {
  return <>
    <button className={`mobile-scrim ${open ? 'visible' : ''}`} aria-label="Tutup navigasi" onClick={onClose} />
    <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
      <div className="brand"><div className="brand-symbol">A</div><div><strong>AetherSense</strong><small>ENVIRONMENTAL INTELLIGENCE</small></div><button className="sidebar-close icon-button" aria-label="Tutup menu" onClick={onClose}><X size={18}/></button></div>
      <p className="nav-kicker">WORKSPACE</p>
      <nav className="navigation" aria-label="Navigasi utama">
        {navigation.map(({ id, label, icon: Icon }) => <button key={id} className={`nav-item ${active === id ? 'selected' : ''}`} onClick={() => { onChange(id); onClose(); }}><Icon size={18}/><span>{label}</span>{active === id && <i />}</button>)}
      </nav>
      <div className="sidebar-bottom"><div className="api-status"><span className="online-dot"/><div><strong>Open-Meteo</strong><small>API data lingkungan</small></div></div><button className="theme-toggle" onClick={onToggleTheme}>{light ? <Moon size={17}/> : <Sun size={17}/>}<span>{light ? 'Mode gelap' : 'Mode terang'}</span></button><div className="sidebar-footer">AetherSense v2.0 <span>·</span> Modern Stack</div></div>
    </aside>
  </>;
}

export function MenuButton({ onClick }: { onClick: () => void }) {
  return <button className="menu-button icon-button" aria-label="Buka navigasi" onClick={onClick}><Menu size={20}/></button>;
}
