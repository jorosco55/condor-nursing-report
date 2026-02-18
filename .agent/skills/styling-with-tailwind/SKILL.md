---
name: styling-with-tailwind
description: Master-level Tailwind CSS expert for building modern, responsive, and performant interfaces. Use this skill when the user asks about Tailwind CSS classes, utility-first styling, responsive design, custom themes, component patterns, animations, dark mode, or optimizing Tailwind builds.
---

# Tailwind CSS Master

## When to use this skill
- User asks to style or restyle components using Tailwind CSS
- User needs help with responsive layouts, spacing, or typography
- User wants to configure or extend `tailwind.config.js`
- User asks about dark mode, theming, or design tokens
- User needs complex layout patterns (grids, flexbox, sticky, overlays)
- User wants to optimize Tailwind bundle size or purge unused styles
- User asks about Tailwind animations, transitions, or state variants

## Core Principles

- **Utility-first**: Compose styles directly in markup. Extract components only when a pattern repeats 3+ times.
- **Design tokens over magic numbers**: Use the spacing/color/font scales. Avoid arbitrary values like `w-[347px]` unless truly necessary.
- **Responsive by default**: Build mobile-first, layer up with `sm:`, `md:`, `lg:`, `xl:`, `2xl:`.
- **Semantic HTML**: Tailwind handles visuals — the markup must still be accessible and meaningful.

## Class Ordering Convention

Follow this consistent ordering for readability:

1. **Layout** — `block`, `flex`, `grid`, `inline`, `hidden`
2. **Position** — `relative`, `absolute`, `fixed`, `sticky`, `top-*`, `z-*`
3. **Box model** — `w-*`, `h-*`, `m-*`, `p-*`, `overflow-*`
4. **Flex/Grid children** — `col-span-*`, `justify-*`, `items-*`, `gap-*`, `grow`, `shrink`
5. **Typography** — `text-*`, `font-*`, `leading-*`, `tracking-*`, `truncate`
6. **Backgrounds** — `bg-*`, `gradient-*`
7. **Borders** — `border-*`, `rounded-*`, `ring-*`
8. **Effects** — `shadow-*`, `opacity-*`, `blur-*`
9. **Transitions** — `transition-*`, `duration-*`, `ease-*`
10. **State variants** — `hover:`, `focus:`, `active:`, `group-hover:`

## Responsive Design Patterns

### Breakpoint Reference
| Prefix | Min-width | Typical use |
|--------|-----------|-------------|
| (none) | 0px | Mobile default |
| `sm:` | 640px | Large phones / small tablets |
| `md:` | 768px | Tablets |
| `lg:` | 1024px | Laptops |
| `xl:` | 1280px | Desktops |
| `2xl:` | 1536px | Large screens |

### Responsive Container
```html
<div class="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
  <!-- content -->
</div>
```

### Responsive Grid
```html
<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
  <!-- cards -->
</div>
```

## Common Component Patterns

### Card
```html
<div class="overflow-hidden rounded-lg bg-white shadow-md dark:bg-gray-800">
  <img class="h-48 w-full object-cover" src="..." alt="..." />
  <div class="p-6">
    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Title</h3>
    <p class="mt-2 text-sm text-gray-600 dark:text-gray-300">Description</p>
  </div>
</div>
```

### Button Variants
```html
<!-- Primary -->
<button class="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors duration-150 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
  Primary
</button>

<!-- Secondary -->
<button class="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors duration-150 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700">
  Secondary
</button>

<!-- Ghost -->
<button class="inline-flex items-center rounded-md px-4 py-2 text-sm font-medium text-gray-700 transition-colors duration-150 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-gray-300 dark:hover:bg-gray-800">
  Ghost
</button>
```

### Modal / Dialog Overlay
```html
<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
  <div class="mx-4 w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-800">
    <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Modal Title</h2>
    <p class="mt-2 text-sm text-gray-600 dark:text-gray-300">Content here.</p>
    <div class="mt-6 flex justify-end gap-3">
      <button class="rounded-md px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700">Cancel</button>
      <button class="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700">Confirm</button>
    </div>
  </div>
</div>
```

## Dark Mode

### Strategy: Class-based (recommended for user toggle)
```js
// tailwind.config.js
module.exports = {
  darkMode: 'class',
};
```
Toggle by adding/removing `dark` on `<html>`:
```js
document.documentElement.classList.toggle('dark');
```

### Strategy: Media-based (follows OS preference)
```js
// tailwind.config.js
module.exports = {
  darkMode: 'media',
};
```

### Pattern: Always pair light and dark tokens
```html
<div class="bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
```

## Extending the Theme

### Custom Colors
```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f5ff',
          100: '#e0ebff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#1e3a5f',
        },
      },
    },
  },
};
```

### Custom Spacing / Sizing
```js
theme: {
  extend: {
    spacing: {
      '18': '4.5rem',
      '88': '22rem',
      '128': '32rem',
    },
  },
},
```

### Custom Animation
```js
theme: {
  extend: {
    keyframes: {
      'fade-in': {
        '0%': { opacity: '0', transform: 'translateY(8px)' },
        '100%': { opacity: '1', transform: 'translateY(0)' },
      },
    },
    animation: {
      'fade-in': 'fade-in 0.3s ease-out',
    },
  },
},
```
Usage: `class="animate-fade-in"`

## Animations & Transitions

### Smooth hover transitions
```html
<div class="transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-lg">
```

### Skeleton loading
```html
<div class="h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
```

### Spin (loading indicator)
```html
<svg class="h-5 w-5 animate-spin text-white" viewBox="0 0 24 24">...</svg>
```

## Tailwind with Capacitor / Ionic

When combining Tailwind with Ionic components:

- Apply Tailwind classes on wrapper `div`s, not directly on `ion-*` elements (shadow DOM limits utility class reach).
- Use CSS custom properties (`--ion-*`) for Ionic theming and Tailwind for layout/spacing around Ionic components.
- Disable Tailwind's preflight reset if it conflicts with Ionic's base styles:
```js
// tailwind.config.js
module.exports = {
  corePlugins: {
    preflight: false,
  },
};
```

## Performance & Build Optimization

- **Content paths**: Ensure `tailwind.config.js` content array covers all template files to enable tree-shaking:
```js
content: [
  './src/**/*.{html,ts,tsx,jsx,vue,svelte}',
  './index.html',
],
```
- **Avoid `@apply` in loops**: Prefer utility classes in markup. Use `@apply` only in shared base styles that truly need extraction.
- **Arbitrary values**: Use sparingly. If an arbitrary value repeats, add it to the theme config instead.
- **JIT mode**: Enabled by default in Tailwind v3+. Generates styles on demand — no purge step needed.

## Common Pitfalls

- **Specificity wars**: Don't mix Tailwind with heavy custom CSS. If overriding, use `!important` modifier (`!text-red-500`) as a last resort.
- **Missing dark variants**: Every color/background class should have a `dark:` counterpart if the app supports dark mode.
- **Forgetting `overflow-hidden`**: Rounded corners on containers with child images require `overflow-hidden` on the parent.
- **Z-index stacking**: Use the scale (`z-10`, `z-20`, `z-30`, `z-40`, `z-50`) consistently. Don't invent `z-[9999]`.
- **Text truncation**: Use `truncate` (single line) or `line-clamp-*` (multiline). Both require a defined width or max-width.
