---
name: Taskora
colors:
  surface: '#f9f9ff'
  surface-dim: '#d3daea'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eefe'
  surface-container-high: '#e2e8f8'
  surface-container-highest: '#dce2f3'
  on-surface: '#151c27'
  on-surface-variant: '#4a4455'
  inverse-surface: '#2a313d'
  inverse-on-surface: '#ebf1ff'
  outline: '#7b7486'
  outline-variant: '#ccc3d7'
  surface-tint: '#7331df'
  primary: '#5300b7'
  on-primary: '#ffffff'
  primary-container: '#6d28d9'
  on-primary-container: '#dac5ff'
  inverse-primary: '#d3bbff'
  secondary: '#6b38d4'
  on-secondary: '#ffffff'
  secondary-container: '#8455ef'
  on-secondary-container: '#fffbff'
  tertiary: '#003e89'
  on-tertiary: '#ffffff'
  tertiary-container: '#0054b6'
  on-tertiary-container: '#baceff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ebddff'
  primary-fixed-dim: '#d3bbff'
  on-primary-fixed: '#250059'
  on-primary-fixed-variant: '#5b00c5'
  secondary-fixed: '#e9ddff'
  secondary-fixed-dim: '#d0bcff'
  on-secondary-fixed: '#23005c'
  on-secondary-fixed-variant: '#5516be'
  tertiary-fixed: '#d8e2ff'
  tertiary-fixed-dim: '#adc6ff'
  on-tertiary-fixed: '#001a42'
  on-tertiary-fixed-variant: '#004395'
  background: '#f9f9ff'
  on-background: '#151c27'
  surface-variant: '#dce2f3'
typography:
  display:
    fontFamily: Plus Jakarta Sans
    fontSize: 3rem
    fontWeight: '700'
    lineHeight: 3.5rem
    letterSpacing: -0.03em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 2rem
    fontWeight: '600'
    lineHeight: 2.5rem
    letterSpacing: -0.025em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.625rem
    fontWeight: '600'
    lineHeight: 2rem
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.375rem
    fontWeight: '600'
    lineHeight: 1.75rem
    letterSpacing: -0.02em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.125rem
    fontWeight: '600'
    lineHeight: 1.5rem
    letterSpacing: -0.015em
  title:
    fontFamily: Inter
    fontSize: 1rem
    fontWeight: '500'
    lineHeight: 1.5rem
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 1rem
    fontWeight: '400'
    lineHeight: 1.625rem
    letterSpacing: -0.005em
  body-md:
    fontFamily: Inter
    fontSize: 0.875rem
    fontWeight: '400'
    lineHeight: 1.375rem
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 0.75rem
    fontWeight: '400'
    lineHeight: 1.125rem
    letterSpacing: 0em
  label-md:
    fontFamily: Inter
    fontSize: 0.8125rem
    fontWeight: '500'
    lineHeight: 1rem
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 0.6875rem
    fontWeight: '600'
    lineHeight: 0.875rem
    letterSpacing: 0.03em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1.25rem
  space-xl: 2rem
---

## Brand & Style

This design system embodies the focused restraint and quiet precision of high-tier modern productivity software. Drawing from the architectural clarity of tools like Linear and the serene tactility of Things 3, the design direction fuses **Minimalist Calm** with **Modern SaaS Elegance**. 

The target audience consists of design-conscious professionals, product teams, and high-output knowledge workers who spend hours inside task management workflows. The UI must invoke absolute cognitive clarity, control, and visual delight without sensory overload. 

Key attributes:
- **Atmospheric Warmth:** Surfaces are never clinical pure-white sheets; they rest upon gentle, tinted atmospheric washes of pale lavender mist.
- **Micro-Precision:** Every divider, pill, tag, and focus state exists with deliberate intent. Hairline borders and subtle surface changes define structure rather than heavy strokes.
- **Intentional Contrast:** Deep saturated violet directs velocity and priority, allowing secondary metadata to recede gracefully into neutral graphite tones until hovered or engaged.

## Colors

The palette is engineered to maintain high contrast accessibility while preserving an airy, ethereal lavender atmosphere. 

### Palette Architecture
- **Primary (`#6D28D9` / `#7C3AED`):** The signature vibrant violet. Reserved strictly for key action triggers, active tab indicators, primary status glyphs, and high-impact completion states.
- **Secondary (`#8B5CF6`):** Soft luminous purple for secondary highlights, hover washes, and selected row highlights.
- **Tertiary (`#3B82F6`):** Controlled clear blue for collaborative cues, active syncs, and integration tags.
- **Neutral (`#6B7280`):** Muted slate-graphite ensuring legibility without harsh black-on-white vibration.

### Canvas & Surface Hierarchy
- **Canvas Base:** `#F4F2FB` provides an enveloping, low-strain backdrop.
- **Surface Elevation 1 (Cards, Sidebars, Modals):** `#FFFFFF` layered against the lavender canvas provides immediate crisp structural separation.
- **Surface Elevation 2 (Active/Hover Containers):** `#EAE5F8` for subtle inset fills, pill backgrounds, and grouped item headers.
- **Hairline Dividers:** `#E5DEFF` at 50–70% opacity for ultra-soft separation.

### Priority & Status System
- **High Priority / Critical:** Muted rose (`#E11D48`) on translucent blush (`#FFE4E6`).
- **Medium Priority / In Flight:** Warm amber (`#D97706`) on gentle straw (`#FEF3C7`).
- **Low Priority / Steady:** Crisp emerald (`#059669`) on mint wash (`#D1FAE5`).
- **Archived / Dormant:** Neutral stone (`#71717A`) on pearl gray (`#F4F4F5`).

## Typography

