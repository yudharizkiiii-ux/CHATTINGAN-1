"""
pptx_base.py — Template dasar untuk generate PPTX dengan python-pptx
Salin file ini, ganti konten slide sesuai kebutuhan.

Jalankan dengan: python -X utf8 pptx_base.py
"""

from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN

# ─── SHAPE TYPE CONSTANTS ─────────────────────────────────────────────────────
MSO_RECT = 1
MSO_OVAL = 9

# ─── DARK THEME PALETTE ───────────────────────────────────────────────────────
BG_DARK      = RGBColor(0x0b, 0x14, 0x1a)
BG_CARD      = RGBColor(0x1f, 0x2c, 0x34)
ACCENT_GREEN = RGBColor(0x00, 0xa8, 0x84)
ACCENT_TEAL  = RGBColor(0x00, 0x5c, 0x4b)
ACCENT_BLUE  = RGBColor(0x53, 0xbd, 0xeb)
WHITE        = RGBColor(0xff, 0xff, 0xff)
LIGHT_GRAY   = RGBColor(0xc0, 0xc9, 0xd0)
YELLOW       = RGBColor(0xff, 0xd7, 0x4e)
ORANGE       = RGBColor(0xff, 0x6b, 0x35)

# ─── LIGHT THEME PALETTE ──────────────────────────────────────────────────────
# BG_WHITE  = RGBColor(0xff, 0xff, 0xff)
# BG_LIGHT  = RGBColor(0xf4, 0xf6, 0xf9)
# PRIMARY   = RGBColor(0x1a, 0x73, 0xe8)
# DARK_TEXT = RGBColor(0x1c, 0x1c, 0x1c)


# ─── HELPER FUNCTIONS ─────────────────────────────────────────────────────────

def set_bg(slide, color: RGBColor):
    """Set latar belakang slide ke warna solid."""
    bg = slide.background
    fill = bg.fill
    fill.solid()
    fill.fore_color.rgb = color


def add_rect(slide, left, top, width, height,
             fill_color=None, line_color=None, line_width=Pt(1),
             shape_type=MSO_RECT):
    """Tambah persegi panjang atau oval ke slide."""
    shape = slide.shapes.add_shape(
        shape_type,
        Inches(left), Inches(top), Inches(width), Inches(height)
    )
    if fill_color:
        shape.fill.solid()
        shape.fill.fore_color.rgb = fill_color
    else:
        shape.fill.background()

    if line_color:
        shape.line.color.rgb = line_color
        shape.line.width = line_width
    else:
        shape.line.fill.background()
    return shape


def add_text_box(slide, text, left, top, width, height,
                 font_size=Pt(18), bold=False, color=WHITE,
                 align=PP_ALIGN.LEFT, font_name="Segoe UI"):
    """Tambah text box ke slide."""
    txBox = slide.shapes.add_textbox(
        Inches(left), Inches(top), Inches(width), Inches(height)
    )
    tf = txBox.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.alignment = align
    run = p.add_run()
    run.text = text
    run.font.size = font_size
    run.font.bold = bold
    run.font.color.rgb = color
    run.font.name = font_name
    return txBox


def add_accent_bar(slide, left=0, top=0, width=10, height=0.06, color=ACCENT_GREEN):
    """Tambah garis horizontal tipis sebagai aksen dekoratif."""
    bar = slide.shapes.add_shape(
        MSO_RECT,
        Inches(left), Inches(top), Inches(width), Inches(height)
    )
    bar.fill.solid()
    bar.fill.fore_color.rgb = color
    bar.line.fill.background()
    return bar


def add_slide_header(slide, title, subtitle="", title_color=WHITE, sub_color=ACCENT_GREEN):
    """Tambah header standar (card gelap + judul + subjudul)."""
    add_rect(slide, 0, 0.08, 10, 1.1, fill_color=BG_CARD)
    add_text_box(slide, title, left=0.3, top=0.15, width=9.4, height=0.7,
                 font_size=Pt(28), bold=True, color=title_color)
    if subtitle:
        add_text_box(slide, subtitle, left=0.3, top=0.75, width=9.4, height=0.35,
                     font_size=Pt(13), color=sub_color)


