const pptx = require("pptxgenjs");
const fs = require("fs");
const path = require("path");

const pres = new pptx();
pres.layout = "LAYOUT_WIDE"; // 13.333" x 7.5"

// WhatsApp dark premium palette
const C = {
  BG: "0B141A",
  CARD: "111B21",
  CARD2: "1A2530",
  ACCENT: "00A884",
  ACCENT_D: "005C4B",
  WHITE: "FFFFFF",
  LIGHT: "E9EDE9",
  GRAY: "869687",
  RED: "F96167",
  GOLD: "F9E795",
};

const W = 13.333, H = 7.5;

// helper: full-bg rectangle
function bg(slide, color = C.BG) {
  slide.addShape("rect", { x: 0, y: 0, w: W, h: H, fill: { color }, line: { color, width: 0 } });
}

// helper: numbered circle (motif)
function circle(slide, x, y, d, text, fill = C.ACCENT, txtColor = C.WHITE, fontSize = 16) {
  slide.addShape("ellipse", {
    x, y, w: d, h: d,
    fill: { color: fill }, line: { color: fill, width: 0 },
  });
  slide.addText(text, {
    x, y, w: d, h: d,
    align: "center", valign: "middle",
    fontSize, bold: true, color: txtColor, fontFace: "Arial",
    margin: 0,
  });
}

// helper: card (rounded rectangle, subtle shadow)
function card(slide, x, y, w, h, fill = C.CARD) {
  slide.addShape("roundRect", {
    x, y, w, h,
    fill: { color: fill },
    line: { color: fill, width: 0 },
    rectRadius: 0.08,
    shadow: { type: "outer", color: "000000", opacity: 0.35, blur: 6, offset: 2, angle: 90 },
  });
}

// helper: title text (no underline, no accent bar per skill guidance)
function title(slide, text, sub) {
  slide.addText(text, {
    x: 0.6, y: 0.45, w: 12, h: 0.8,
    fontSize: 36, bold: true, color: C.WHITE, fontFace: "Arial",
    margin: 0,
  });
  if (sub) {
    slide.addText(sub, {
      x: 0.62, y: 1.18, w: 12, h: 0.4,
      fontSize: 16, color: C.ACCENT, fontFace: "Arial",
      margin: 0,
    });
  }
}


// ============================================================
// SLIDE 1: TITLE
// ============================================================
{
  const s = pres.addSlide();
  bg(s);
  // two motif circles (G=Game, C=Chat) as visual element
  circle(s, 1.0, 1.4, 1.0, "G", C.ACCENT, C.WHITE, 36);
  circle(s, 2.15, 1.4, 1.0, "C", C.ACCENT_D, C.WHITE, 36);
  s.addText("Portfolio Antigravity", {
    x: 1.0, y: 2.6, w: 11.3, h: 1.1,
    fontSize: 48, bold: true, color: C.WHITE, fontFace: "Arial",
    margin: 0,
  });
  s.addText("GameHub Platform  &  WhatsApp Chat Clone Real-Time", {
    x: 1.0, y: 3.75, w: 11.3, h: 0.6,
    fontSize: 22, color: C.ACCENT, fontFace: "Arial", margin: 0,
  });
  s.addText("Dibuat dari awal sampai berjalan - Full Journey", {
    x: 1.0, y: 4.4, w: 11.3, h: 0.5,
    fontSize: 16, color: C.LIGHT, fontFace: "Arial", margin: 0,
  });
  s.addText("GameHub (10 Game)  |  MQTT WhatsApp Clone  |  HTML/CSS/JS  |  React + Vite  |  WebRTC", {
    x: 1.0, y: 6.7, w: 11.3, h: 0.4,
    fontSize: 13, color: C.GRAY, fontFace: "Arial", margin: 0,
  });
}


