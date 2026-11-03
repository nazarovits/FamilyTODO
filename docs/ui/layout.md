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

## Spacing

Use an 8px spacing scale as the default: 8px, 16px, 24px, 32px, and multiples
thereof. Use 16px mobile and 24px tablet/desktop grid gutters as specified
above.

## Screen-Specific Layout

The login form is a centered, single-column panel with a maximum width of
approximately 400px on all viewport sizes. Keep it comfortably inset from the
viewport edges on mobile. Its field order and single-column structure do not
change at the desktop breakpoint.