def add_slide_footer(slide, color=ACCENT_GREEN):
    """Tambah garis aksen bawah slide."""
    add_accent_bar(slide, left=0, top=6.8, width=10, height=0.08, color=color)


# ─── SLIDE FUNCTIONS ──────────────────────────────────────────────────────────

def slide_cover(prs, title="Judul Presentasi", subtitle="Sub-judul di sini", footer_text="2026"):
    """Slide cover dengan ikon, judul, sub-judul, dan footer tech stack."""
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    set_bg(slide, BG_DARK)

    # Card tengah
    add_rect(slide, 0.5, 1.2, 9, 5.5, fill_color=BG_CARD,
             line_color=ACCENT_GREEN, line_width=Pt(1.5))
    add_accent_bar(slide, 0.5, 1.2, 9, 0.07, ACCENT_GREEN)

    # Lingkaran ikon
    oval = slide.shapes.add_shape(MSO_OVAL, Inches(3.8), Inches(1.6), Inches(2.4), Inches(2.4))
    oval.fill.solid()
    oval.fill.fore_color.rgb = ACCENT_GREEN
    oval.line.fill.background()

    # Teks ikon
    add_text_box(slide, "💬", 4.1, 1.95, 1.8, 1.5,
                 font_size=Pt(54), align=PP_ALIGN.CENTER)

    # Judul
    add_text_box(slide, title, 0.5, 3.95, 9, 0.75,
                 font_size=Pt(32), bold=True, color=WHITE, align=PP_ALIGN.CENTER)

    # Sub-judul
    add_text_box(slide, subtitle, 0.5, 4.65, 9, 0.5,
                 font_size=Pt(15), color=ACCENT_GREEN, align=PP_ALIGN.CENTER)

    # Divider
    add_accent_bar(slide, 2.5, 5.15, 5, 0.04, ACCENT_TEAL)

    # Footer
    add_text_box(slide, footer_text, 0.5, 5.35, 9, 0.35,
                 font_size=Pt(10), color=LIGHT_GRAY, align=PP_ALIGN.CENTER)

    add_accent_bar(slide, 0, 6.8, 10, 0.08, ACCENT_GREEN)


def slide_content_cards(prs, title, subtitle, items):
    """
    Slide dengan grid kartu konten (maks 6 item, 2 kolom x 3 baris).
    items: list of dict {icon, title, desc, color}
    """
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    set_bg(slide, BG_DARK)
    add_accent_bar(slide, 0, 0, 10, 0.08, ACCENT_GREEN)
    add_slide_header(slide, title, subtitle)

    col_w, card_h = 4.5, 1.35
    for i, item in enumerate(items[:6]):
        col = i % 2
        row = i // 2
        x = 0.25 + col * 4.85
        y = 1.38 + row * 1.52
        color = item.get("color", ACCENT_GREEN)

        add_rect(slide, x, y, col_w, card_h, fill_color=BG_CARD,
                 line_color=color, line_width=Pt(1.2))
        add_rect(slide, x, y, 0.07, card_h, fill_color=color)
        add_text_box(slide, item.get("icon", "") + "  " + item.get("title", ""),
                     x+0.15, y+0.07, col_w-0.2, 0.4,
                     font_size=Pt(13), bold=True, color=color)
        add_text_box(slide, item.get("desc", ""),
                     x+0.15, y+0.44, col_w-0.25, 0.85,
                     font_size=Pt(10.5), color=LIGHT_GRAY)

    add_slide_footer(slide)


