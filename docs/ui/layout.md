# UI Layout and Responsive Grid

This document defines the shared layout rules for new web UI screens.

## Responsive Breakpoints

- **Mobile:** under 768 CSS pixels
- **Tablet:** 768–1199 CSS pixels
- **Desktop:** 1200 CSS pixels and wider

Use the 768px breakpoint as the mobile-to-desktop transition. Tablet layouts
may adapt between the mobile and desktop arrangements where the screen benefits
from it.

## Grid

- Mobile: 4 columns with 16px gutters
- Tablet: 8 columns with 24px gutters
- Desktop: 12 columns with 24px gutters
- Cap desktop content width at approximately 1200px and center it in the viewport

Use the grid to align page content and UI elements. Individual components may
span columns as appropriate; forms and other narrow content should not stretch
just to fill the grid.

## Styling

- Keep global styles limited to the reset, base document styles, and shared
  design tokens in `apps/web/src/global.css`.
- Co-locate each component or feature stylesheet beside its source file and name
  it `<Component>.module.css`.
- Import the module into the component and use exported classes, for example
  `import styles from "./TaskCard.module.css"` with
  `className={styles.card}`. Use descriptive local class names such as `root`,
  `title`, and `actions`.
- Compose conditional states from module classes instead of writing global
  class-name strings.
- Do not add component selectors to `global.css`. Keep global rules to
  document-level defaults, resets, and shared tokens.
- Use the existing CSS custom properties for shared colors (for example
  `--color-text`, `--color-surface`, and `--color-focus`) and follow the
  spacing scale below.
- Keep responsive rules beside the component styles they modify.
- Reuse a shared CSS Module when multiple related screens intentionally share
  styles, such as the authentication pages.
- Preserve visible keyboard focus styles. If a component introduces animation,
  respect `prefers-reduced-motion`.

## Spacing

Use an 8px spacing scale as the default: 8px, 16px, 24px, 32px, and multiples
thereof. Use 16px mobile and 24px tablet/desktop grid gutters as specified
above.

## Screen-Specific Layout

The login form is a centered, single-column panel with a maximum width of
approximately 400px on all viewport sizes. Keep it comfortably inset from the
viewport edges on mobile. Its field order and single-column structure do not
change at the desktop breakpoint.
