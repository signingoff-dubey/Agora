# Design Formats — Agora UI Design System

> Single source of truth for all UI design decisions. All frontend components must reference this file.

---

## Color Palette

| Role | Color | Hex Code |
|------|------|----------|
| Primary | Deep Indigo | `#4F46E5` |
| Primary Hover | Indigo 600 | `#4338CA` |
| Secondary | Slate | `#64748B` |
| Background | Near Black | `#0F172A` |
| Surface | Slate 900 | `#1E293B` |
| Surface Elevated | Slate 800 | `#334155` |
| Accent | Emerald | `#10B981` |
| Error | Rose | `#F43F5E` |
| Warning | Amber | `#F59E0B` |
| Text Primary | White | `#FFFFFF` |
| Text Secondary | Slate 300 | `#CBD5E1` |
| Text Muted | Slate 500 | `#64748B` |
| Border | Slate 700 | `#334155` |

---

## Agent Colors

| Agent | Color | Hex Code |
|-------|------|----------|
| Agent 1 | Cyan | `#06B6D4` |
| Agent 2 | Violet | `#8B5CF6` |
| Agent 3 | Amber | `#F59E0B` |
| Agent 4 | Rose | `#F43F5E` |
| Agent 5 | Emerald | `#10B981` |
| Synthesizer | White | `#FFFFFF` |

---

## Typography

| Element | Font Family | Size | Weight |
|---------|-----------|------|--------|
| Logo | Inter | 24px | 700 |
| H1 | Inter | 28px | 700 |
| H2 | Inter | 22px | 600 |
| H3 | Inter | 18px | 600 |
| Body | Inter | 15px | 400 |
| Body Small | Inter | 13px | 400 |
| Label | Inter | 12px | 500 |
| Code | JetBrains Mono | 14px | 400 |

---

## Spacing Scale

| Token | Value |
|-------|-------|
| xs | 4px |
| sm | 8px |
| md | 16px |
| lg | 24px |
| xl | 32px |
| 2xl | 48px |

---

## Border Radius

| Token | Value |
|-------|-------|
| sm | 4px |
| md | 8px |
| lg | 12px |
| xl | 16px |
| full | 9999px |

---

## Shadows

| Level | CSS |
|-------|-----|
| sm | `0 1px 2px rgba(0, 0, 0, 0.3)` |
| md | `0 4px 6px rgba(0, 0, 0, 0.4)` |
| lg | `0 10px 15px rgba(0, 0, 0, 0.5)` |
| glow | `0 0 20px rgba(79, 70, 229, 0.4)` |

---

## Component Specifications

### Agent Card

- Width: 160px
- Min Height: 72px
- Padding: 12px
- Background: Surface (#1E293B)
- Border: 1px solid Border (#334155)
- Border Radius: lg (12px)
- Shadow: md

### Chat Bubble / Agent Entry Card

- Max Width: 80%
- Padding: 16px
- Background: Surface (#1E293B)
- Border: 1px solid Border (#334155)
- Border Left: 3px solid (Agent Color)
- Border Radius: lg (12px)

### Thinking Indicator

- Three dots: ● ● ●
- Size: 8px each
- Spacing: 6px between
- Animation: Sequential pulse (400ms each, 200ms offset)

### Input Bar

- Height: 48px
- Padding: 0 16px
- Background: Surface (#1E293B)
- Border: 1px solid Border (#334155)
- Border Radius: lg (12px)

### Run/Send Button

- Size: 48px x 48px
- Background: Primary (#4F46E5)
- Border Radius: lg (12px)
- Icon: Play triangle, white, 20px

### Mindmap Node

- Min Width: 120px
- Padding: 12px 16px
- Background: Surface (#1E293B)
- Border: 2px solid (Agent Color)
- Border Radius: lg (12px)

---

## Animations

| Animation | Duration | Trigger |
|-----------|----------|---------|
| Thinking dots pulse | 400ms x 3 sequential | Agent mid-inference |
| Board update flash | 300ms | New entry added |
| Card slide in | 200ms | Entry appears |
| Mindmap edge draw | 500ms | Edge created |
| Button hover | 150ms | Mouse enter |
| Modal fade in/out | 200ms / 150ms | Open/close modal |

---

## Responsive Breakpoints

| Breakpoint | Width |
|------------|------|
| Mobile | < 640px |
| Tablet | 640px - 1024px |
| Desktop | > 1024px |

---

## Usage

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

:root {
  --primary: #4F46E5;
  --background: #0F172A;
  --surface: #1E293B;
  --surface-elevated: #334155;
  --text-primary: #FFFFFF;
  --text-secondary: #CBD5E1;
  --text-muted: #64748B;
  --border: #334155;
}
```