// ============================================================
// SLIDE 2: AGENDA
// ============================================================
{
  const s = pres.addSlide();
  bg(s);
  title(s, "Agenda Presentasi", "Apa yang akan dibahas");
  const items = [
    ["1", "Proyek 1: GameHub", "Platform 10 game klasik (Snake, Tetris, 2048, dsb)"],
    ["2", "Proyek 2: WhatsApp Clone", "Chat real-time MQTT + WebRTC"],
    ["3", "Stack Teknologi", "Tools yang dipakai kedua proyek"],
    ["4", "Langkah Pembuatan", "Dari init sampai jalan"],
    ["5", "Fitur Utama", "Kemampuan setiap aplikasi"],
    ["6", "Pengalaman 5 Hari & Tampilan", "Perjalanan & screenshot aplikasi"],
  ];
  const cw = 5.85, ch = 1.5, gx = 0.3, gy = 0.25;
  const sx = 0.6, sy = 1.85;
  items.forEach(([n, t, d], i) => {
    const r = Math.floor(i / 2), col = i % 2;
    const x = sx + col * (cw + gx), y = sy + r * (ch + gy);
    card(s, x, y, cw, ch);
    circle(s, x + 0.25, y + 0.45, 0.6, n);
    s.addText(t, {
      x: x + 1.1, y: y + 0.2, w: cw - 1.3, h: 0.5,
      fontSize: 17, bold: true, color: C.WHITE, fontFace: "Arial", margin: 0,
    });
    s.addText(d, {
      x: x + 1.15, y: y + 0.75, w: cw - 1.3, h: 0.6,
      fontSize: 12, color: C.GRAY, fontFace: "Arial", margin: 0,
    });
  });
}


// ============================================================
// SLIDE 3: GAMEHUB OVERVIEW (two-column: text left, stat callouts right)
// ============================================================
{
  const s = pres.addSlide();
  bg(s);
  title(s, "Proyek 1: GameHub", "Platform Game Online Terlengkap");
  // left: text card
  card(s, 0.6, 1.85, 7.2, 5.1);
  circle(s, 0.85, 2.1, 0.7, "G", C.ACCENT, C.WHITE, 28);
  s.addText("10 game klasik seru dalam satu platform web", {
    x: 1.7, y: 2.2, w: 5.9, h: 0.5,
    fontSize: 16, bold: true, color: C.ACCENT, fontFace: "Arial", margin: 0,
  });
  s.addText([
    { text: "Dibangun dengan HTML/CSS/JS murni, tanpa framework, siap deploy ke Netlify.", options: { breakLine: true, fontSize: 13, color: C.LIGHT } },
    { text: " ", options: { breakLine: true, fontSize: 8 } },
    { text: "Komponen kunci:", options: { breakLine: true, fontSize: 13, bold: true, color: C.WHITE } },
    { text: "10 game: Snake, Tetris, 2048, Sudoku, Tic Tac Toe", options: { bullet: true, breakLine: true, fontSize: 13, color: C.LIGHT } },
    { text: "Space Shooter, Flappy Bird, Dino Run, Chess, Ludo", options: { bullet: true, breakLine: true, fontSize: 13, color: C.LIGHT } },
    { text: "7 halaman: Home, Games, New, Leaderboard, Profil", options: { bullet: true, breakLine: true, fontSize: 13, color: C.LIGHT } },
    { text: "Chat (GameBot AI), Pengaturan", options: { bullet: true, breakLine: true, fontSize: 13, color: C.LIGHT } },
    { text: "Dark/light mode, particles background, leaderboard", options: { bullet: true, breakLine: true, fontSize: 13, color: C.LIGHT } },
    { text: " ", options: { breakLine: true, fontSize: 8 } },
    { text: "Dibuat menggunakan Antigravity dari nol hingga siap main.", options: { fontSize: 13, color: C.LIGHT, italic: true } },
  ], {
    x: 0.95, y: 3.0, w: 6.7, h: 3.8, fontFace: "Arial", margin: 0, paraSpaceAfter: 6,
  });
  // right: 3 stat callouts
  const stats = [
    ["10", "Game klasik", C.ACCENT],
    ["7", "Halaman lengkap", C.ACCENT_D],
    ["AI", "GameBot chat", C.ACCENT],
  ];
  stats.forEach(([big, lbl, col], i) => {
    const y = 1.85 + i * 1.75;
    card(s, 8.0, y, 4.7, 1.55);
    s.addText(big, {
      x: 8.2, y: y + 0.15, w: 2.0, h: 1.2,
      fontSize: 60, bold: true, color: col, fontFace: "Arial", margin: 0, align: "left",
    });
    s.addText(lbl, {
      x: 10.2, y: y + 0.55, w: 2.4, h: 0.5,
      fontSize: 14, color: C.LIGHT, fontFace: "Arial", margin: 0,
    });
  });
}