def slide_steps(prs, title, subtitle, steps):
    """
    Slide timeline/langkah-langkah vertikal.
    steps: list of dict {num, title, desc, color}
    """
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    set_bg(slide, BG_DARK)
    add_accent_bar(slide, 0, 0, 10, 0.08, ACCENT_GREEN)
    add_slide_header(slide, title, subtitle)

    for i, step in enumerate(steps[:6]):
        y = 1.38 + i * 0.9
        color = step.get("color", ACCENT_GREEN)

        # Lingkaran nomor
        circle = slide.shapes.add_shape(MSO_OVAL, Inches(0.3), Inches(y+0.05), Inches(0.55), Inches(0.55))
        circle.fill.solid()
        circle.fill.fore_color.rgb = color
        circle.line.fill.background()
        add_text_box(slide, str(step.get("num", i+1)), 0.3, y+0.03, 0.55, 0.55,
                     font_size=Pt(13), bold=True, color=BG_DARK, align=PP_ALIGN.CENTER)

        # Garis penghubung
        if i < len(steps) - 1:
            connector = slide.shapes.add_shape(MSO_RECT, Inches(0.54), Inches(y+0.6), Inches(0.07), Inches(0.33))
            connector.fill.solid()
            connector.fill.fore_color.rgb = color
            connector.line.fill.background()

        # Card konten
        add_rect(slide, 1.05, y, 8.65, 0.78, fill_color=BG_CARD,
                 line_color=color, line_width=Pt(0.8))
        add_text_box(slide, step.get("title", ""), 1.2, y+0.03, 3.5, 0.35,
                     font_size=Pt(12), bold=True, color=color)
        add_text_box(slide, step.get("desc", ""), 1.2, y+0.37, 8.3, 0.38,
                     font_size=Pt(9.5), color=LIGHT_GRAY)

    add_slide_footer(slide)


def slide_two_columns(prs, title, subtitle, col_a, col_b):
    """
    Slide dua kolom untuk perbandingan.
    col_a/col_b: dict {header, color, items: [str], code: str (optional)}
    """
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    set_bg(slide, BG_DARK)
    add_accent_bar(slide, 0, 0, 10, 0.08, ACCENT_GREEN)
    add_slide_header(slide, title, subtitle)

    for col_data, x_start in [(col_a, 0.3), (col_b, 5.3)]:
        color = col_data.get("color", ACCENT_GREEN)
        add_rect(slide, x_start, 1.38, 4.4, 5.0, fill_color=BG_CARD,
                 line_color=color, line_width=Pt(1.5))
        add_accent_bar(slide, x_start, 1.38, 4.4, 0.06, color)
        add_text_box(slide, col_data.get("header", ""),
                     x_start+0.15, 1.45, 4.1, 0.5,
                     font_size=Pt(14), bold=True, color=color)

        if "code" in col_data:
            add_rect(slide, x_start+0.15, 2.0, 4.1, 2.0,
                     fill_color=RGBColor(0x0d, 0x0d, 0x0d), line_color=ACCENT_TEAL, line_width=Pt(1))
            add_text_box(slide, col_data["code"],
                         x_start+0.25, 2.05, 3.9, 1.9,
                         font_size=Pt(10), color=ACCENT_GREEN, font_name="Consolas")

        items_text = "\n".join(["✅  " + it for it in col_data.get("items", [])])
        y_items = 4.1 if "code" in col_data else 2.0
        add_text_box(slide, items_text, x_start+0.15, y_items, 4.1, 2.2,
                     font_size=Pt(11), color=LIGHT_GRAY)

    add_slide_footer(slide)


