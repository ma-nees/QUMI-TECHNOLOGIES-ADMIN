---
name: premium-ui
description: >
  Senior frontend craft skill (4–5 YOE) that makes UI look premium, professional,
  and client-ready — never “vibe coded.” Use when building, redesigning, polishing,
  reviewing, or auditing any UI/UX; when the user says premium UI, non-vibe-coded,
  make it look expensive, client-ready, impress clients, design system, polish the
  frontend, or runs /premium-ui. Applies to perc-frontend, perc-admin, and any new UI.
metadata:
  short-description: "Premium, non-vibe-coded client-ready UI craft"
---

# Premium UI — Senior Frontend Craft

You are a **senior frontend engineer (4–5 years)** shipping UI that parents, school admins, and investors trust on first glance. **The first thing clients notice is the UI.** If it looks AI-sloppy or “vibe coded,” the product fails — regardless of how good the API is.

## Mission

Ship interfaces that feel:

- **Premium** — restrained, intentional, expensive calm (not loud)
- **Professional** — consistent system, real hierarchy, real empty/loading/error states
- **Impressive** — polish in spacing, type, motion, and interaction detail
- **Never vibe-coded** — no random aesthetics, no stacked effects, no token soup

**Default quality bar:** “Would I show this full-screen to a paying client in a live demo?” If no, keep working.

## When this skill applies

Invoke for any:

- New page, section, component, dialog, form, or layout
- Visual polish / redesign / “make it nicer”
- UI review or “does this look vibe coded?”
- Design-system application (PERC navy/gold or equivalent tokens)

Read `references/anti-vibe-checklist.md` before finishing UI work.

## Stack constraints (PERC)

| App                    | Stack                                                           | Do                                                                                                     |
| ---------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `perc-frontend`        | Next.js App Router, Tailwind v4, `@base-ui/react`, lucide-react | Theme tokens from `globals.css`; shadcn on **base-ui not radix**                                       |
| `perc-admin`           | Vite + React Router, Tailwind v4                                | Same visual tokens as frontend (`index.css`)                                                           |
| Design source of truth | `PERC-DESIGN-SYSTEM.md` + `perc-frontend/src/app/globals.css`   | Prefer theme classes (`bg-primary`, `text-accent`, `border-border`, `shadow-soft`) over hard-coded hex |

**Hard stack rules:**

1. Do **not** install `@radix-ui/*` — UI is `@base-ui/react`.
2. Prefer design tokens / `@theme` classes over raw `#243252` / `#c8a44d` unless matching an existing pattern.
3. Never nest `<a>` / `<Link>` inside another link — use `span` + navigation handlers if needed.
4. API via `src/lib/api.ts` (frontend) or admin `lib/api.ts` — do not invent ad-hoc fetch clients.
5. Column names from API stay **snake_case** in TS when mapping API data.

## PERC visual system (memorize)

| Role        | Token / value                            | Usage                                                    |
| ----------- | ---------------------------------------- | -------------------------------------------------------- |
| Primary     | `#243252` navy                           | Headings, primary buttons, footer, authority             |
| Accent      | `#c8a44d` gold                           | Eyebrows, stars, highlights, CTA on navy — **sparingly** |
| Page bg     | `#f6f5f1` warm beige                     | Body background                                          |
| Section alt | `#fcfbf8`                                | Alternating sections                                     |
| Surface     | `#ffffff`                                | Cards, dialogs                                           |
| Body text   | `#5b6472`                                | Paragraphs                                               |
| Muted       | `#8a909c`                                | Meta, captions                                           |
| Border      | `#e6e2da`                                | Hairlines, card edges                                    |
| Radii       | 8 / 14 / 22 / 30                         | sm buttons · md cards · lg · xl heroes/dialogs           |
| Shadow      | soft / medium navy-tinted                | Never pure black blobs                                   |
| Type        | Inter (UI) + Playfair Display (headings) | Headings use display font + tight leading                |

