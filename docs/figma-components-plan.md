# Figma Component Building Plan

A step-by-step guide for building every reusable component in the Atom Magic Figma design system. All components should use variables from the **Atom Magic — Design System** file. Use auto-layout on everything — no fixed-position layers. No corner radius (classical aesthetic).

---

## Build Order

1. Badge/Challenge → Badge/Status
2. Icon/Label
3. ThemeToggle
4. Button/Primary → Button/Function
5. Status/Message
6. Nav/Item
7. Card/Character Summary → Card/Creature (Compact)
8. Card/Content → Card/Marketing
9. NavBar → Footer
10. PageHero

---

## Layer 1: Atoms

### 1. Button/Primary

**Component properties:**
| Property | Type | Values |
|----------|------|--------|
| `Label` | Text | "Button Label" |
| `Icon` | Instance swap | MDI icon (optional) |
| `Icon Position` | Variant | `Left` \| `Right` \| `None` |
| `State` | Variant | `Default` \| `Hover` \| `Disabled` |
| `Variant` | Variant | `Primary` \| `Secondary` \| `Danger` |

**Specs:**
- Auto-layout horizontal, padding 12px top/bottom, 32px left/right
- Marcellus SC, uppercase, letter-spacing wide, 14px
- No corner radius
- **Primary:** fill `gold/default`, label `neutral/black`
- **Secondary:** stroke `gold/default` 2px, label `gold/default`, no fill
- **Danger:** fill `accent/oxblood`, label `neutral/white`
- **Hover — Primary:** fill → `gold/bright`
- **Hover — Secondary:** fill `gold/default` 10% opacity
- **Disabled:** 50% opacity on whole component

---

### 2. Button/Function

Extends Button/Primary with additional variants for internal UI controls.

**Additional `Variant` values:** `Ghost` \| `Chip` \| `Tab` \| `Toggle`

| Variant | Default | Active |
|---------|---------|--------|
| Ghost | no fill/stroke, label `text/muted` | label `gold/default` |
| Chip | stroke `border/default`, label `text/muted` | fill `accent/bronze` 20%, stroke `accent/bronze`, label `accent/bronze` |
| Tab | stroke `border/default`, label `text/muted` | fill `gold/default`, stroke `gold/default`, label `neutral/black` |
| Toggle | stroke `border/default`, 40×40px icon-only square | stroke `gold/default`, fill `gold/default` 10% |

**Additional `Size` variant:** `SM` \| `MD` \| `LG`
- SM: padding 6px/12px, icon 14px
- MD: padding 12px/24px, icon 16px
- LG: padding 16px/32px, icon 18px

---

### 3. Icon/Label

Inline icon + text pair used in stat displays throughout the UI.

**Component properties:**
| Property | Type | Values |
|----------|------|--------|
| `Icon` | Instance swap | MDI icon |
| `Show Label` | Boolean | prefix label text |
| `Label Text` | Text | e.g. "Shield:" |
| `Value` | Text | e.g. "12" |
| `Icon Color` | Variant | `Gold` \| `Oxblood` \| `Bronze` \| `Laurel` \| `Stone` |
| `Size` | Variant | `XS` \| `SM` \| `MD` \| `LG` |

**Size specs:**
- XS: 12px icon, text-xs (10px)
- SM: 14px icon, text-sm (12px)
- MD: 16px icon, text-base (14px)
- LG: 20px icon, text-lg (18px)

**Specs:**
- Auto-layout horizontal, gap 4px (SM), scales with size
- Label prefix in `text/muted`, value in `text/default`

---

### 4. Badge/Challenge

Colored inline badge for creature challenge ratings.

**Component properties:**
| Property | Type | Values |
|----------|------|--------|
| `Level` | Variant | `Harmless` \| `Trivial` \| `Easy` \| `Moderate` \| `Hard` \| `Deadly` |
| `Label` | Text | Challenge level name |