// ============================================================
// SLIDE 4: CHAT OVERVIEW (two-column reversed: visual left, text right)
// ============================================================
{
  const s = pres.addSlide();
  bg(s);
  title(s, "Proyek 2: WhatsApp Web Clone", "Real-time chat dengan MQTT + WebRTC");
  // left: 3 stat callouts
  const stats = [
    ["wss://", "MQTT sub-detik", C.ACCENT],
    ["P2P", "Voice/Video Call", C.ACCENT_D],
    ["10MB", "Kompresi gambar", C.ACCENT],
  ];
  stats.forEach(([big, lbl, col], i) => {
    const y = 1.85 + i * 1.75;
    card(s, 0.6, y, 4.7, 1.55);
    s.addText(big, {
      x: 0.8, y: y + 0.15, w: 2.3, h: 1.2,
      fontSize: 44, bold: true, color: col, fontFace: "Arial", margin: 0, align: "left",
    });
    s.addText(lbl, {
      x: 3.0, y: y + 0.55, w: 2.2, h: 0.5,
      fontSize: 14, color: C.LIGHT, fontFace: "Arial", margin: 0,
    });
  });
  // right: text card
  card(s, 5.5, 1.85, 7.2, 5.1);
  circle(s, 5.75, 2.1, 0.7, "C", C.ACCENT_D, C.WHITE, 28);
  s.addText("Chat bergaya WhatsApp Web bertema gelap premium", {
    x: 6.6, y: 2.2, w: 5.9, h: 0.5,
    fontSize: 16, bold: true, color: C.ACCENT, fontFace: "Arial", margin: 0,
  });
  s.addText([
    { text: "React + Vite, protokol MQTT lewat WebSocket untuk pesan instan.", options: { breakLine: true, fontSize: 13, color: C.LIGHT } },
    { text: " ", options: { breakLine: true, fontSize: 8 } },
    { text: "Fitur utama:", options: { breakLine: true, fontSize: 13, bold: true, color: C.WHITE } },
    { text: "Pesan instan via MQTT (broker HiveMQ wss://)", options: { bullet: true, breakLine: true, fontSize: 13, color: C.LIGHT } },
    { text: "Voice & Video Call P2P pakai WebRTC", options: { bullet: true, breakLine: true, fontSize: 13, color: C.LIGHT } },
    { text: "Voice notes via MediaRecorder API (Base64 WebM)", options: { bullet: true, breakLine: true, fontSize: 13, color: C.LIGHT } },
    { text: "Kirim gambar 10MB (kompresi Canvas API)", options: { bullet: true, breakLine: true, fontSize: 13, color: C.LIGHT } },
    { text: "Presence & typing indicator dinamis", options: { bullet: true, breakLine: true, fontSize: 13, color: C.LIGHT } },
    { text: "Standalone: mqtt-chat-easy.html (tanpa instalasi)", options: { bullet: true, breakLine: true, fontSize: 13, color: C.LIGHT } },
    { text: " ", options: { breakLine: true, fontSize: 8 } },
    { text: "Dibuat menggunakan Antigravity dari nol hingga bisa digunakan.", options: { fontSize: 13, color: C.LIGHT, italic: true } },
  ], {
    x: 5.85, y: 3.0, w: 6.7, h: 3.8, fontFace: "Arial", margin: 0, paraSpaceAfter: 6,
  });
}


