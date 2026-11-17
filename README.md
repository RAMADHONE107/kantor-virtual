# Affiliate Studio 3D

Virtual office 3D interaktif untuk konten affiliate, diadaptasi dari basis [Gaurav2693/ai-office](https://github.com/Gaurav2693/ai-office) (React + Three.js).

## Isi scene
- **4 divisi, 16 pekerja**: Riset & Strategi (Raka, Bima, Andi, Faris), Konten & Produksi (Sinta, Lina, Maya, Kei), Desain & Brand (Dimas, Reza, Galih, Yoga), Sosmed & Penjualan (Naya, Tari, Rani, Vina)
- **16 meja kerja / 32 monitor** dengan 4 zona tim + fasilitas bersama
- **Lingkungan kantor**: lantai & karpet, dinding bentuk U, jendela, pencahayaan, rak, tanaman, water cooler, area meeting/whiteboard
- **Karakter**: duduk di meja dan berjalan di dalam kantor
- **Interaksi**: klik monitor untuk melihat detail tim/produk + CTA (link affiliate)
- **Kontrol**: drag untuk orbit, scroll untuk zoom, slider waktu, mode "LIGHTS OFF"

## Struktur penting
- `src/scene/OfficeScene.js` — scene Three.js (layout kantor, karakter, monitor, raycast klik produk)
- `src/data/products.js` — data 8 produk affiliate (nama, deskripsi, harga, CTA, `affiliateUrl`, tampilan layar)
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

## Kustomisasi cepat
1. **Produk & link affiliate**: edit `src/data/products.js` (terutama `affiliateUrl`, `name`, `description`, `price`, `cta`).
2. **Tim/role & tampilan layar**: sesuaikan `src/data/products.js` dan konstanta `TEAM` di `src/scene/OfficeScene.js` jika ingin ubah nama/peran/warna.
3. **Layout ruangan/meja/monitor**: ubah posisi di `desks` dan elemen environment pada `src/scene/OfficeScene.js`.
4. **Branding UI**: edit `src/components/Header.jsx`, `Legend.jsx`, `Ticker.jsx`, `InfoPanel.jsx`, dan `index.html`.

## Catatan
- Link affiliate saat ini masih placeholder (`https://example.com/...`) — ganti dengan link milik Anda.
- GitHub Pages hanya menyajikan UI statis; pipeline & LLM berjalan di backend lokal yang aktif.
- Riset produk berbasis penalaran model (bukan data real-time marketplace); validasi komisi/penjualan tetap perlu dicek manual.
- Lisensi mengikuti basis asli (MIT), lihat `LICENSE`.
