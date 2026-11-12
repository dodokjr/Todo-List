# TodoFlow (Next.js + TypeScript + Tailwind + react-icons)

## Jalankan
1. `npm install`
2. `cp .env.example .env` lalu isi (default `DB_DRIVER=firestore`).
3. Pilih database lewat `DB_DRIVER`:
   - **firestore** (Firebase, edisi Standard): lihat bagian Firebase di bawah.
   - **sheets** (Google Spreadsheet): buat service account, share spreadsheet ke emailnya (Editor), isi 3 variabel GOOGLE_*.
     Buat 4 tab dengan header baris 1 (kolom A dst):
     - users: id, name, email, passwordHash, resetToken, resetExp
     - workspaces: id, code, name, type, ownerId
     - members: workspaceId, userId, role
     - tasks: id, workspaceId, title, status, priority, due, createdBy, createdAt, assignee, start, checklist, timeSec, timerStart, repeat, reminded
4. `npm run dev` -> http://localhost:3000

## Cara kerja
- Daftar otomatis membuat "Folder Pribadi". Buat tim baru lewat sidebar; ID tim (8 karakter) dibagikan, anggota gabung lewat kolom "ID tim".
- Role: **Admin** (pembuat tim) bisa ganti nama tim, hapus tim, ubah role, dan keluarkan anggota. **Anggota** bisa menambah, mengubah, memindah, dan menghapus task apa pun. Selalu ada minimal satu admin.
- Real-time memakai Server-Sent Events (`/api/workspaces/[id]/events`): perubahan muncul langsung di semua perangkat. Berjalan di server Node biasa (`npm run start`, VPS, Railway, Render). Di Vercel serverless, event antar-instance tidak dijamin; polling cadangan 30 detik tetap jalan.
- Dark mode: tombol bulan/matahari di semua halaman, tersimpan di browser.
- Lupa password: sistem mengirim **token 8 karakter** (berlaku 15 menit) ke email. Masukkan email, token, dan password baru di halaman Reset password (link di email mengisi otomatis). Tanpa SMTP, token tampil di layar (mode dev).

## Fitur tugas
- Penanggung jawab (khusus tim), pencarian, filter "Tugas saya", dan tenggat terlambat ditandai merah.

## Tampilan & alat kerja
- **Papan / Timeline / Kalender**: ganti lewat tombol di atas. Timeline (4 minggu) menampilkan bar dari tanggal Mulai ke Tenggat; Kalender menampilkan tugas per tanggal tenggat.
- **Timer waktu**: tombol play/stop di tiap tugas, dihitung di server sehingga sama untuk seluruh anggota tim dan tetap jalan walau halaman ditutup.
- **Checklist** (satu tingkat) di tiap tugas dengan progres.
- **Batas percobaan**: login, lupa password, dan reset dibatasi 10 kali per 15 menit (disimpan di memori server).
- Untuk Sheets, tambahkan kolom `start`, `checklist`, `timeSec`, `timerStart` di tab tasks.

## Firebase (Firestore)
Set `DB_DRIVER=firestore`, buat project Firebase, aktifkan Firestore (mode production), lalu isi 3 variabel FIREBASE_* dari service account. Koleksi dibuat otomatis; tidak perlu skema atau index. Semua akses lewat server (Admin SDK), jadi Security Rules bisa dibiarkan menolak semua akses klien.

## Fitur tambahan
- **Pengingat tenggat**: `GET /api/cron/reminders` mengirim email untuk tugas yang jatuh tempo hari ini/besok/terlambat (ke penanggung jawab, atau pembuat bila belum ditugaskan), satu kali per tenggat. Isi `CRON_SECRET` dan `SMTP_*`. Di Vercel, `vercel.json` sudah menjadwalkan tiap hari 08.00 WIB. Di hosting lain, panggil URL itu dari cron (mis. cron-job.org) dengan header `Authorization: Bearer <CRON_SECRET>`.
- **Komentar & riwayat aktivitas**: ikon komentar di tiap kartu.
- **Tugas berulang** (harian/mingguan/bulanan): saat tugas diselesaikan, salinan berikutnya dibuat otomatis dengan checklist ter-reset. **Template checklist** disimpan per folder/tim.
- **Laporan waktu**: tab Laporan (per anggota, tugas, hari) dan ekspor CSV. Entri tercatat tiap timer dihentikan.
- Google Sheets: tambahkan kolom `repeat`, `reminded` di tab tasks, dan buat tab baru **events** dengan header: id, workspaceId, taskId, userId, type, text, data, createdAt.
# Todo-List
