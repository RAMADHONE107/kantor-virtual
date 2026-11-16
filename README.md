# Affiliate Studio 3D

Virtual office 3D interaktif untuk konten affiliate, diadaptasi dari basis [Gaurav2693/ai-office](https://github.com/Gaurav2693/ai-office) (React + Three.js).

## Isi scene
- **1 tim, 4 orang**: Raka (Riset Produk), Sinta (Produksi Konten), Dimas (Desain & Visual), Naya (Growth & Analitik)
- **4 meja kerja**, masing-masing **2 komputer/monitor** (total **8 produk affiliate**)
- **Lingkungan kantor**: lantai & karpet, dinding bentuk U, jendela, pencahayaan, rak, tanaman, water cooler, area meeting/whiteboard
- **Karakter**: duduk di meja dan berjalan di dalam kantor
- **Interaksi**: klik monitor untuk membuka panel detail produk + CTA (link affiliate)
- **Kontrol**: drag untuk orbit, scroll untuk zoom, slider waktu, mode "LIGHTS OFF"

## Struktur penting
- `src/scene/OfficeScene.js` — scene Three.js (layout kantor, karakter, monitor, raycast klik produk)
- `src/data/products.js` — data 8 produk affiliate (nama, deskripsi, harga, CTA, `affiliateUrl`, tampilan layar)
- `src/App.jsx` — integrasi scene + UI overlay/panel produk
- `src/components/*` — Header, Legend, Ticker, HUD, InfoPanel

## Menjalankan lokal
```bash
cd ai-office-base
npm install
npm run dev
```
Buka URL yang ditampilkan Vite (biasanya `http://localhost:5173`).

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
- Proyek ini adalah visualisasi frontend (tanpa backend/API eksternal).
- Lisensi mengikuti basis asli (MIT), lihat `LICENSE`.