**Color per level:**
| Level | Fill | Label Color |
|-------|------|-------------|
| Harmless | `neutral/stone` 10% | `text/muted` |
| Trivial | `neutral/stone` 20% | `text/muted` |
| Easy | `accent/laurel` 20% | `accent/laurel` |
| Moderate | `gold/default` 20% | `gold/default` |
| Hard | `accent/bronze` 20% | `accent/bronze` |
| Deadly | `accent/oxblood` 20% | `accent/oxblood` |

**Specs:**
- Auto-layout horizontal, padding 4px/8px, no radius
- Noto Serif 12px, stroke `border/subtle` 1px

---

### 5. Badge/Status

Generic status label for creature type, "Active" user indicator, etc.

**Component properties:**
| Property | Type | Values |
|----------|------|--------|
| `Label` | Text | Badge text |
| `Color` | Variant | `Gold` \| `Stone` \| `Oxblood` \| `Laurel` \| `Bronze` \| `Black` |
| `Size` | Variant | `SM` \| `MD` |

**Specs:** Same shape as Badge/Challenge, manual color control. SM: 11px, MD: 13px.

---

### 6. ThemeToggle

Single icon-only button, no text.

**Component properties:**
| Property | Type | Values |
|----------|------|--------|
| `Theme` | Variant | `Light` \| `Dark` |
| `State` | Variant | `Default` \| `Hover` |

**Specs:**
- 36×36px, no fill, no stroke
- Light mode: sun icon, `text/muted`
- Dark mode: moon icon, `text/muted`
- Hover: `gold/default`

---

## Layer 2: Molecules

### 7. Card/Content

Interactive link card used on the homepage and tools pages.

**Component properties:**
| Property | Type | Values |
|----------|------|--------|
| `Title` | Text | Card title |
| `Description` | Text | Supporting description |
| `Show Icon` | Boolean | — |
| `Show Description` | Boolean | — |
| `Show Arrow` | Boolean | Default true |
| `Icon` | Instance swap | MDI icon |
| `Accent Color` | Variant | `Gold` \| `Oxblood` \| `Laurel` \| `Bronze` \| `Stone` |
| `Size` | Variant | `Default` \| `Compact` \| `Large` |
| `State` | Variant | `Default` \| `Hover` |

**Specs:**
- Stroke `border/default` 2px, no radius
- Top accent line: 1px, color matches Accent Color — grows to 4px on Hover state
- Padding: Default 24–32px, Compact 16px
- Auto-layout vertical, gap 12px
- Icon in a small bordered square (~32px), color-matched border
- Title: Marcellus SC 18–20px, `text/default`; Hover → `gold/default`
- Description: Noto Serif 14px, `text/muted`
- Bottom row: "Enter" text + → arrow, `text/muted`; Hover state: arrow translate right
- **Hover state:** border → `gold/default`, title → `gold/default`, accent line full width

---

### 8. Card/Marketing

Image-top card used on the homepage feature section.

**Component properties:**
| Property | Type | Values |
|----------|------|--------|
| `Title` | Text | Card title |
| `Description` | Text | Supporting description |
| `Button Label` | Text | CTA text |
| `Button Variant` | Variant | `Primary` \| `Secondary` |

**Specs:**
- Stroke `border/default` 2px, no radius
- Image container: 160px tall, image fills as cover (replace content, not a property)
- Content area: p-16px, auto-layout vertical, gap 12px
- Marcellus SC title, Noto Serif description
- Button/Primary instance at bottom

---

### 9. Card/Character Summary

Roster list item — used in the character roster sidebar.

**Component properties:**
| Property | Type | Values |
|----------|------|--------|
| `Name` | Text | Character name |
| `Path` | Text | Path name |
| `Culture` | Text | Culture name |
| `Patronage` | Text | Patronage (truncated) |
| `Physical Shield` | Text | Numeric value |
| `Psychic Shield` | Text | Numeric value |
| `AC` | Text | Armor Capacity value |
| `Disciplines` | Text | Count |
| `Techniques` | Text | Count |
| `Complete` | Boolean | check-circle vs progress-clock icon |
| `State` | Variant | `Default` \| `Active` |