// ============================================================
// SLIDE 5: TECH STACK (2x4 grid of cards with letter-icons)
// ============================================================
{
  const s = pres.addSlide();
  bg(s);
  title(s, "Stack Teknologi", "Tools yang digunakan kedua proyek");
  const techs = [
    ["H", "HTML/CSS/JS", "Dasar web (GameHub)", C.ACCENT],
    ["N", "Netlify", "Hosting & deploy GameHub", C.ACCENT_D],
    ["AI", "GameBot AI", "Chatbot bawaan GameHub", C.ACCENT],
    ["LS", "LocalStorage", "Simpan skor & profil", C.ACCENT_D],
    ["R", "React 18", "UI komponen (Chat)", C.ACCENT],
    ["V", "Vite", "Dev server super cepat", C.ACCENT_D],
    ["M", "MQTT.js", "Messaging chat real-time", C.ACCENT],
    ["P", "WebRTC", "Voice/video call P2P", C.ACCENT_D],
  ];
  const cols = 4;
  const cw = 2.85, ch = 2.3, gx = 0.25, gy = 0.25;
  const sx = 0.6, sy = 1.85;
  techs.forEach(([letter, name, desc, col], i) => {
    const r = Math.floor(i / cols), c = i % cols;
    const x = sx + c * (cw + gx), y = sy + r * (ch + gy);
    card(s, x, y, cw, ch);
    circle(s, x + cw / 2 - 0.4, y + 0.25, 0.8, letter, col, C.WHITE, 28);
    s.addText(name, {
      x, y: y + 1.15, w: cw, h: 0.4,
      fontSize: 17, bold: true, color: C.WHITE, fontFace: "Arial",
      align: "center", margin: 0,
    });
    s.addText(desc, {
      x: x + 0.15, y: y + 1.6, w: cw - 0.3, h: 0.6,
      fontSize: 11, color: C.GRAY, fontFace: "Arial",
      align: "center", margin: 0,
    });
  });
}


// ============================================================
// SLIDE 6: GAMEHUB BUILD STEPS (numbered timeline, 2 cols)
// ============================================================
{
  const s = pres.addSlide();
  bg(s);
  title(s, "Langkah Buat GameHub", "Dari init sampai jalan");
  const steps = [
    ["1", "Init Proyek", "Buat folder game-hub di .gemini/antigravity-ide/scratch"],
    ["2", "Struktur HTML", "index.html: 7 halaman + sidebar + topbar"],
    ["3", "Styling CSS", "style.css: tema dark/light, particles, grid layout"],
    ["4", "10 Game JS", "games/: snake, tetris, 2048, sudoku, tictactoe, dll"],
    ["5", "Logika app.js", "Navigasi, leaderboard, profil, GameBot AI chat"],
    ["6", "Deploy Netlify", "netlify.toml + publish ke Netlify (gratis)"],
  ];
  const cw = 5.85, ch = 1.55, gx = 0.3, gy = 0.2;
  const sx = 0.6, sy = 1.85;
  steps.forEach(([n, t, d], i) => {
    const r = Math.floor(i / 2), c = i % 2;
    const x = sx + c * (cw + gx), y = sy + r * (ch + gy);
    card(s, x, y, cw, ch);
    circle(s, x + 0.25, y + 0.4, 0.7, n);
    s.addText(t, {
      x: x + 1.15, y: y + 0.2, w: cw - 1.3, h: 0.5,
      fontSize: 17, bold: true, color: C.WHITE, fontFace: "Arial", margin: 0,
    });
    s.addText(d, {
      x: x + 1.15, y: y + 0.75, w: cw - 1.3, h: 0.6,
      fontSize: 12, color: C.GRAY, fontFace: "Arial", margin: 0,
    });
  });
}


// ============================================================
// SLIDE 7: CHAT BUILD STEPS
// ============================================================
{
  const s = pres.addSlide();
  bg(s);
  title(s, "Langkah Buat WhatsApp Clone", "Dari init sampai bisa chat");
  const steps = [
    ["1", "Init Vite+React", "npm create vite CHATTING, npm install"],
    ["2", "Tailwind CSS", "Palet WhatsApp dark, animasi custom"],
    ["3", "Install Deps", "mqtt, lucide-react, canvas-confetti, aedes"],
    ["4", "Logika App.jsx", "Koneksi MQTT, presence, typing, VN"],
    ["5", "WebRTC Call", "createOffer -> signaling MQTT -> ICE"],
    ["6", "Standalone HTML", "mqtt-chat-easy.html + git commit awal"],
  ];
  const cw = 5.85, ch = 1.55, gx = 0.3, gy = 0.2;
  const sx = 0.6, sy = 1.85;
  steps.forEach(([n, t, d], i) => {
    const r = Math.floor(i / 2), c = i % 2;
    const x = sx + c * (cw + gx), y = sy + r * (ch + gy);
    card(s, x, y, cw, ch);
    circle(s, x + 0.25, y + 0.4, 0.7, n, C.ACCENT_D);
    s.addText(t, {
      x: x + 1.15, y: y + 0.2, w: cw - 1.3, h: 0.5,
      fontSize: 17, bold: true, color: C.WHITE, fontFace: "Arial", margin: 0,
    });
    s.addText(d, {
      x: x + 1.15, y: y + 0.75, w: cw - 1.3, h: 0.6,
      fontSize: 12, color: C.GRAY, fontFace: "Arial", margin: 0,
    });
  });
}


