import type { AirCurrent, CropKey, RecommendationCategory, WeatherResponse } from '../types/weather';
import { getAqiInfo } from './weather';

export type Recommendation = { title: string; text: string; priority: 'Info' | 'Pantau' | 'Perhatian'; icon: string };

const crops: Record<CropKey, { name: string; temp: [number, number]; humidRisk: string; wet: string; dry: string; wind: number; extra: string }> = {
  rice: { name: 'Padi', temp: [22, 32], humidRisk: 'Periksa sirkulasi udara, kondisi daun, dan pengelolaan air; kelembapan saja tidak dapat memastikan penyakit.', wet: 'Periksa drainase serta tinggi air di petak, khususnya bila hujan lebat berlangsung.', dry: 'Tinjau ketersediaan air dan umur tanaman sebelum mengubah jadwal irigasi.', wind: 35, extra: 'Kebutuhan air berbeda menurut sistem sawah atau gogo dan fase pertumbuhan.' },
  highlandVeg: { name: 'Sayuran dataran tinggi', temp: [14, 25], humidRisk: 'Kelembapan tinggi dan angin lemah dapat memperlama basah daun; pantau gejala penyakit dan perbaiki sirkulasi udara bila memungkinkan.', wet: 'Periksa bedengan, drainase, serta risiko kerusakan mekanis pada tanaman muda.', dry: 'Periksa kelembapan media di zona akar; akar dan kebutuhan air berbeda antar komoditas.', wind: 30, extra: 'Kelompok ini mencakup komoditas berbeda; suhu optimal bergantung pada jenis sayuran dan varietas.' },
  apple: { name: 'Apel', temp: [16, 27], humidRisk: 'Amati daun dan buah serta sirkulasi tajuk. Cuaca bukan diagnosis penyakit; konfirmasi gejala dengan petugas pertanian bila perlu.', wet: 'Perhatikan drainase kebun, kondisi buah, dan akses lahan saat hujan tinggi.', dry: 'Pantau kelembapan tanah pada zona perakaran dan tahap pembentukan buah sebelum merencanakan irigasi.', wind: 35, extra: 'Kondisi sesuai untuk apel dipengaruhi ketinggian, varietas, dan siklus dormansi.' },
  coffee: { name: 'Kopi', temp: [18, 30], humidRisk: 'Kelembapan tinggi dengan angin lemah dapat mendukung lingkungan lembap di tajuk; pantau daun dan buah untuk gejala.', wet: 'Perhatikan drainase, erosi, dan akses panen. Hindari keputusan hanya berdasarkan peluang hujan.', dry: 'Periksa kelembapan tanah dan fase berbunga/pengisian buah; kebutuhan air berbeda menurut sistem naungan.', wind: 35, extra: 'Kopi Arabika dan Robusta memiliki kebutuhan agroklimat yang berbeda.' },
};