**Specs:**
- Stroke 2px; Default: `border/subtle`; Active: `gold/default` with `gold/default` 5% fill
- p-16px, auto-layout vertical, gap 8px
- Top row: Name (Marcellus SC 20px, truncated) + status icon right-aligned
- Sub-row: "Path · Culture" (Noto Serif 14px, `text/muted`)
- "Active" Badge/Status (gold) — visible only in Active state
- Stats row: 5× Icon/Label SM instances spaced evenly

---

### 10. Card/Creature (Compact)

Custom creature roster item — analogous to Card/Character Summary.

**Component properties:**
| Property | Type | Values |
|----------|------|--------|
| `Name` | Text | Creature name |
| `Type` | Text | Creature type |
| `Health` | Text | HP value |
| `Attacks` | Text | Attack count |
| `Abilities` | Text | Ability count |
| `Challenge Level` | Variant | Matches Badge/Challenge levels |
| `State` | Variant | `Default` \| `Active` |

**Specs:**
- Stroke 2px; Inactive: `border/default` 50% opacity; Active: `border/default` + white fill
- Active: 4px wide `accent/bronze` left accent bar (full height), only visible when Active
- p-16px, auto-layout horizontal, gap 12px
- Content column: auto-layout vertical — name + badge row + type text (xs, `text/muted`) + stats row

---

### 11. Status/Message

Alert banner in four flavors, two sizes.

**Component properties:**
| Property | Type | Values |
|----------|------|--------|
| `Variant` | Variant | `Success` \| `Error` \| `Warning` \| `Info` |
| `Size` | Variant | `Inline` \| `Full` |
| `Message` | Text | Main message text |
| `Title` | Text | Title (Full size only) |
| `Show Action` | Boolean | Optional action slot below message |

**Color mapping:**
| Variant | Border | Icon | Fill |
|---------|--------|------|------|
| Success | `accent/laurel` | check-circle, laurel | laurel 5% |
| Error | `accent/oxblood` | alert-circle, oxblood | oxblood 5% |
| Warning | `accent/bronze` | alert, bronze | bronze 5% |
| Info | `gold/default` | information, gold | gold 5% |

**Specs:**
- Inline: horizontal auto-layout, p-16px, 4px left border, icon + message text
- Full: vertical centered, p-32px, 2× icon size, title (Marcellus), message (Noto Serif), optional action slot

---

### 12. Nav/Item

Single navigation link — used in NavBar and Footer.

**Component properties:**
| Property | Type | Values |
|----------|------|--------|
| `Label` | Text | Nav link text |
| `State` | Variant | `Default` \| `Active` \| `Hover` |
| `Extended` | Boolean | Shows underline in active state |

**Specs:**
- Marcellus SC, 16px, uppercase, letter-spacing wide
- Default: `text/muted`
- Active: `gold/default` + border-b-2 `gold/default` (if Extended = true)
- Hover: `gold/default`
- No fill or background

---

## Layer 3: Organisms

### 13. PageHero

The primary hero component — appears at the top of every page.

**Component properties:**
| Property | Type | Values |
|----------|------|--------|
| `Variant` | Variant | `Full` \| `Compact` \| `Inline` |
| `Theme` | Variant | `Dark` \| `Light` |
| `Accent Color` | Variant | `Gold` \| `Oxblood` \| `Laurel` \| `Bronze` \| `Stone` |
| `Title` | Text | Page title |
| `Description` | Text | Supporting description |
| `Show Description` | Boolean | — |
| `Show CTA` | Boolean | — |
| `CTA Label` | Text | CTA button label |
| `Icon` | Instance swap | MDI icon |

