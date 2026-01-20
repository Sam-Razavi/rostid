# Rostid Design System

## Brand Identity

**Name:** Rostid — from Swedish *rost* (roast) + *tid* (time)  
**Tagline:** *Time for the perfect roast.*  
**Personality:** Premium, honest, Scandinavian restraint. Not precious or artsy — confident and grounded.

---

## Color System

### Brand (Warm Brown)
| Token | Hex | Usage |
|---|---|---|
| brand-50 | #faf6f1 | Page tints, subtle backgrounds |
| brand-100 | #f3e9da | Card fills, tag backgrounds |
| brand-200 | #e5d0b4 | Borders, dividers |
| brand-400 | #c4905f | Accent text, icons |
| brand-600 | #a06330 | Secondary CTAs, labels |
| brand-700 | #854f28 | Hover states |
| brand-800 | #6d4025 | **Primary CTA, links** |
| brand-900 | #5a3521 | Active/pressed states |
| brand-950 | #301a0e | Headings, high-contrast |

### Neutral (Stone)
| Token | Hex | Usage |
|---|---|---|
| stone-50 | #fafaf9 | **Page background** |
| stone-100 | #f5f5f4 | Input backgrounds, off-white sections |
| stone-200 | #e7e5e4 | Borders, dividers |
| stone-400 | #a8a29e | Placeholder text, icons |
| stone-500 | #78716c | Secondary text |
| stone-600 | #57534e | Body text |
| stone-700 | #44403c | Sub-headings |
| stone-800 | #292524 | Primary body text |
| stone-900 | #1c1917 | **Headings** |

### Semantic
| Token | Purpose |
|---|---|
| green-600 | Success, "In stock", "Delivered" |
| amber-500 | Warning, "Processing", "Low stock" |
| red-600 | Error, "Cancelled", destructive actions |
| blue-600 | Info, "Confirmed", links |

---

## Typography

### Fonts
- **Display / Headings:** Playfair Display (serif) — warmth, premium feel
- **Body / UI:** Inter (sans-serif) — clean, readable, modern

### Scale
| Style | Font | Size | Weight | Line Height |
|---|---|---|---|---|
| Display XL | Playfair Display | 4xl (2.25rem) | 600 | tight |
| Display L | Playfair Display | 3xl (1.875rem) | 600 | tight |
| Heading 1 | Playfair Display | 2xl (1.5rem) | 600 | snug |
| Heading 2 | Inter | xl (1.25rem) | 600 | snug |
| Heading 3 | Inter | lg (1.125rem) | 600 | normal |
| Body L | Inter | base (1rem) | 400 | relaxed |
| Body M | Inter | sm (0.875rem) | 400 | relaxed |
| Caption | Inter | xs (0.75rem) | 400 | normal |
| Label | Inter | xs (0.75rem) | 500 | normal |

---

## Spacing

8px base unit. Scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128.

Sections: 80–96px top/bottom padding on desktop, 48–64px on mobile.

---

## Elevation / Shadows

| Level | Shadow | Usage |
|---|---|---|
| 0 | none | Flat elements, nav items |
| 1 | `soft` (subtle 2px) | Cards, inputs at rest |
| 2 | `card` (20px spread) | Hover cards, dropdowns |
| 3 | `lg` | Modals, drawers |

---

## Border Radius

| Token | Value | Usage |
|---|---|---|
| rounded | 0.375rem | Inputs, small badges |
| rounded-lg | 0.5rem | Buttons, cards |
| rounded-xl | 0.75rem | Large cards, modals |
| rounded-2xl | 1rem | Feature sections |
| rounded-full | 9999px | Avatars, pill badges |

---

## Components

### Button
Three variants — all use 150ms color transition, `cursor-pointer`, and disabled state.

```
Primary:    bg-brand-800  text-white    hover:bg-brand-700
Secondary:  border-stone  text-stone    hover:bg-stone-100
Ghost:      transparent   text-stone    hover:bg-stone-100
```

Sizes: `sm` (px-4 py-2 text-sm), `md` (px-6 py-3 text-base), `lg` (px-8 py-4 text-lg)

### Input
```
border-stone-300 rounded-lg px-4 py-3
focus:ring-2 focus:ring-brand-500 focus:border-transparent
placeholder:text-stone-400
```

### Badge / Status
```
pending:    bg-amber-100   text-amber-800
confirmed:  bg-blue-100    text-blue-800
processing: bg-amber-100   text-amber-800
shipped:    bg-blue-100    text-blue-800
delivered:  bg-green-100   text-green-800
cancelled:  bg-red-100     text-red-800

light roast:  bg-amber-50   text-amber-700
medium roast: bg-orange-50  text-orange-700
dark roast:   bg-stone-100  text-stone-700
```

### Card
```
bg-white rounded-xl shadow-soft border border-stone-100
overflow-hidden
hover: shadow-card transition-shadow duration-200
```

### Product Card
```
aspect-[4/3] image
px-4 py-4 content area
name: Inter 600 stone-900
price: Playfair Display 600 brand-800
category: badge (brand-100 / brand-700)
tasting notes: italic stone-500 text-sm
```

### Skeleton
```
bg-stone-200 animate-pulse rounded
```

---

## Layout

### Navbar
```
sticky top-0 z-50
bg-white/95 backdrop-blur border-b border-stone-200
height: 64px (h-16)
```
Contents: Logo (left), Nav links (center, hidden mobile), Cart icon + count badge + Auth (right)

### Footer
```
bg-brand-950 text-stone-300
padding: py-16
Three columns: Brand info | Navigation | Contact
Bottom bar: copyright
```

### Page container
```
max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
```

### Product grid
```
grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6
```

---

## Motion

All transitions: `duration-150` (buttons, nav) or `duration-200` (cards, modals).  
No animation on page transitions — keep it calm.  
Cart item addition/removal: `transition-all duration-200`.

---

## Accessibility

- All interactive elements: visible focus ring (`ring-2 ring-brand-500`)
- Color contrast: all text meets WCAG AA
- Buttons always have accessible labels
- Images always have alt text

---

## Breakpoints (Tailwind defaults)

| Name | Width |
|---|---|
| sm | 640px |
| md | 768px |
| lg | 1024px |
| xl | 1280px |
| 2xl | 1536px |

Mobile-first. Design for 375px, enhance at sm → lg → xl.