export function getRecommendations(category: RecommendationCategory, weather: WeatherResponse, air: AirCurrent | null, crop: CropKey): Recommendation[] {
  const c = weather.current;
  const d = weather.daily;
  const hourly = weather.hourly;
  const nowIndex = Math.max(0, hourly.time.findIndex((time) => time.slice(0, 13) === c.time.slice(0, 13)));
  const uv = hourly.uv_index[nowIndex] ?? d.uv_index_max[0] ?? 0;
  const chance = d.precipitation_probability_max[0] ?? 0;
  const rain = d.precipitation_sum[0] ?? 0;
  const aqi = air?.european_aqi ?? null;
  const list: Recommendation[] = [];
  const add = (title: string, text: string, priority: Recommendation['priority'], icon: string) => list.push({ title, text, priority, icon });

  if (category === 'health') {
    if (aqi !== null && aqi > 60) add('Kualitas udara perlu perhatian', `${getAqiInfo(aqi).advice} PM2.5 model ${air?.pm2_5.toFixed(1) ?? '—'} µg/m³.`, 'Perhatian', 'wind');
    else add('Perhatikan kondisi udara', aqi === null ? 'Data kualitas udara belum tersedia. Hindari menyimpulkan kualitas udara hanya dari tampilan langit.' : `European AQI ${Math.round(aqi)} (${getAqiInfo(aqi).label}). Nilai model dapat berbeda dari stasiun pengamatan lokal.`, 'Info', 'wind');
    if (uv >= 6) add('Paparan UV meningkat', `Indeks UV sekitar ${uv.toFixed(1)}. Cari tempat teduh dan gunakan perlindungan matahari yang sesuai.`, 'Pantau', 'sun');
    if (c.apparent_temperature >= 33) add('Perhatikan panas terasa', `Suhu terasa ${Math.round(c.apparent_temperature)}°C. Beristirahatlah di tempat sejuk dan minum air secara teratur selama aktivitas.`, 'Pantau', 'thermometer');
    if (c.relative_humidity_2m >= 85) add('Udara sangat lembap', 'Rencanakan aktivitas sesuai kenyamanan; kelembapan tinggi dapat membuat udara terasa pengap.', 'Info', 'droplets');
  }

  if (category === 'outdoor') {
    if (chance >= 60) add('Siapkan rencana hujan', `Peluang hujan harian ${Math.round(chance)}% dengan curah hujan prakiraan ${rain.toFixed(1)} mm. Periksa pembaruan sebelum berangkat.`, 'Pantau', 'cloud-rain');
    else add('Jendela aktivitas luar ruang', `Peluang hujan harian ${Math.round(chance)}%. Tetap tinjau prakiraan per jam karena hujan lokal dapat berbeda.`, 'Info', 'compass');
    if (uv >= 6) add('Atur paparan matahari', `UV ${uv.toFixed(1)} masuk kategori tinggi atau lebih. Pertimbangkan waktu dan perlindungan matahari.`, 'Pantau', 'sun');
    if (c.wind_speed_10m >= 25) add('Angin cukup kencang', `Angin ${Math.round(c.wind_speed_10m)} km/jam. Perhatikan kenyamanan dan kondisi perjalanan.`, 'Pantau', 'wind');
    if (weather.current.weather_code >= 95) add('Waspadai badai petir', 'Tunda kegiatan terbuka saat petir atau cuaca berbahaya terjadi.', 'Perhatian', 'cloud-lightning');
  }

  if (category === 'agriculture') {
    const profile = crops[crop];
    const outsideTemp = c.temperature_2m < profile.temp[0] || c.temperature_2m > profile.temp[1];
    if (outsideTemp) add(`Suhu perlu dipantau untuk ${profile.name}`, `Suhu ${c.temperature_2m.toFixed(1)}°C berada di luar rentang indikatif ${profile.temp[0]}–${profile.temp[1]}°C. Ini aturan umum, bukan ambang universal untuk semua varietas dan fase.`, 'Pantau', 'thermometer');
    else add(`Suhu berada dalam rentang indikatif ${profile.name}`, `Suhu ${c.temperature_2m.toFixed(1)}°C berada dalam rentang umum ${profile.temp[0]}–${profile.temp[1]}°C. Kesesuaian tetap bergantung pada varietas dan fase tumbuh.`, 'Info', 'sprout');
    if (chance >= 65) add('Tinjau drainase dan pekerjaan lahan', `Peluang hujan ${Math.round(chance)}%, curah hujan prakiraan ${rain.toFixed(1)} mm. ${profile.wet}`, 'Pantau', 'cloud-rain');
    else if (chance <= 25 && (d.et0_fao_evapotranspiration[0] ?? 0) >= 3) add('Periksa kebutuhan air', `Peluang hujan ${Math.round(chance)}% dan ET₀ ${d.et0_fao_evapotranspiration[0]?.toFixed(1) ?? '—'} mm. ${profile.dry}`, 'Pantau', 'droplets');
    else add('Pantau air berdasarkan lahan', `${profile.dry} Gunakan prakiraan sebagai salah satu masukan, bukan satu-satunya dasar.`, 'Info', 'droplets');
    if (c.relative_humidity_2m >= 85 && c.wind_speed_10m < 10) add('Lingkungan tajuk lembap', profile.humidRisk, 'Pantau', 'leaf');
    if (c.wind_speed_10m >= profile.wind) add('Perhatikan angin', `Kecepatan angin ${Math.round(c.wind_speed_10m)} km/jam. ${profile.name}: pantau tanaman muda dan hindari penyemprotan ketika kondisi angin tidak sesuai petunjuk produk.`, 'Pantau', 'wind');
    add('Konteks komoditas', profile.extra, 'Info', 'book-open');
  }

  return list.slice(0, 4);
}