// ============================================================
// SLIDE 8: GAMEHUB FEATURES (2x3 grid)
// ============================================================
{
  const s = pres.addSlide();
  bg(s);
  title(s, "Fitur GameHub", "Kemampuan platform game online");
  const feats = [
    ["10", "10 Game Klasik", "Snake, Tetris, 2048, Sudoku, Tic Tac Toe, dll"],
    ["7", "7 Halaman Lengkap", "Home, Games, New, Leaderboard, Profil, Chat, Settings"],
    ["DM", "Dark/Light Mode", "Tema gelap/terang dengan toggle switch"],
    ["PB", "Particles Background", "Animasi partikel di latar belakang"],
    ["AI", "GameBot AI Chat", "Chatbot AI bawaan untuk bantu pemain"],
    ["LB", "Leaderboard & Profil", "Simpan skor, rank, achievements via LocalStorage"],
  ];
  const cols = 3;
  const cw = 3.95, ch = 2.4, gx = 0.2, gy = 0.25;
  const sx = 0.6, sy = 1.9;
  feats.forEach(([icon, t, d], i) => {
    const r = Math.floor(i / cols), c = i % cols;
    const x = sx + c * (cw + gx), y = sy + r * (ch + gy);
    card(s, x, y, cw, ch);
    circle(s, x + cw / 2 - 0.4, y + 0.3, 0.8, icon, C.ACCENT, C.WHITE, 18);
    s.addText(t, {
      x, y: y + 1.2, w: cw, h: 0.4,
      fontSize: 15, bold: true, color: C.WHITE, fontFace: "Arial",
      align: "center", margin: 0,
    });
    s.addText(d, {
      x: x + 0.2, y: y + 1.65, w: cw - 0.4, h: 0.6,
      fontSize: 11, color: C.GRAY, fontFace: "Arial",
      align: "center", margin: 0,
    });
  });
}


// ============================================================
// SLIDE 9: CHAT FEATURES (2x3 grid)
// ============================================================
{
  const s = pres.addSlide();
  bg(s);
  title(s, "Fitur WhatsApp Clone", "Kemampuan chat real-time");
  const feats = [
    ["IM", "Pesan Instan", "MQTT over WebSocket wss:// sub-detik"],
    ["VC", "Voice & Video Call", "WebRTC P2P, MQTT signaling channel"],
    ["VN", "Voice Notes Asli", "MediaRecorder API, Base64 WebM <250KB"],
    ["IMG", "Kompresi Gambar 10MB", "Canvas API, output <150KB sisi klien"],
    ["PT", "Presence & Typing", "User online & status mengetik dinamis"],
    ["UI", "Glassmorphism Premium", "Tema gelap, animasi, responsif"],
  ];
  const cols = 3;
  const cw = 3.95, ch = 2.4, gx = 0.2, gy = 0.25;
  const sx = 0.6, sy = 1.9;
  feats.forEach(([icon, t, d], i) => {
    const r = Math.floor(i / cols), c = i % cols;
    const x = sx + c * (cw + gx), y = sy + r * (ch + gy);
    card(s, x, y, cw, ch);
    circle(s, x + cw / 2 - 0.4, y + 0.3, 0.8, icon, C.ACCENT_D, C.WHITE, 18);
    s.addText(t, {
      x, y: y + 1.2, w: cw, h: 0.4,
      fontSize: 15, bold: true, color: C.WHITE, fontFace: "Arial",
      align: "center", margin: 0,
    });
    s.addText(d, {
      x: x + 0.2, y: y + 1.65, w: cw - 0.4, h: 0.6,
      fontSize: 11, color: C.GRAY, fontFace: "Arial",
      align: "center", margin: 0,
    });
  });
}