**Specs:**
- Full width, auto-layout vertical centered
- 1px top accent line in chosen Accent Color
- Background: diagonal stripe pattern at 3% opacity (use a fine line fill)
- **Full variant:** py 48–64px, icon 64×64px in accent-bordered box, Marcellus SC title 36–48px, diamond divider below icon, Noto Serif description 18px, Button/Primary CTA at bottom
- **Compact variant:** py-16px, horizontal auto-layout, icon 40×40px left, title right — used when page has scrolled
- **Inline variant:** py 32–48px, icon 48×48px, title 28px, no diamond divider — for tool pages
- **Dark theme:** fill `dark-surface/bg`, title `neutral/white`, description `text/muted`
- **Light theme:** fill `background/page`, title `text/default`, description `text/muted`

**Page-to-variant mapping:**
| Page | Accent | Variant | Theme |
|------|--------|---------|-------|
| Character Manager | Oxblood | Full/Compact | Dark |
| Vorago | Laurel | Full/Compact | Dark |
| Codex | Gold | Full | Light |
| Timeline | Laurel | Full | Light |
| Creatures / Creature Manager | Bronze | Full | Dark |
| Encounters | Bronze | Full | Dark |
| Adventure Log | Bronze | Full | Dark |
| Dice Roller / Loot Roller / Tools / Quick Reference | Gold | Inline | Dark |
| Map | Laurel | Full | Light |

---

### 14. NavBar

Top navigation bar, full width.

**Component properties:**
| Property | Type | Values |
|----------|------|--------|
| `Theme` | Variant | `Dark` \| `Light` |

**Specs:**
- Full width, horizontal auto-layout, padding 24px all sides
- Height ~72px
- Bottom stroke `border/default` 2px
- Fill: subtle gradient (dark-to-transparent, matching `bg-gradient` CSS class)
- **Left:** Atom Magic logo (215×24px)
- **Center:** 5× Nav/Item instances — Codex, Character, Vorago, Creatures, Tools
- **Right:** ThemeToggle instance

---

### 15. Footer

Full-width site footer — static layout, no component properties needed.

**Specs:**
- Full width, `dark-surface/bg` fill
- Top accent bar: 4px `gold/default`
- Outer padding: 48px all sides
- 5-column auto-layout, gap 48px
- **Column 1 — Brand:**
  - Atom Magic logo (white variant)
  - Latin motto in Lapideum font, italic, ~14px, `text/muted`
  - Button/Primary "Visit Store"
- **Columns 2–5 — Nav groups (Explore / Tools / Resources / Legal):**
  - Section heading: Marcellus SC 12px, uppercase, `gold/default`
  - Nav/Item list below (Noto Serif 14px, Extended=false)
- **Bottom bar:** border-t `border/subtle`, py-16px, copyright text left, CC license right, both Noto Serif 12px `text/muted`

---

## After Building: Code Connect

Once components are built, use the Figma Code Connect tools to map each Figma component to its TypeScript source file:

| Figma Component | Code File |
|-----------------|-----------|
| Button/Primary + Button/Function | `src/app/components/common/FunctionButton.tsx` / `LinkButton.tsx` |
| Icon/Label | `src/app/components/common/IconLabel.tsx` |
| Badge/Challenge + Badge/Status | `src/app/components/common/CategoryChip.tsx` |
| Status/Message | `src/app/components/common/StatusMessage.tsx` |
| Card/Content | `src/app/components/common/ContentCard.tsx` |
| Card/Marketing | `src/app/components/common/Card.tsx` |
| Card/Character Summary | `src/app/components/character/CharacterSummaryCard.tsx` |
| Card/Creature (Compact) | `src/app/components/creatures/CustomCreatureSummaryCard.tsx` |
| PageHero | `src/app/components/common/PageHero.tsx` |
| NavBar | `src/app/components/global/NavBar.tsx` |
| Footer | `src/app/components/global/Footer.tsx` |
