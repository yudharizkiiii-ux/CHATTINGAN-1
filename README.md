# MQTT WhatsApp Web Clone (React + Vite & HTML Standalone)

A premium, glassmorphic dark-themed real-time chat application inspired by WhatsApp Web, built using **MQTT over WebSockets** for instant messaging, presence tracking, and typing indicators, integrated with **WebRTC P2P** for latency-free voice and video calling.

---

## 🚀 Fitur Utama

1. **Pesan Instan Real-Time (MQTT)**: Menggunakan protokol MQTT lewat koneksi WebSocket secure (`wss://`) untuk pengiriman pesan sub-detik.
2. **Panggilan Suara & Video (WebRTC)**: Komunikasi audio/video langsung antar browser (*Peer-to-Peer*) dengan memanfaatkan broker MQTT sebagai saluran sinyal (*signaling channel*) untuk bertukar SDP dan ICE candidates.
3. **Voice Notes (Rekaman Suara Asli)**: Rekam audio langsung dari browser menggunakan MediaRecorder API, dikirimkan dalam format kompresi Base64 WebM (<250KB).
4. **Kompresi Gambar 10MB**: Kirim foto hingga ukuran 10MB tanpa membebani limit broker MQTT, berkat sistem kompresi sisi klien menggunakan Canvas API (<150KB).
5. **Indikator Ketikan & Kehadiran (Presence)**: Pemantauan pengguna online aktif di grup secara dinamis serta status mengetik pengguna lain.
6. **Desain Glassmorphism Premium**: Antarmuka bertema gelap modern dengan animasi transisi yang mulus, efek blur kaca, dan layout responsif.

---

## 🛠️ Langkah-Langkah Pembuatan dari Awal (*Step-by-Step*)

### Langkah 1: Inisialisasi Proyek Vite + React
Kami menginisialisasi kerangka aplikasi React yang cepat menggunakan Vite:
```bash
# Membuat struktur project React
npm create vite@latest CHATTING -- --template react
cd CHATTING

# Menginstal dependensi awal
npm install
```

### Langkah 2: Mengonfigurasi Tailwind CSS untuk Desain WhatsApp Gelap
Kami menginstal Tailwind CSS dan membuat konfigurasi desain warna khusus (seperti hijau WhatsApp `#005c4b`, latar belakang `#0b141a`, dan aksen teal `#00a884`):
1. **Instalasi Tailwind**:
   ```bash
   npm install -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   ```
2. **Konfigurasi `tailwind.config.js`**:
   Kami memperluas tema warna bawaan dengan palet warna WhatsApp Web gelap (`chat-bg`, `chat-sidebar`, `chat-header`, `chat-incoming`, `chat-outgoing`, `chat-accent`).
3. **Mengisi `src/index.css`**:
   Menuliskan direktif dasar `@tailwind` bersama dengan animasi khusus (`animate-slideup`, `typingPulse`) dan pengaturan scrollbar kustom.

### Langkah 3: Menginstal Dependensi Utama
Kami menambahkan pustaka eksternal yang esensial untuk fungsionalitas aplikasi:
* **`mqtt`**: Pustaka MQTT klien JavaScript untuk berkomunikasi dengan broker.
* **`lucide-react`**: Kumpulan ikon SVG modern untuk antarmuka tombol (seperti telepon, video call, mic, dsb).
* **`canvas-confetti`**: Efek kembang api ketika mengetik perintah khusus `/confetti`.
```bash
npm install mqtt lucide-react canvas-confetti
```

### Langkah 4: Membangun Jalur Logika MQTT & WebRTC (`src/App.jsx`)
Kami merancang `App.jsx` sebagai jantung aplikasi yang memegang seluruh logika state:
1. **Manajemen Hubungan MQTT**: Menghubungkan ke secure WebSocket broker HiveMQ (`wss://broker.hivemq.com:8884/mqtt`).
2. **Presence & Typing Listener**: Berlangganan topik `presence` dan `typing` untuk mendeteksi siapa saja yang aktif secara dinamis.
3. **Perekam Voice Notes**: Mengakses mikrofon menggunakan `navigator.mediaDevices.getUserMedia` lalu mengonversi berkas audio biner menjadi data Base64 aman kirim.
4. **Alur WebRTC P2P**:
   * Pengirim membuat jabat tangan awal (`createOffer`), menyimpan lokal, dan memublikasikan sinyal ke topik target: `mqtt_chat/calls/{room}/{username_target}`.
   * Penerima mendeteksi pesan panggilan masuk, memainkan ringtone sintetis Web Audio API, lalu memproses tawaran tersebut (`setRemoteDescription`).
   * Penerima membalas dengan (`createAnswer`) dan bertukar jalur IP (*ICE candidates*).
   * Aliran video lokal dan jarak jauh terhubung langsung pada elemen `<video>`.

### Langkah 5: Membuat Versi Standalone Single-File (`mqtt-chat-easy.html`)
Untuk mempermudah penggunaan di komputer/laptop lain tanpa perlu instalasi Node.js:
1. Kami memporting seluruh logika React di atas ke dalam satu berkas HTML murni.
2. Memuat pustaka Tailwind CSS, MQTT.js, Lucide Icons, dan Canvas Confetti langsung menggunakan CDN.
3. Menyatukan kode antarmuka UI dan logika jabat tangan WebRTC ke dalam tag `<script>` mandiri.

### Langkah 6: Pembuatan `.gitignore` & Commit Git
Kami membuat berkas `.gitignore` untuk mengabaikan folder sampah atau dependensi lokal (`node_modules`, `dist`), lalu menginisialisasi repositori Git dan melakukan commit awal.
```bash
git init
git add .
git commit -m "Initial commit: WhatsApp-like chat over MQTT with WebRTC voice/video calling..."
```

---

## 💻 Cara Menjalankan Aplikasi

### Opsi A: Menggunakan React + Vite (Rekomendasi untuk Pengembangan)
1. Jalankan instalasi dependensi jika baru mengunduh proyek:
   ```bash
   npm install
   ```
2. Jalankan server pengembangan lokal:
   ```bash
   npm run dev
   ```
3. Buka alamat yang tertera (biasanya `http://localhost:5173`) di browser Anda.

### Opsi B: Menggunakan File Standalone HTML (Sangat Mudah)
1. Cukup klik ganda berkas **`mqtt-chat-easy.html`** langsung di komputer Anda.
2. File ini akan terbuka langsung di browser Chrome/Edge/Firefox Anda tanpa perlu menjalankan server atau menginstal Node.js sama sekali!

---

## 📡 Cara Terhubung dengan Laptop/Pengguna Lain
1. Pastikan kedua laptop terhubung ke jaringan internet.
2. Buka aplikasi (baik Opsi A atau Opsi B) di kedua laptop tersebut.
3. Klik tombol **Settings (Roda Gigi)** di kiri atas:
   * Berikan nama pengguna yang berbeda (contoh Laptop 1: `Rian`, Laptop 2: `Siti`).
   * Simpan pengaturan.
4. Pastikan status koneksi banner di atas daftar ruang obrolan berwarna hijau: **"Terhubung ke HiveMQ Broker"**.
5. Pilih grup obrolan yang sama (misal: *General Lounge*).
6. Anda sekarang bisa saling bertukar chat, mengirim foto hingga 10MB, mengirim VN, serta melakukan panggilan telepon atau video call berkualitas tinggi!