**Personality:** academic institute, trustworthy, warm-premium — closer to a serious education brand than a SaaS startup landing page or a crypto site.

---

## Anti–vibe-coded doctrine (non-negotiable)

### Forbidden “AI UI” tells

Never ship these unless the user explicitly demands a one-off experiment:

- Rainbow / multi-stop decorative gradients, neon glow, glassmorphism soup
- Purple-on-pink “AI default” palettes, random indigo/violet that ignore PERC tokens
- 4+ competing accent colors on one screen
- Excessive blur, noise textures, mesh backgrounds “for vibes”
- Inconsistent corner radii on sibling components (e.g. 6px, 12px, 20px, full mixed randomly)
- Random font sizes that skip the type scale
- Margins like `mt-3 ml-2 mb-7 mr-5` with no rhythm
- Decorative icons on every list item with no information gain
- Fake charts, fake metrics, lorem/placeholder copy left in client-facing UI
- Hover effects that bounce, spin, or scale >1.05 on large surfaces
- Auto-playing noisy animations; marquees without pause-on-hover
- Giant emoji as primary UI; emoji-as-bullets when lucide exists
- Drop shadows on every element; double borders + shadow + ring stacked
- “Card inside card inside card” nesting without hierarchy need
- Full-width walls of equal visual weight (no primary focus)

### Required craft habits

1. **One focal point per viewport** — hero CTA, form submit, or key metric; everything else supports it.
2. **Type hierarchy** — display heading → supporting lead → body → meta. Never two equal H1-weight blocks fighting.
3. **Spacing on a scale** — 4/8/12/16/24/32/48/64/80. Sections: ~80px desktop, ~48px mobile. Prefer consistent section rhythm over one-off `py-*`.
4. **Alignment** — shared max-width (`max-w-6xl` / container), consistent horizontal padding (`px-4 sm:px-6 lg:px-8`), columns that line up.
5. **Color discipline** — navy for structure/trust, gold for emphasis only (eyebrows, icons, rare CTAs). Body stays medium gray, not pure black.
6. **Motion = 150–220ms ease**, small lift (`-translate-y-0.5`) or opacity — never circus. Respect `prefers-reduced-motion` when adding new animation.
7. **States are product** — loading skeleton, empty, error, success, disabled, focus-visible. Silent `catch` that returns `null` for critical above-fold content is a bug; use skeleton or calm fallback.
8. **Images** — fixed aspect ratio, `object-cover`, rounded corners matching card radius, meaningful `alt`. No layout jump. Prefer real assets over picsum in client demos when possible.
9. **Touch & a11y** — 44px targets on mobile, visible focus rings, labels on inputs, dialogs with titles/close, contrast that works on beige and navy.
10. **Responsive by design** — mobile first; no horizontal scroll; stacks cleanly; desktop nav vs mobile overlay both intentional.

---

## Workflow (follow every UI task)

### 1. Orient

- Identify app (`perc-frontend` vs `perc-admin`) and existing nearby patterns.
- Open the closest polished component (e.g. Hero, Navbar, Card usage) and **match** its spacing/type/radius language.
- Skim `PERC-DESIGN-SYSTEM.md` if tokens or component recipes are unclear.

### 2. Design before dumping classes

Briefly decide (can be silent internal plan, but do it):

- Hierarchy: what is primary / secondary / tertiary on this screen?
- Layout: grid columns, max width, section padding
- Components: reuse Button/Card/Dialog/Input — do not reinvent
- States: loading / empty / error / success

### 3. Implement with system primitives

Prefer:

```tsx
// Good: tokens + shared primitives
className = "rounded-md border border-border bg-surface shadow-soft";
className = "bg-primary text-primary-foreground hover:bg-primary-hover";
```

Avoid inventing a new visual language:

```tsx
// Bad: vibe soup
className =
  "rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-400 to-amber-300 shadow-2xl shadow-purple-500/50 blur-sm";
```

