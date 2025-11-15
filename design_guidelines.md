# BuyMind Research - Design Guidelines

## Design Approach
**System-Based Approach**: Drawing from Linear's precision and Notion's information clarity with Material Design's data-dense principles. This research assistant requires exceptional readability, clear hierarchies for complex data, and professional academic aesthetics.

## Layout System

**Primary Structure**: Single-page dashboard with persistent panels
- Header: Fixed top bar with branding and status indicators
- Main Content Area: 3-column adaptive grid
  - Left Panel (25%): AskBox + LibraryPanel (stacked vertically)
  - Center Panel (50%): AnswerPane (primary focus area)
  - Right Panel (25%): LogStream (fixed height, scrollable)

**Spacing Foundation**: Use Tailwind units of 2, 3, 4, 6, 8, 12
- Component padding: p-4 to p-6
- Section gaps: gap-4 to gap-6
- Panel margins: m-3 or m-4
- Dense data rows: py-2

**Responsive Behavior**:
- Desktop (lg): 3-column layout
- Tablet (md): 2-column, LogStream moves to bottom drawer
- Mobile: Single column stack, LogStream as collapsible bottom sheet

## Typography

**Font Stack**:
- Primary: 'Inter' (Google Fonts) - body, UI elements
- Monospace: 'JetBrains Mono' - logs, technical data, IDs

**Type Scale**:
- H1 (Page Title): text-2xl, font-semibold
- H2 (Panel Headers): text-lg, font-semibold
- H3 (Section Labels): text-base, font-medium, uppercase tracking
- Body: text-sm, regular
- Small/Meta: text-xs
- Code/Logs: text-xs, mono

## Component Library

### Core Components

**AskBox**:
- Large textarea with subtle border
- "Ask" button: primary action style, full-width on mobile
- Character counter in text-xs
- Recent questions as small chips below input

**AnswerPane**:
- Confidence meter visual: horizontal bar with gradient fill showing pre→post confidence
- Delta indicator: badge showing improvement ("+0.23" with up arrow)
- Answer text: prose formatting, max-w-prose for readability
- Citations list: compact cards with title (text-sm, font-medium), year badge, OpenAlex link icon

**LibraryPanel**:
- Scrollable results list (max-h-96)
- Each result card: title, year badge, relevance score (0-1 scale with visual bar)
- Highlight selected/fetched papers with subtle background treatment
- Empty state: centered message with search icon

**LogStream**:
- Auto-scrolling container (h-full, overflow-y-auto)
- Log entries: monospace font, timestamp prefix
- Level indicators: small colored dots (info/success/error)
- Fade-in animation for new entries
- Clear all button at top

### Navigation & Header
- Minimal header: Logo + "BuyMind Research" title left-aligned
- Status indicator: "Ready" / "Searching" / "Analyzing" with animated pulse
- No complex navigation (single-page app)

### Data Display
- Confidence scores: Large numerical display (text-3xl) with percentage
- Metric cards: Clean borders, icon + label + value
- Progress indicators: Linear bars, no circular loaders
- Timestamps: Relative time format ("2m ago")

### Forms
- Input fields: Clean borders, focus rings, consistent height (h-10 to h-12)
- Textareas: Resizable, min-height constraints
- Buttons: Solid backgrounds, medium font-weight, rounded corners (rounded-md)
- Form labels: text-sm, font-medium, mb-2

## Visual Patterns

**Borders & Dividers**:
- Panel separation: border or subtle shadow
- Card borders: 1px solid, rounded-lg
- Divider lines between log entries

**Spacing Rhythm**:
- Tight spacing for related items (gap-2)
- Medium spacing between sections (gap-6)
- Generous padding in panels (p-6)

**Visual Hierarchy**:
- Primary actions: larger, prominent
- Secondary data: smaller, lighter treatment
- Metadata/timestamps: minimal, text-xs

**Interactive States**:
- Hover: Subtle background shift on cards
- Active: Pressed state with slight scale
- Disabled: Reduced opacity (0.5)
- Loading: Skeleton screens for panels, pulse for small elements

## Animations
- Use sparingly: Log entry fade-in (200ms), confidence bar fill (300ms)
- Auto-scroll behavior for LogStream (smooth)
- Panel transitions on responsive breakpoints (transition-all duration-200)

## Academic Research Aesthetic
- Clean, professional appearance
- Emphasis on readability over decoration
- Trust indicators: Citation counts, OpenAlex branding
- Data-first presentation
- Monospace for technical details (IDs, timestamps)
- Clear provenance for all information

## Critical UI Behaviors
- LogStream auto-updates every 2s without user input
- Search→Fetch→Answer pipeline shows progressive states in UI
- Citations are clickable links to OpenAlex
- Empty states guide users clearly ("Ask a question to begin")
- Error states show retry options

## Images
No images required for this application interface. This is a data-dense productivity tool where visual imagery would distract from information clarity. All visual interest comes from well-designed data presentation, typography hierarchy, and subtle interactive elements.