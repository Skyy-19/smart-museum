# Smart Museum Bengkulu Final

Website museum digital Bengkulu dengan UI/UX modern, QR scanner, katalog koleksi, detail koleksi, bookmark, quiz, mini game, login, dan admin panel.

## Cara Menjalankan

```bash
npm install
copy .env.example .env.local
npm run dev
```

Buka:

```bash
http://localhost:3000
```

## Fitur

- Homepage modern dengan background museum
- Hero slider koleksi
- Search realtime
- Filter kategori
- Sort koleksi
- Detail koleksi profesional
- QR Code otomatis di halaman detail
- QR scanner kamera
- Bookmark lokal
- Mini quiz per koleksi
- Game tebak koleksi
- Admin dashboard
- Form tambah koleksi
- Siap integrasi Supabase

## Supabase

1. Buat project Supabase
2. Buka SQL Editor
3. Jalankan `database/schema.sql`
4. Isi `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=isi_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=isi_anon_key
```

Tanpa Supabase, website tetap jalan memakai data demo dari `src/lib/demo-data.js`.
