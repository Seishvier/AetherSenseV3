import { useCallback, useEffect, useState } from 'react';
import { getAirQuality, getWeather } from '../services/openMeteo';
import type { AirResponse, Location, Snapshot, WeatherResponse } from '../types/weather';
import { locationKey } from '../utils/weather';

const DEFAULT_LOCATION: Location = {
  name: 'Malang', admin1: 'Jawa Timur', country: 'Indonesia',
  latitude: -7.9819, longitude: 112.6265, timezone: 'Asia/Jakarta', country_code: 'ID',
};
const LOCATION_KEY = 'aethersense.v2.location';
const RECENTS_KEY = 'aethersense.v2.recents';
const SNAPSHOTS_KEY = 'aethersense.v2.snapshots';

function safeRead<T>(key: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; }
  catch { return fallback; }
}

export function useWeather() {
  const [location, setLocation] = useState<Location>(() => safeRead(LOCATION_KEY, DEFAULT_LOCATION));
  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [air, setAir] = useState<AirResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [airError, setAirError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [recentLocations, setRecentLocations] = useState<Location[]>(() => safeRead(RECENTS_KEY, []));
  const [snapshots, setSnapshots] = useState<Snapshot[]>(() => safeRead(SNAPSHOTS_KEY, []));

  const load = useCallback(async (nextLocation: Location, remember = true) => {
    setLoading(true);
    setError(null);
    setAirError(null);
    const controller = new AbortController();
    try {
      const [weatherResult, airResult] = await Promise.allSettled([
        getWeather(nextLocation, controller.signal),
        getAirQuality(nextLocation, controller.signal),
      ]);
      if (weatherResult.status === 'rejected') throw weatherResult.reason;
      const nextWeather = weatherResult.value;
      const nextAir = airResult.status === 'fulfilled' ? airResult.value : null;
      setWeather(nextWeather);
      setAir(nextAir);
      if (airResult.status === 'rejected') setAirError('Data cuaca tersedia, tetapi layanan kualitas udara belum merespons.');
      setLocation(nextLocation);
      localStorage.setItem(LOCATION_KEY, JSON.stringify(nextLocation));
      if (remember) {
        const deduped = [nextLocation, ...recentLocations.filter((x) => locationKey(x) !== locationKey(nextLocation))].slice(0, 5);
        setRecentLocations(deduped);
        localStorage.setItem(RECENTS_KEY, JSON.stringify(deduped));
      }
      setUpdatedAt(new Date());
      const snapshot: Snapshot = {
        id: `${locationKey(nextLocation)}-${nextWeather.current.time.slice(0, 13)}`,
        locationKey: locationKey(nextLocation), locationName: nextLocation.name,
        savedAt: new Date().toISOString(), temperature: nextWeather.current.temperature_2m,
        humidity: nextWeather.current.relative_humidity_2m, wind: nextWeather.current.wind_speed_10m,
        aqi: nextAir?.current.european_aqi ?? null,
        rain: nextWeather.daily.precipitation_sum[0] ?? 0,
      };
      const prior = safeRead<Snapshot[]>(SNAPSHOTS_KEY, []);
      const updated = [snapshot, ...prior.filter((x) => x.id !== snapshot.id)].slice(0, 60);
      setSnapshots(updated);
      localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(updated));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Data tidak dapat dimuat. Coba lagi.');
    } finally {
      setLoading(false);
    }
  }, [recentLocations]);

  useEffect(() => { void load(location, false); }, []); // Initial request only.

  const clearSnapshots = useCallback(() => {
    setSnapshots([]);
    localStorage.removeItem(SNAPSHOTS_KEY);
  }, []);

  return { location, weather, air, loading, error, airError, updatedAt, recentLocations, snapshots, load, clearSnapshots };
}