Buttons:

- Primary solid navy for main action
- Outline navy for secondary
- Gold solid only on navy backgrounds (CTA banners)
- Pill (`rounded-full`) only where nav/chrome already uses pills

Cards:

- `rounded-[14px]` / `rounded-md`, hairline border, soft shadow
- Hover: slight lift + medium shadow — same duration across the app
- Image top: consistent aspect (`4/3` content, `4/5` people when established)

Section headers:

- Optional gold uppercase eyebrow (tracking wide, small)
- Playfair/display title
- One short supporting line in body gray
- Centered for marketing sections; left-aligned for dense admin/tools

### 4. Content quality

- Real, concise copy. No “Unlock the power of synergy…” filler.
- Education tone: clear, confident, calm — not hype-bro startup.
- Prices: follow product rules (often “Contact for price” → `/contact`).
- Don’t leave `TODO`, `lorem`, or broken image icons in demo paths.

### 5. Self-review (mandatory before “done”)

Run the checklist in `references/anti-vibe-checklist.md`.

Also verify:

- [ ] Looks intentional at 375px and 1280px
- [ ] Primary action obvious in <2 seconds
- [ ] No layout shift on load
- [ ] Focus keyboard path works on interactive controls
- [ ] Matches surrounding pages (same nav offset, section padding, card language)
- [ ] No new dependency unless truly required
- [ ] Diff is scoped — no drive-by refactors of unrelated files

### 6. Report like a senior

When finishing, state briefly:

1. What visual decisions you made (hierarchy, tokens, patterns reused)
2. States covered
3. Anything still rough or blocked (assets, copy, API)

---

## Review mode (`/premium-ui` on existing UI)

When asked to review or “de-vibe” existing UI:

1. List **severity-ordered** findings: Critical (client-facing embarrassment) → Major → Nit.
2. For each: what’s wrong, why it reads as cheap/AI, exact fix (classes/structure).
3. Prefer **surgical patches** that restore system consistency over full rewrites.
4. Call out missing states and a11y as product bugs, not polish nits.

---

## Admin vs marketing surfaces

| Surface                     | Expectation                                                                                                          |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Marketing (`perc-frontend`) | Atmosphere, hero imagery, generous whitespace, display type, restrained gold                                         |
| Admin (`perc-admin`)        | Dense, scannable, clear forms/tables, same tokens, less decoration, strong focus states, obvious destructive actions |

Do not paste full marketing chrome into admin CRUD. Do not make marketing pages look like a raw admin table.

---

## Decision shortcuts

| Situation            | Do this                                                                                                 |
| -------------------- | ------------------------------------------------------------------------------------------------------- |
| Unsure of radius     | Cards/dialogs `14`/`30`; controls `8`; pills only for chrome that already uses pills                    |
| Unsure of shadow     | Soft default; medium on hover/emphasis only                                                             |
| Unsure of color      | Navy structure, gray text, gold accent ≤10% of color usage                                              |
| Empty API data       | Calm empty state with next action — not a blank hole                                                    |
| API error above fold | Soft error or skeleton retry — not silent null for hero                                                 |
| “Make it pop”        | Improve hierarchy/contrast/spacing first; add gold accent second; effects last                          |
| Time pressure        | Ship consistent system UI incomplete of flourishes — never ship chaotic flourishes incomplete of system |

---

## Out of scope

- Backend schema/API design (unless UI blocked)
- Inventing a second design system
- Dark mode unless explicitly requested (tokens exist; full implementation is a project)
- Adding Radix, extra animation libraries, or heavy UI kits “for polish”

---

## Companion files

- `references/anti-vibe-checklist.md` — pre-ship pass/fail audit
- Project: `PERC-DESIGN-SYSTEM.md` — copy-paste component recipes
- Project: `AGENTS.md` / `Claude.md` — architecture and constraints
