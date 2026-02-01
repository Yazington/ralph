# Design System Specification

## Overview
A high-end, premium design system focused on clarity, consistency, and developer experience.

## Typography

### Font Family
- **Primary**: IBM Plex Mono
- **All text is uppercase** - no lowercase characters in the UI

### Text Transform Rules
All UI elements must use uppercase text, including:
- Button labels
- Input placeholders
- Menu items
- Task titles
- Status labels
- Navigation items
- Form labels
- Headers and subheaders

### Font Sizes
- Extra small: 0.75rem (12px)
- Small: 0.875rem (14px)
- Base: 1rem (16px)
- Large: 1.125rem (18px)
- Extra large: 1.25rem (20px)
- 2X large: 1.5rem (24px)

## Color Palette - Core Neutrals (Surfaces)

### Backgrounds
| Name | Color | Usage |
|------|-------|-------|
| Base / App Background | `#090B0D` | Main application background |
| Deep Panel | `#0B1013` | Primary panels, cards |
| Panel Alt | `#101D1E` | Secondary panels, alternate sections |
| Panel Teal | `#132E2C` | Highlighted sections, active states |

### Borders & Dividers
| Name | Color | Usage |
|------|-------|-------|
| Border / Divider | `#2B2C2D` | Use with opacity for subtlety |

### Opacity Guidelines
- 10% - Very subtle borders
- 20% - Standard borders
- 30% - Emphasized borders
- 40% - Strong borders

### Text Colors
- Primary: #FFFFFF (main text)
- Secondary: #A1A1AA (secondary text)
- Muted: #71717A (subtle text)
- Disabled: #52525B (disabled state)

## Spacing System
- 0: None
- 1: 0.25rem (4px)
- 2: 0.5rem (8px)
- 3: 0.75rem (12px)
- 4: 1rem (16px) - standard
- 6: 1.5rem (24px)
- 8: 2rem (32px)
- 12: 3rem (48px)

## Shadows
- Small: Subtle elevation
- Medium: Standard elevation
- Large: Prominent elevation

## Border Radius
- Small: 0.25rem (4px)
- Medium: 0.375rem (6px) - standard
- Large: 0.5rem (8px)

## Component Patterns

### Buttons
- Primary button with panel teal background
- Secondary button with deep panel background
- All buttons use uppercase labels
- Standard padding: 0.5rem vertical, 1rem horizontal
- Medium border radius

### Panels
- Deep panel background color
- Border with 20% opacity
- Medium border radius
- Standard padding: 1rem

### Input Fields
- Panel alt background color
- Uppercase placeholders
- Border with 20% opacity
- Medium border radius
- Full width when appropriate

### Task Cards
- Deep panel background color
- Border with 20% opacity
- Medium border radius
- Hover state: panel teal border color
- Smooth color transitions

## Status Colors (Task States)
- Backlog: #3F3F46 (gray)
- Todo: #2563EB (blue)
- In Progress: #D97706 (amber)
- Review: #A855F7 (purple)
- Done: #059669 (green)

## Accessibility
- Minimum contrast ratio: 4.5:1
- Focus states: 2px solid blue with offset
- All interactive elements have keyboard support
- ARIA labels for icon-only buttons

## Implementation Requirements
- Use shadcn/ui components as base, override with custom styles
- Tailwind CSS for utility classes
- Component-level composition for consistency
- Strict adherence to uppercase rule - NO exceptions
- All text in UI must be uppercase
