---
name: pptx
description: Generate professional PPTX presentations using python-pptx. Supports dark/light themes, custom color palettes, icon-rich slides, charts, diagrams, and multi-slide layouts. Use this skill whenever the user asks to create a presentation, slides, or a .pptx file.
---

# PPTX Skill

This skill enables the agent to generate rich, professional `.pptx` PowerPoint presentations programmatically using **python-pptx**.

---

## 1. Setup

Before generating a PPTX, ensure `python-pptx` is installed:

```bash
pip install python-pptx -q
```

Always run the generator script with UTF-8 mode on Windows to avoid emoji encoding errors:

```bash
python -X utf8 <script_name>.py
```

---

## 2. Workflow

1. **Understand** the topic, audience, and desired number of slides.
2. **Copy** `scripts/pptx_base.py` as the starting template.
3. **Customize** colors, content, and slide functions.
4. **Run** with `python -X utf8 <script>.py`.
5. **Verify** the file was created and report the path to the user.

---

## 3. Core Concepts

### Slide Size
Always set slide dimensions explicitly (default is 10×7 inches = widescreen 16:10):
```python
prs.slide_width  = Inches(10)
prs.slide_height = Inches(7)
```

### Blank Layout
Always use layout index `6` (blank) for full creative control:
```python
slide = prs.slides.add_slide(prs.slide_layouts[6])
```

### Background Color
```python
def set_bg(slide, color: RGBColor):
    bg = slide.background
    fill = bg.fill
    fill.solid()
    fill.fore_color.rgb = color
```

### Shape Types (MSO constants as integers)
```python
MSO_RECT = 1   # Rectangle
MSO_OVAL = 9   # Oval/Circle
```

### Text Box
```python
txBox = slide.shapes.add_textbox(Inches(left), Inches(top), Inches(width), Inches(height))
tf = txBox.text_frame
tf.word_wrap = True
p = tf.paragraphs[0]
p.alignment = PP_ALIGN.CENTER  # or LEFT, RIGHT
run = p.add_run()
run.text = "Your text"
run.font.size = Pt(24)
run.font.bold = True
run.font.color.rgb = RGBColor(0xff, 0xff, 0xff)
run.font.name = "Segoe UI"
```

### Rectangle Shape
```python
shape = slide.shapes.add_shape(
    MSO_RECT,
    Inches(left), Inches(top), Inches(width), Inches(height)
)
shape.fill.solid()
shape.fill.fore_color.rgb = RGBColor(0x1f, 0x2c, 0x34)
shape.line.color.rgb = RGBColor(0x00, 0xa8, 0x84)
shape.line.width = Pt(1.5)
```

### Adding Multiple Paragraphs to a Text Frame
```python
p2 = tf.add_paragraph()
p2.space_before = Pt(6)
run2 = p2.add_run()
run2.text = "Second paragraph"
run2.font.size = Pt(14)
run2.font.color.rgb = RGBColor(0xc0, 0xc9, 0xd0)
```

---

## 4. Color Palette Reference

### Dark Theme (WhatsApp-style)
```python
BG_DARK      = RGBColor(0x0b, 0x14, 0x1a)
BG_CARD      = RGBColor(0x1f, 0x2c, 0x34)
ACCENT_GREEN = RGBColor(0x00, 0xa8, 0x84)
ACCENT_TEAL  = RGBColor(0x00, 0x5c, 0x4b)
ACCENT_BLUE  = RGBColor(0x53, 0xbd, 0xeb)
WHITE        = RGBColor(0xff, 0xff, 0xff)
LIGHT_GRAY   = RGBColor(0xc0, 0xc9, 0xd0)
YELLOW       = RGBColor(0xff, 0xd7, 0x4e)
ORANGE       = RGBColor(0xff, 0x6b, 0x35)
```

### Light/Corporate Theme
```python
BG_WHITE     = RGBColor(0xff, 0xff, 0xff)
BG_LIGHT     = RGBColor(0xf4, 0xf6, 0xf9)
PRIMARY      = RGBColor(0x1a, 0x73, 0xe8)
SECONDARY    = RGBColor(0x34, 0xa8, 0x53)
DARK_TEXT    = RGBColor(0x1c, 0x1c, 0x1c)
GRAY_TEXT    = RGBColor(0x5f, 0x6b, 0x7c)
ACCENT_RED   = RGBColor(0xea, 0x43, 0x35)
ACCENT_GOLD  = RGBColor(0xfb, 0xbc, 0x04)
```

---

## 5. Common Slide Patterns

### Cover Slide
- Full-bleed background color
- Centered icon/logo (oval shape)
- Large bold title (Pt 34–40)
- Subtitle in accent color (Pt 14–18)
- Accent bar at top and bottom

### Content Slide with Cards
- Header bar (BG_CARD, full width)
- Title + subtitle in header
- Grid of cards with left accent bars
- Footer accent bar

### Timeline / Steps Slide
- Numbered circles (oval shapes) on the left
- Vertical connecting line between circles
- Card per step on the right

### Comparison Slide (2 columns)
- Two equal-width cards side by side
- Different accent colors per column
- Pros/cons or option A vs B layout

### Architecture Diagram Slide
- Box for each component
- Arrow/label text boxes between them
- Highlight P2P or direct paths differently

---

## 6. Important Rules

1. **Always use `python -X utf8`** when running on Windows — emoji in print() will crash otherwise.
2. **Never use `prs.slide_layouts[0]` through `[5]`** — always use `[6]` (blank) for full control.
3. **Use `shape.line.fill.background()`** to make a shape border invisible.
4. **Use `shape.fill.background()`** to make a shape fill transparent.
5. **Avoid overlapping z-order issues** — add background shapes before foreground shapes.
6. **Save path** should use raw string `r"C:\..."` or forward slashes on Windows.
7. **Slide count**: Aim for 8–12 slides for a complete presentation.
8. **Font choices**: `Segoe UI` for body, `Consolas` for code blocks.

---

## 7. File Naming Convention

```
Presentasi_<TopikUtama>_<Tahun>.pptx
```

Example: `Presentasi_MQTT_WhatsApp_Clone.pptx`

Save the output PPTX file in the project root directory unless specified otherwise.

---

## 8. References

- See `scripts/pptx_base.py` for a complete, ready-to-use template.
- See `examples/` for sample slide function implementations.