def slide_closing(prs, title="Terima Kasih!", subtitle="", bullets=None):
    """Slide penutup dengan emoji dan ringkasan."""
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    set_bg(slide, BG_DARK)
    add_accent_bar(slide, 0, 0, 10, 0.08, ACCENT_GREEN)

    add_rect(slide, 0.5, 0.8, 9, 5.8, fill_color=BG_CARD,
             line_color=ACCENT_GREEN, line_width=Pt(1.5))
    add_accent_bar(slide, 0.5, 0.8, 9, 0.07, ACCENT_GREEN)

    add_text_box(slide, "🎉", 3.8, 1.1, 2.4, 1.2,
                 font_size=Pt(58), align=PP_ALIGN.CENTER)
    add_text_box(slide, title, 0.5, 2.2, 9, 0.85,
                 font_size=Pt(38), bold=True, color=WHITE, align=PP_ALIGN.CENTER)
    if subtitle:
        add_text_box(slide, subtitle, 0.5, 3.0, 9, 0.5,
                     font_size=Pt(15), color=ACCENT_GREEN, align=PP_ALIGN.CENTER)

    add_accent_bar(slide, 2.5, 3.55, 5, 0.04, ACCENT_TEAL)

    if bullets:
        bullet_text = "\n".join(["✅  " + b for b in bullets])
        add_text_box(slide, bullet_text, 1.5, 3.7, 7, 2.2,
                     font_size=Pt(13), color=LIGHT_GRAY, align=PP_ALIGN.CENTER)

    add_slide_footer(slide)


# ─── MAIN DEMO ────────────────────────────────────────────────────────────────

def main():
    prs = Presentation()
    prs.slide_width  = Inches(10)
    prs.slide_height = Inches(7)

    # Slide 1: Cover
    slide_cover(prs,
        title="Judul Presentasi Anda",
        subtitle="Sub-judul atau nama proyek",
        footer_text="React  •  Vite  •  Python  •  2026"
    )

    # Slide 2: Fitur/Konten (kartu)
    slide_content_cards(prs,
        title="Fitur-Fitur Unggulan",
        subtitle="Yang membuat aplikasi ini istimewa",
        items=[
            {"icon": "⚡", "title": "Fitur 1", "desc": "Deskripsi fitur pertama yang keren.", "color": ACCENT_GREEN},
            {"icon": "📡", "title": "Fitur 2", "desc": "Deskripsi fitur kedua yang canggih.", "color": ACCENT_BLUE},
            {"icon": "🎙️", "title": "Fitur 3", "desc": "Deskripsi fitur ketiga.", "color": YELLOW},
            {"icon": "🖼️", "title": "Fitur 4", "desc": "Deskripsi fitur keempat.", "color": ORANGE},
        ]
    )

    # Slide 3: Langkah-langkah
    slide_steps(prs,
        title="Proses Pengembangan",
        subtitle="Step-by-step dari nol sampai jadi",
        steps=[
            {"num": "1", "title": "Inisialisasi Proyek", "desc": "Perintah untuk membuat proyek baru.", "color": ACCENT_GREEN},
            {"num": "2", "title": "Setup & Konfigurasi",  "desc": "Konfigurasi tool dan dependensi.", "color": ACCENT_BLUE},
            {"num": "3", "title": "Implementasi Fitur",   "desc": "Coding fitur utama aplikasi.", "color": YELLOW},
            {"num": "4", "title": "Testing & Deploy",     "desc": "Uji coba dan publikasi aplikasi.", "color": ORANGE},
        ]
    )

    # Slide 4: Perbandingan dua opsi
    slide_two_columns(prs,
        title="Cara Menjalankan",
        subtitle="Dua opsi — pilih sesuai kebutuhan",
        col_a={
            "header": "⚙️  Opsi A — Development",
            "color": ACCENT_GREEN,
            "code": "$ npm install\n$ npm run dev",
            "items": ["Hot reload aktif", "DevTools lengkap"],
        },
        col_b={
            "header": "🌐  Opsi B — Standalone",
            "color": ACCENT_BLUE,
            "items": ["Tanpa Node.js", "Buka langsung di browser", "Zero install"],
        }
    )

    # Slide 5: Penutup
    slide_closing(prs,
        title="Terima Kasih!",
        subtitle="Nama Proyek — Built From Scratch",
        bullets=[
            "Fitur unggulan 1",
            "Fitur unggulan 2",
            "Fitur unggulan 3",
            "Siap dipakai dan dikembangkan",
        ]
    )

    output = r"c:\Users\user\Documents\CHATTING\output_presentasi.pptx"
    prs.save(output)
    print(f"Presentasi berhasil disimpan: {output}")
    print(f"Total slide: {len(prs.slides)}")


if __name__ == "__main__":
    main()
