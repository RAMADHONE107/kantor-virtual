# Affiliate Studio 3D

Virtual office 3D interaktif untuk konten affiliate, diadaptasi dari basis [Gaurav2693/ai-office](https://github.com/Gaurav2693/ai-office) (React + Three.js).

## Isi scene
- **4 divisi, 16 pekerja**: Riset & Strategi (Raka, Bima, Andi, Faris), Konten & Produksi (Sinta, Lina, Maya, Kei), Desain & Brand (Dimas, Reza, Galih, Yoga), Sosmed & Penjualan (Naya, Tari, Rani, Vina)
- **16 meja kerja / 32 monitor** dengan 4 zona tim + fasilitas bersama
- **Lingkungan kantor**: lantai & karpet, dinding bentuk U, jendela, pencahayaan, rak, tanaman, water cooler, area meeting/whiteboard
- **Karakter**: duduk di meja dan berjalan di dalam kantor
- **Interaksi**: klik monitor untuk melihat detail produk nyata + CTA (URL sumber Tokopedia)
- **Kontrol**: drag untuk orbit, scroll untuk zoom, slider waktu, mode "LIGHTS OFF"

## Struktur penting
- `src/scene/OfficeScene.js` — scene Three.js (layout kantor, karakter, monitor, raycast klik produk)
- `src/data/liveSnapshot.json` — snapshot data nyata ber-timestamp (produk, tren, pipeline, log) untuk fallback GitHub Pages
- `server/src/marketData.js` — adapter data publik: Tokopedia (produk/harga/terjual) + Google Trends RSS (tren)
- `src/App.jsx` — integrasi scene + UI overlay/panel produk
- `src/components/*` — Header, Legend, Ticker, HUD, InfoPanel

## Menjalankan lokal
```bash
# 1) Gateway Hermes (otak agen, OpenAI-compatible di port 8643)
bash server/scripts/start-hermes.sh

# 2) Backend agen + pipeline
cd server && npm install && npm run dev

# 3) Frontend
cd .. && npm install && npm run dev
```
Buka URL yang ditampilkan Vite (biasanya `http://localhost:5173/kantor-virtual/`).
Pastikan `server/.env` berisi `LLM_PROVIDER=hermes`, `HERMES_BASE_URL=http://127.0.0.1:8643/v1/chat/completions`,
`HERMES_API_KEY` sesuai `API_SERVER_KEY` gateway, dan `HERMES_MODEL=hermes-agent`.

## Autopilot & otak agen
- Menu **Agen & Draft** menjalankan pipeline otomatis lintas divisi pada niche **Kecantikan & Perawatan Kulit**.
- Tim mencari sendiri produk/topik viral dengan potensi komisi & penjualan tinggi; tiap divisi dipimpin **manager** yang mengambil keputusan dan meneruskannya ke divisi berikutnya.
- Satu titik keputusan user: **Layak Upload?** → paket otomatis diexport ke folder **Download** (`.md` + `.json`). Tidak ada pembuatan file video / upload TikTok-Shopee otomatis.
- Model Hermes default memakai endpoint gratis Pollinations. Untuk memakai **Nous Portal (300+ model)** atau OpenRouter, login/status provider di `HERMES_APP_HOME`, lalu ubah `model` di `server/config/hermes.config.yaml` (atau jalankan `hermes model` di dalam runtime Hermes) dan sesuaikan `HERMES_MODEL`.

## Build produksi
```bash
npm run build
npm run preview
```
Output ada di folder `dist/`.

## Data nyata (bukan dummy)
- Dashboard mengambil metrik, progres per tahap, dan aktivitas dari backend (`server/src/dashboard.js`) yang membaca `server/data/db.json`.
- Produk & harga & jumlah terjual diambil dari **Tokopedia public web data** (tanpa login/API key) via `server/src/marketData.js`.
- Tren pencarian diambil dari **Google Trends RSS Indonesia**.
- Endpoint: `GET /api/dashboard`, `GET /api/market`, `POST /api/market/refresh`.
- Pipeline menyuntikkan snapshot pasar nyata ke prompt riset (`server/src/pipeline.js`).

Perbarui snapshot data nyata yang dibundling untuk GitHub Pages (backend tidak tersedia di Pages):
```bash
cd server && npm run snapshot   # menulis src/data/liveSnapshot.json (ber-timestamp)
cd .. && npm run build
```
Aplikasi memakai data live saat backend berjalan, dan otomatis memakai snapshot nyata (ditandai "Mode snapshot") saat backend tidak terhubung. Tidak ada angka dummy.

## Kustomisasi cepat
1. **Sumber produk**: `server/src/marketData.js` (keyword & parser). Link produk memakai URL asli Tokopedia dari hasil riset.
2. **Tim/role & tampilan layar**: konstanta `TEAM` di `src/scene/OfficeScene.js`.
3. **Layout ruangan/meja/monitor**: ubah posisi di `desks` dan elemen environment pada `src/scene/OfficeScene.js`.
4. **Branding UI**: edit `src/components/Header.jsx`, `Legend.jsx`, `Ticker.jsx`, `InfoPanel.jsx`, dan `index.html`.

## Catatan
- **Komisi affiliate tidak ditampilkan** karena belum ada kredensial affiliate resmi (Shopee/TikTok/network). Angka komisi tidak dikarang.
- Post sosial, leads, dan transaksi belum terhubung ke API platform mana pun — sengaja dikosongkan, bukan diisi data simulasi.
- GitHub Pages menyajikan UI statis + snapshot data nyata; pipeline & LLM berjalan di backend lokal yang aktif.
- Lisensi mengikuti basis asli (MIT), lihat `LICENSE`.
