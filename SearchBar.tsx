import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Check, Clock3, LoaderCircle, MapPin, MapPinned, Search, X } from 'lucide-react';
import { searchLocations, locationLabel } from '../services/openMeteo';
import type { Location } from '../types/weather';

type Props = { recent: Location[]; selected: Location; onSelect: (location: Location) => void; loading: boolean; onGeolocate: () => void };

export function SearchBar({ recent, selected, onSelect, loading, onGeolocate }: Props) {
  const [query, setQuery] = useState(selected.name);
  const [results, setResults] = useState<Location[]>([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const controller = useRef<AbortController | null>(null);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => setQuery(selected.name), [selected.name]);
  useEffect(() => {
    const onPointer = (event: PointerEvent) => { if (!box.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener('pointerdown', onPointer);
    return () => document.removeEventListener('pointerdown', onPointer);
  }, []);

  async function submit(event?: FormEvent) {
    event?.preventDefault();
    const value = query.trim();
    if (!value) { setMessage('Masukkan nama kota terlebih dahulu.'); setOpen(true); return; }
    controller.current?.abort();
    controller.current = new AbortController();
    setSearching(true); setMessage('Mencari kota…'); setOpen(true);
    try {
      const found = await searchLocations(value, controller.current.signal);
      setResults(found);
      setMessage(found.length ? '' : 'Kota tidak ditemukan. Coba nama lain.');
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') setMessage(err.message);
    } finally { setSearching(false); }
  }

  function choose(location: Location) {
    onSelect(location); setQuery(location.name); setOpen(false); setMessage(''); setResults([]);
  }

  return <div className="search-wrap" ref={box}>
    <form className="search-form" onSubmit={submit} role="search">
      <Search size={18} className="search-icon" />
      <input value={query} onChange={(event) => setQuery(event.target.value)} onFocus={() => setOpen(true)} placeholder="Cari kota di seluruh dunia…" aria-label="Cari kota" aria-expanded={open} aria-controls="location-results" />
      {query && <button type="button" className="search-clear" aria-label="Hapus pencarian" onClick={() => { setQuery(''); setResults([]); setMessage(''); setOpen(true); }}><X size={15}/></button>}
      <button type="button" className="locate-button" onClick={onGeolocate} title="Gunakan lokasi perangkat" aria-label="Gunakan lokasi perangkat"><MapPinned size={17}/></button>
      <button className="search-submit" type="submit" disabled={searching}>{searching ? <LoaderCircle size={15} className="spin"/> : <Search size={15}/>}<span>Cari</span></button>
    </form>
    {open && <div className="search-dropdown" id="location-results" role="listbox">
      {searching && <div className="dropdown-message"><LoaderCircle size={16} className="spin"/> Mencari lokasi…</div>}
      {!searching && message && <div className="dropdown-message">{message}</div>}
      {!searching && results.map((place) => <button role="option" aria-selected={locationLabel(place) === locationLabel(selected)} className="location-option" key={`${place.latitude}-${place.longitude}`} onClick={() => choose(place)}><MapPin size={16}/><span><strong>{place.name}</strong><small>{[place.admin1, place.country].filter(Boolean).join(', ')}</small></span>{locationLabel(place) === locationLabel(selected) && <Check size={15}/>}</button>)}
      {!searching && !results.length && !message && recent.length > 0 && <><div className="dropdown-label"><Clock3 size={13}/> PENCARIAN TERAKHIR</div>{recent.map((place) => <button className="location-option" key={`${place.latitude}-${place.longitude}`} onClick={() => choose(place)}><Clock3 size={15}/><span><strong>{place.name}</strong><small>{[place.admin1, place.country].filter(Boolean).join(', ')}</small></span></button>)}</>}
    </div>}
  </div>;
}