The typographic hierarchy pairs the contemporary, sculpted personality of **Plus Jakarta Sans** for prominent section headers and titles with the disciplined neutral metric rhythm of **Inter** for dense task listings, data grids, and interactive labels.

### Usage Principles
- **Headlines & Section Framing:** Set in Plus Jakarta Sans with negative tracking to generate a tailored, confident editorial touch.
- **Task Titles & Prose:** Set in Inter with regular weights (`400` and `500`) to guarantee high-scan legibility in dense list views.
- **Labels, Badges, and Metadata:** Set in Inter Medium (`500`) and SemiBold (`600`) with micro-positive tracking for badges, keyboard shortcut glyphs, and column titles.

## Layout & Spacing

The layout operates on a hybrid workspace structure:
- **Left Panel (Navigation & Views):** Fixed-to-collapsible rail (240px wide on desktop).
- **Workspace Center:** Fluid multi-column canvas adapting across screen widths, utilizing an 8pt base grid for all vertical and horizontal intervals.
- **Context Drawer / Inspector:** Collapsible sheet docking right (360px wide).

### Breakpoints & Adaptability
- **Desktop (≥ 1280px):** 3-pane visibility enabled (Nav, Main Task Matrix, Item Inspector). Outer container margins set to `margin` (2rem) with `gutter` (1.5rem).
- **Tablet (768px – 1279px):** Inspector transforms into an overlay drawer. Navigation rail collapses to an icon bar (64px). Task view preserves full breathing room.
- **Mobile (< 768px):** Single-column stack. Sidebars transition to gesture-controlled bottom sheets. Horizontal page margin reduces to `margin-mobile` (1rem). Touch targets default to a strict minimum 44px height.

## Elevation & Depth

Visual depth is achieved through **tonal separation, subtle frosted glass layers, and soft violet-tinted ambient shadows**, intentionally avoiding dark gray or black drop shadows.

### Elevation Hierarchy
- **Level 0 (App Canvas):** Flat tinted lavender base (`#F4F2FB`).
- **Level 1 (Cards, Content Panes):** Pure white fill (`#FFFFFF`) with a 1px border of `#E5DEFF` at 50% opacity, paired with an ambient shadow: `0 1px 3px 0 rgba(109, 40, 217, 0.04), 0 1px 2px -1px rgba(109, 40, 217, 0.02)`.
- **Level 2 (Hover States, Flyouts, Popovers):** Elevated card appearance: `0 10px 25px -5px rgba(109, 40, 217, 0.07), 0 8px 10px -6px rgba(109, 40, 217, 0.04)`.
- **Level 3 (Modal Overlays & Quick-Command Palettes):** Crisp centered modals over a blurred scrim (`rgba(244, 242, 251, 0.7)` with `backdrop-blur-md`). Ambient spread: `0 20px 40px -15px rgba(91, 33, 182, 0.12)`.

## Shapes

The design system maintains a balanced, friendly geometric softness that feels modern and crafted. 

- **Primary interactive elements (Buttons, Inputs, Row Selectors):** Base roundedness of `0.5rem` (`rounded-md`).
- **Cards, Panels, and Group Containers:** Large curvature (`rounded-xl` / `1rem` and `rounded-2xl` / `1.5rem`) to frame structured work cleanly.
- **Badges, Status Tags, and Checkboxes:** Tags and pills employ fully rounded geometries (`rounded-full`), while checkboxes feature a tailored soft curve (`rounded-md` / 6px) to match the card corners.

## Components

### Buttons
- **Primary:** Filled violet (`#6D28D9`), hovering to `#5B21B6`. White text, subtle upper glow highlight on border. Transitions are rapid: 150ms ease-out.
- **Secondary:** Surface white background with `#DDD6FE` border. Text in `#4C1D95`. Hovers into a light `#F5F3FF` tint.
- **Ghost / Action Icon:** Transparent background with neutral glyphs (`#6B7280`), shifting to violet fill tint (`#EDE9FE`) and deep violet text on hover.

### Task Checkboxes & Radio Controls
- Circular-square hybrid (`6px` border-radius).
- Unchecked: 1.5px border of `#C4B5FD` over white background.
- Checked: Snappy scale micro-animation, filling with deep violet (`#6D28D9`) displaying a crisp white micro-checkmark. Text title simultaneously shifts to neutral strike-through styling.

### Input Fields & Search (Linear-style Quick Find)
- Background: `#FFFFFF`. Border: 1px solid `#E5DEFF`.
- Inactive text: `#9CA3AF`.
- Focus state: Border color changes to `#7C3AED` with an outer soft atmospheric halo: `box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.12)`. No harsh browser outlines.

### Priority & Status Chips
- Pill geometry with padding `0.25rem 0.625rem`.
- Structure: Soft tinted fill (`15%` opacity) paired with high-contrast text and a 6px status dot.
- High: `#FFE4E6` background, `#BE123C` text, `#F43F5E` dot.
- Medium: `#FEF3C7` background, `#B45309` text, `#F59E0B` dot.
- Low: `#D1FAE5` background, `#047857` text, `#10B981` dot.

### Cards & Task Rows
- Task cards in Kanban or List view use white backgrounds with hairline `#EDE9FE` borders.
- Hover brings a smooth translateY(-1px) offset with soft violet shadow intensification.
- Drag-and-drop state renders an active tilt (1.5deg) and an elevated Level 2 shadow.

### Modals & Command Bar
- Command palette (Quick Actions `Cmd+K`) centered with width 640px, floating at Level 3 elevation.
- Frosted top bar with nested search icon, followed by a divided keyboard navigable list with `#F5F3FF` selected states and crisp shortcut tags (`Kbd`) styled with border-inset lavender edges.