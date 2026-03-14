# Atom Magic — Figma Design System

This document defines the token structure for the Atom Magic Figma design system. Values are sourced from `src/app/globals.css` and `src/tailwind.config.ts` and should stay in sync with the codebase.

---

## Figma Variables

### Collection 1: Primitives
*No modes — raw palette values. Reference these from the Theme collection.*

#### Group: Gold
| Variable | Value |
|----------|-------|
| `gold/base` | `#BB9731` |
| `gold/dark` | `#836A22` |
| `gold/bright` | `#E2B944` |
| `gold/dark-mode-base` | `#D4AF37` |
| `gold/dark-mode-dark` | `#E2B944` |
| `gold/dark-mode-bright` | `#F0CC5B` |

#### Group: Accent
| Variable | Value |
|----------|-------|
| `accent/oxblood` | `#722F37` |
| `accent/oxblood-light` | `#8B3A42` |
| `accent/laurel` | `#5A6F4E` |
| `accent/laurel-light` | `#6B8260` |
| `accent/bronze` | `#8C7853` |
| `accent/bronze-light` | `#A69066` |

#### Group: Neutral
| Variable | Value |
|----------|-------|
| `neutral/stone` | `#9A9A8E` |
| `neutral/stone-light` | `#B5B5A8` |
| `neutral/stone-dark` | `#6B6B62` |
| `neutral/parchment` | `#F5F0E1` |
| `neutral/parchment-dark` | `#E8E0CC` |
| `neutral/black` | `#231F20` |
| `neutral/black-lighter` | `#3E3A36` |
| `neutral/white` | `#FFFFF0` |

#### Group: Dark Surface
| Variable | Value |
|----------|-------|
| `dark-surface/bg` | `#1A1816` |
| `dark-surface/bg-alt` | `#252220` |
| `dark-surface/bg-elevated` | `#2E2A27` |
| `dark-surface/parchment` | `#2E2A27` |
| `dark-surface/parchment-dark` | `#252220` |

---

### Collection 2: Theme
*Two modes: **Light** and **Dark**. Reference Primitives values here.*

#### Group: Background
| Variable | Light | Dark |
|----------|-------|------|
| `background/page` | `#F5F0E1` | `#1A1816` |
| `background/alt` | `#E8E0CC` | `#252220` |
| `background/elevated` | `#FFFFF0` | `#2E2A27` |

#### Group: Text
| Variable | Light | Dark |
|----------|-------|------|
| `text/default` | `#231F20` | `#E8E0CC` |
| `text/muted` | `#6B6B62` | `#9A9A8E` |

#### Group: Border
| Variable | Light | Dark |
|----------|-------|------|
| `border/default` | `#9A9A8E` | `#4A4642` |
| `border/subtle` | `#9A9A8E` at 30% opacity | `#4A4642` at 50% opacity |

#### Group: Gold
| Variable | Light | Dark |
|----------|-------|------|
| `gold/default` | `#BB9731` | `#D4AF37` |
| `gold/dark` | `#836A22` | `#E2B944` |
| `gold/bright` | `#E2B944` | `#F0CC5B` |

#### Group: Accent
*Same value in both modes.*

| Variable | Light | Dark |
|----------|-------|------|
| `accent/oxblood` | `#722F37` | `#722F37` |
| `accent/laurel` | `#5A6F4E` | `#5A6F4E` |
| `accent/bronze` | `#8C7853` | `#8C7853` |

---

### Collection 3: Spacing
*Maps directly to Tailwind's spacing scale used throughout the project.*

| Variable | Value | Tailwind equivalent |
|----------|-------|---------------------|
| `spacing/xs` | `4px` | `gap-1`, `p-1` |
| `spacing/sm` | `8px` | `gap-2`, `p-2` |
| `spacing/md` | `16px` | `gap-4`, `p-4` |
| `spacing/lg` | `24px` | `gap-6`, `p-6` |
| `spacing/xl` | `32px` | `gap-8`, `p-8` |
| `spacing/2xl` | `48px` | `py-12` (section padding) |
| `spacing/3xl` | `64px` | `py-16` (section padding large) |

---

## Figma Text Styles
*Create as Figma Text Styles, not Variables.*

| Style name | Font | Weight | Notes |
|------------|------|--------|-------|
| `Heading/Display` | Marcellus SC | Regular | Page titles, hero text |
| `Heading/Section` | Marcellus SC | Regular | Section headers |
| `Heading/Card` | Marcellus SC | Regular | Card and panel titles |
| `Label/Default` | Marcellus SC | Regular | Uppercase UI labels, buttons |
| `Body/Default` | Noto Serif | Regular | Main body text |
| `Body/Small` | Noto Serif | Regular | Secondary and caption text |
| `Decorative` | Lapideum | Regular | Letter-spacing 0.35em — inscriptions only |

---

## Design Principles

- **No rounded corners** — the classical aesthetic uses sharp edges only (`radius="none"` on all HeroUI components)
- **Borders over shadows** — cards use `border-2` rather than drop shadows
- **Gold as primary action color** — buttons, links, and highlights default to gold, not blue
- **Parchment as the page background** — content areas are `#F5F0E1` light / `#1A1816` dark
- **Black sections for contrast** — hero areas and footers use near-black (`#231F20`) with gold accents

## Codebase References

| What | File |
|------|------|
| CSS custom properties (`--color-*`) | `src/app/globals.css` — `@theme` block |
| Tailwind color tokens | `src/tailwind.config.ts` |
| Dark mode theme variables (`--theme-*`) | `src/app/globals.css` — `:root` and `.dark` blocks |
| Common gradients | `src/app/globals.css` — `.gold-gradient`, `.classical-gradient`, etc. |
| Font loading | `src/app/(website)/layout.tsx` |