// ============================================================
// SLIDE 10: HOW TO RUN (two-column comparison)
// ============================================================
{
  const s = pres.addSlide();
  bg(s);
  title(s, "Cara Menjalankan", "Dua proyek siap pakai");
  // left card: GameHub
  card(s, 0.6, 1.85, 5.85, 5.1);
  circle(s, 0.85, 2.1, 0.7, "G", C.ACCENT, C.WHITE, 28);
  s.addText("GameHub", {
    x: 1.7, y: 2.2, w: 4.5, h: 0.5,
    fontSize: 18, bold: true, color: C.ACCENT, fontFace: "Arial", margin: 0,
  });
  s.addText([
    { text: "Jalankan platform game:", options: { breakLine: true, fontSize: 13, color: C.LIGHT } },
    { text: " ", options: { breakLine: true, fontSize: 8 } },
    { text: "Opsi A - Buka langsung:", options: { breakLine: true, fontSize: 13, bold: true, color: C.WHITE } },
    { text: "Klik ganda index.html di folder", options: { breakLine: true, fontSize: 13, color: C.LIGHT } },
    { text: ".gemini/antigravity-ide/scratch/game-hub", options: { breakLine: true, fontSize: 12, color: C.WHITE, fontFace: "Consolas" } },
    { text: " ", options: { breakLine: true, fontSize: 8 } },
    { text: "Opsi B - Deploy Netlify:", options: { breakLine: true, fontSize: 13, bold: true, color: C.WHITE } },
    { text: "Drag folder ke netlify.com/drop", options: { breakLine: true, fontSize: 13, color: C.LIGHT } },
    { text: "Atau: netlify deploy --prod", options: { breakLine: true, fontSize: 13, color: C.WHITE, fontFace: "Consolas" } },
    { text: " ", options: { breakLine: true, fontSize: 8 } },
    { text: "10 game langsung siap dimainkan!", options: { fontSize: 13, color: C.LIGHT, italic: true } },
  ], { x: 0.95, y: 2.85, w: 5.3, h: 4.0, fontFace: "Arial", margin: 0, paraSpaceAfter: 4 });

  // right card: Chat
  card(s, 6.6, 1.85, 6.1, 5.1);
  circle(s, 6.85, 2.1, 0.7, "C", C.ACCENT_D, C.WHITE, 28);
  s.addText("WhatsApp Clone", {
    x: 7.7, y: 2.2, w: 4.8, h: 0.5,
    fontSize: 18, bold: true, color: C.ACCENT, fontFace: "Arial", margin: 0,
  });
  s.addText([
    { text: "Dua opsi menjalankan chat:", options: { breakLine: true, fontSize: 13, color: C.LIGHT } },
    { text: " ", options: { breakLine: true, fontSize: 8 } },
    { text: "Opsi A - Developer mode:", options: { breakLine: true, fontSize: 13, bold: true, color: C.WHITE } },
    { text: "$ cd Documents/CHATTING", options: { breakLine: true, fontSize: 13, color: C.WHITE, fontFace: "Consolas" } },
    { text: "$ npm install", options: { breakLine: true, fontSize: 13, color: C.WHITE, fontFace: "Consolas" } },
    { text: "$ npm run dev  -> localhost:5173", options: { breakLine: true, fontSize: 13, color: C.WHITE, fontFace: "Consolas" } },
    { text: " ", options: { breakLine: true, fontSize: 8 } },
    { text: "Opsi B - Gampang (tanpa Node.js):", options: { breakLine: true, fontSize: 13, bold: true, color: C.WHITE } },
    { text: "Klik ganda mqtt-chat-easy.html", options: { breakLine: true, fontSize: 13, color: C.LIGHT } },
    { text: "Langsung buka di browser!", options: { fontSize: 13, color: C.LIGHT, italic: true } },
  ], { x: 6.95, y: 2.85, w: 5.55, h: 4.0, fontFace: "Arial", margin: 0, paraSpaceAfter: 4 });
}


