# Contoh Implementasi Slide Functions
# Referensi cepat untuk agen saat membuat slide kustom

# ── COVER SLIDE ──────────────────────────────────────────────────────────────
"""
Gunakan untuk slide pertama/pembuka presentasi.
Selalu sertakan: ikon, judul besar, subtitle, footer tech stack.
"""

# ── CONTENT CARDS SLIDE ───────────────────────────────────────────────────────
"""
Format grid 2×N untuk menampilkan fitur, teknologi, atau poin penting.
Gunakan warna berbeda per kartu agar visual menarik.
Maks 6 item (2 kolom × 3 baris).

Pola warna yang direkomendasikan:
  Row 1: ACCENT_GREEN, ACCENT_BLUE
  Row 2: YELLOW, ORANGE
  Row 3: ACCENT_GREEN, ACCENT_BLUE
"""

# ── STEPS / TIMELINE SLIDE ───────────────────────────────────────────────────
"""
Gunakan untuk menampilkan alur proses, langkah-langkah, atau timeline.
Maks 6 langkah. Lingkaran bernomor di kiri, card konten di kanan.
Garis vertikal menghubungkan antar lingkaran.
"""

# ── ARCHITECTURE DIAGRAM SLIDE ───────────────────────────────────────────────
"""
Gunakan untuk menampilkan arsitektur sistem.
Pola: [Box A] -- [Label panah] --> [Box Tengah/Broker] <-- [Label panah] -- [Box B]
Letakkan P2P path sebagai box horizontal di bawah diagram utama.
"""

# ── TWO COLUMN SLIDE ─────────────────────────────────────────────────────────
"""
Gunakan untuk perbandingan (Opsi A vs Opsi B, Before vs After, dll).
Setiap kolom punya header, optional code block, dan bullet points.
"""

# ── CHALLENGE & SOLUTION SLIDE ───────────────────────────────────────────────
"""
Tampilkan 3-4 masalah teknis + solusinya dalam baris horizontal.
Setiap baris: garis warna di kiri, judul masalah, deskripsi, solusi hijau.
"""

# ── CLOSING SLIDE ────────────────────────────────────────────────────────────
"""
Slide terakhir. Emoji besar (🎉), judul "Terima Kasih!", 
subtitle nama proyek, divider teal, bullet ringkasan.
"""

# ── STAT CARDS ───────────────────────────────────────────────────────────────
"""
Untuk menampilkan angka/metrik penting (4 kartu sejajar).
Setiap kartu: emoji ikon besar, angka/nilai besar (accent color), label kecil.

Contoh:
  stats = [
    ("⚡", "< 1 detik", "Latensi"),
    ("🖼️", "10 MB",    "Maks Foto"),
    ("🎙️", "250 KB",   "Voice Note"),
    ("🌐", "P2P",      "Video Call"),
  ]
  card_w, card_h = 2.1, 1.8
  for i, (icon, value, label) in enumerate(stats):
      x = 0.35 + i * 2.35
      add_rect(slide, x, y, card_w, card_h, fill_color=BG_CARD, line_color=ACCENT_GREEN, line_width=Pt(1))
      add_text_box(slide, icon,  left=x, top=y+0.05, width=card_w, height=0.5,  font_size=Pt(22), align=PP_ALIGN.CENTER)
      add_text_box(slide, value, left=x, top=y+0.55, width=card_w, height=0.55, font_size=Pt(22), bold=True, color=ACCENT_GREEN, align=PP_ALIGN.CENTER)
      add_text_box(slide, label, left=x, top=y+1.1,  width=card_w, height=0.4,  font_size=Pt(11), color=LIGHT_GRAY, align=PP_ALIGN.CENTER)
"""

# ── TECH GRID SLIDE (3×3) ────────────────────────────────────────────────────
"""
Grid 3 kolom × N baris untuk menampilkan 9 teknologi/library.
Setiap kartu: accent bar di atas, nama tebal, deskripsi singkat.

techs = [
    ("⚛️", "React 18",     "Deskripsi...", ACCENT_GREEN, row=0, col=0),
    ("⚡",  "Vite 5",      "Deskripsi...", ACCENT_BLUE,  row=0, col=1),
    ("🎨",  "Tailwind",    "Deskripsi...", YELLOW,       row=0, col=2),
    ...
]
card_w, card_h = 2.95, 1.48
x = 0.25 + col * 3.2
y = 1.38 + row * 1.6
"""
