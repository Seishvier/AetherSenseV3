import type { AirCurrent, Location, WeatherResponse } from '../types/weather';

export type WeatherCodeInfo = { label: string; icon: string; description: string };

export function weatherCodeInfo(code: number): WeatherCodeInfo {
  if (code === 0) return { label: 'Cerah', icon: 'sun', description: 'Langit relatif cerah. Perhatikan indeks UV saat matahari terik.' };
  if (code === 1) return { label: 'Cerah berawan', icon: 'cloud-sun', description: 'Matahari dan awan berbagi langit; kondisi dapat berubah.' };
  if (code === 2) return { label: 'Berawan sebagian', icon: 'cloud-sun', description: 'Tutupan awan berubah-ubah sepanjang hari.' };
  if (code === 3) return { label: 'Berawan', icon: 'cloud', description: 'Tutupan awan dominan. Periksa peluang hujan sebelum beraktivitas.' };
  if ([45, 48].includes(code)) return { label: 'Berkabut', icon: 'cloud-fog', description: 'Jarak pandang mungkin berkurang. Berhati-hatilah saat bepergian.' };
  if ([51, 53, 55, 56, 57].includes(code)) return { label: 'Gerimis', icon: 'cloud-drizzle', description: 'Gerimis mungkin terjadi. Lindungi perangkat dan barang yang mudah basah.' };
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { label: 'Hujan', icon: 'cloud-rain', description: 'Hujan dengan intensitas bervariasi dapat terjadi.' };
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { label: 'Salju', icon: 'snowflake', description: 'Model menunjukkan kondisi bersalju di lokasi ini.' };
  if ([95, 96, 99].includes(code)) return { label: 'Badai petir', icon: 'cloud-lightning', description: 'Waspadai badai petir dan tunda aktivitas terbuka jika petir terjadi.' };
  return { label: 'Kondisi bervariasi', icon: 'cloud', description: 'Periksa pembaruan prakiraan sebelum rencana penting.' };
}

export function getAqiInfo(value?: number | null) {
  if (value == null || !Number.isFinite(value)) return { label: 'Tidak tersedia', level: 'unknown', advice: 'Data kualitas udara belum tersedia untuk lokasi ini.' };
  if (value <= 20) return { label: 'Baik', level: 'good', advice: 'Indeks model berada pada kategori baik. Kondisi lokal dapat berbeda.' };
  if (value <= 40) return { label: 'Cukup', level: 'fair', advice: 'Kualitas udara cukup baik. Orang yang sensitif tetap perlu memperhatikan kenyamanan.' };
  if (value <= 60) return { label: 'Sedang', level: 'moderate', advice: 'Pertimbangkan mengurangi paparan yang tidak perlu jika kamu sensitif terhadap polusi.' };
  if (value <= 80) return { label: 'Buruk', level: 'poor', advice: 'Pertimbangkan mengurangi aktivitas berat di luar ruang dan periksa informasi lokal.' };
  if (value <= 100) return { label: 'Sangat buruk', level: 'very-poor', advice: 'Batasi paparan yang tidak perlu dan ikuti panduan otoritas kesehatan setempat.' };
  return { label: 'Ekstrem', level: 'extreme', advice: 'Indeks model sangat tinggi. Ikuti informasi resmi setempat sebelum beraktivitas.' };
}

export function directionLabel(degrees: number): string {
  const directions = ['Utara', 'Timur Laut', 'Timur', 'Tenggara', 'Selatan', 'Barat Daya', 'Barat', 'Barat Laut'];
  return directions[Math.round((degrees % 360) / 45) % 8] ?? '—';
}

export function formatTime(value?: string, withDate = false): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('id-ID', withDate
    ? { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }
    : { hour: '2-digit', minute: '2-digit' });
}

export function hourIndexForCurrent(weather: WeatherResponse): number {
  const key = weather.current.time.slice(0, 13);
  const index = weather.hourly.time.findIndex((time) => time.slice(0, 13) === key);
  return index < 0 ? 0 : index;
}

export function locationKey(location: Location): string {
  return `${location.latitude.toFixed(2)},${location.longitude.toFixed(2)}`;
}

export function cropConditionsSummary(weather: WeatherResponse, air: AirCurrent | null): string {
  const conditions: string[] = [];
  const current = weather.current;
  if (current.temperature_2m >= 32) conditions.push('suhu tinggi');
  if (current.relative_humidity_2m >= 85 && current.wind_speed_10m < 10) conditions.push('kelembapan tinggi dan angin lemah');
  if ((weather.daily.precipitation_probability_max[0] ?? 0) >= 70) conditions.push('peluang hujan tinggi');
  if ((air?.european_aqi ?? 0) > 60) conditions.push('kualitas udara perlu diperhatikan');
  return conditions.length ? conditions.join(', ') : 'belum ada faktor cuaca menonjol dari aturan sederhana';
}