// ============================================================
// SLIDE 11: 5-DAY EXPERIENCE (vertical timeline)
// ============================================================
{
  const s = pres.addSlide();
  bg(s);
  title(s, "Pengalaman 5 Hari dengan Antigravity", "Perjalanan dari nol sampai jadi");
  const days = [
    ["D1", "Setup & Eksplorasi", "Install Antigravity IDE, konfigurasi environment, eksplorasi tools & fitur bawaan"],
    ["D2", "Mulai GameHub", "Struktur HTML 7 halaman, styling dark/light theme, mulai bangun 10 game klasik"],
    ["D3", "Selesaikan GameHub", "Integrasi leaderboard, profil, GameBot AI chat, particles, deploy ke Netlify"],
    ["D4", "Build WhatsApp Clone", "Init Vite + React, Tailwind CSS, koneksi MQTT, pesan real-time pertama terkirim"],
    ["D5", "Finalisasi & Demo", "WebRTC voice/video call, voice notes, standalone HTML, testing & siap presentasi"],
  ];
  const ch = 0.92, gy = 0.08, sx = 0.6, sy = 1.85;
  days.forEach(([d, t, desc], i) => {
    const y = sy + i * (ch + gy);
    card(s, sx, y, 12.1, ch);
    circle(s, sx + 0.2, y + 0.16, 0.6, d, i % 2 === 0 ? C.ACCENT : C.ACCENT_D, C.WHITE, 14);
    s.addText(t, {
      x: sx + 1.05, y: y + 0.08, w: 3.5, h: 0.4,
      fontSize: 15, bold: true, color: C.WHITE, fontFace: "Arial", margin: 0,
    });
    s.addText(desc, {
      x: sx + 1.05, y: y + 0.45, w: 10.8, h: 0.45,
      fontSize: 12, color: C.GRAY, fontFace: "Arial", margin: 0,
    });
  });
}

// ============================================================
// SLIDE 12: APP SCREENSHOTS
// ============================================================
{
  const s = pres.addSlide();
  bg(s);
  title(s, "Tampilan Aplikasi", "Screenshot langsung dari aplikasi yang dibangun");
  const shotDir = path.join(__dirname, "screenshots");
  const ghPath = path.join(shotDir, "gamehub_home.png");
  const chatPath = path.join(shotDir, "chat_app.png");
  // left: GameHub
  if (fs.existsSync(ghPath)) {
    const b64 = fs.readFileSync(ghPath).toString("base64");
    s.addImage({ data: "image/png;base64," + b64, x: 0.6, y: 1.85, w: 6.0, h: 4.6, sizing: { type: "contain", w: 6.0, h: 4.6 } });
  }
  s.addText("GameHub - Halaman Home", {
    x: 0.6, y: 6.55, w: 6.0, h: 0.4,
    fontSize: 13, bold: true, color: C.ACCENT, fontFace: "Arial", align: "center", margin: 0,
  });
  // right: Chat
  if (fs.existsSync(chatPath)) {
    const b64 = fs.readFileSync(chatPath).toString("base64");
    s.addImage({ data: "image/png;base64," + b64, x: 6.9, y: 1.85, w: 6.0, h: 4.6, sizing: { type: "contain", w: 6.0, h: 4.6 } });
  }
  s.addText("WhatsApp Clone - Chat Room", {
    x: 6.9, y: 6.55, w: 6.0, h: 0.4,
    fontSize: 13, bold: true, color: C.ACCENT, fontFace: "Arial", align: "center", margin: 0,
  });
}

// ============================================================
// SLIDE 13: CLOSING
// ============================================================
{
  const s = pres.addSlide();
  bg(s);
  // motif circles
  circle(s, 1.0, 2.4, 1.0, "G", C.ACCENT, C.WHITE, 36);
  circle(s, 2.15, 2.4, 1.0, "C", C.ACCENT_D, C.WHITE, 36);
  s.addText("Terima Kasih", {
    x: 1.0, y: 3.6, w: 11.3, h: 1.1,
    fontSize: 54, bold: true, color: C.WHITE, fontFace: "Arial", margin: 0,
  });
  s.addText("Dua proyek selesai dibuat dengan Antigravity", {
    x: 1.0, y: 4.75, w: 11.3, h: 0.6,
    fontSize: 20, color: C.ACCENT, fontFace: "Arial", margin: 0,
  });
  s.addText("GameHub Platform (10 Game)   &   MQTT WhatsApp Web Clone", {
    x: 1.0, y: 5.4, w: 11.3, h: 0.5,
    fontSize: 16, color: C.LIGHT, fontFace: "Arial", margin: 0,
  });
  s.addText("HTML/CSS/JS + Netlify  |  React + Vite  |  MQTT + WebRTC  |  Tailwind CSS", {
    x: 1.0, y: 6.7, w: 11.3, h: 0.4,
    fontSize: 13, color: C.GRAY, fontFace: "Arial", margin: 0,
  });
}

pres.writeFile({ fileName: "Portfolio_Antigravity_v3.pptx" }).then(f => {
  console.log("SAVED:", f);
});
