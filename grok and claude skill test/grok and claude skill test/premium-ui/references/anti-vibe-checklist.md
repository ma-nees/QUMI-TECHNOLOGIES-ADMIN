# Anti–Vibe-Coded UI Checklist

Use before calling any UI task done. Fail any **Critical** → fix before ship.

## Critical (client sees this first)

- [ ] No rainbow / neon / multi-brand random gradients
- [ ] Palette is PERC (navy / gold / warm beige / gray) — not purple-AI default
- [ ] One clear primary action per main viewport
- [ ] Type hierarchy readable in 2 seconds (heading ≠ body weight fight)
- [ ] No lorem, TODO, broken images, or placeholder “John Doe” left in demo path
- [ ] No horizontal scroll on mobile (375px)
- [ ] Above-fold critical content has loading or calm fallback (not silent blank)

## Major (reads cheap if missed)

- [ ] Spacing follows 4/8/12/16/24/32/48/64/80 — no random orphan margins
- [ ] Sibling components share the same radius / border / shadow language
- [ ] Gold accent used sparingly (eyebrows, stars, rare emphasis) — not everywhere
- [ ] Cards: hairline border + soft shadow; hover lift consistent if interactive
- [ ] Section padding rhythm matches site (~80 desktop / ~48 mobile)
- [ ] Images have fixed aspect + object-cover; no jump on load
- [ ] Forms: labels, errors, disabled, focus-visible
- [ ] Empty and error states exist for lists/grids that can be empty/fail
- [ ] Motion ≤ ~220ms; no bounce/spin/scale circus on large blocks
- [ ] Marketing vs admin density appropriate (not admin-looking marketing)

## Polish (separates good from premium)

- [ ] Eyebrow + title + subtitle pattern consistent on marketing sections
- [ ] Meta text uses muted color (`text-light` / `#8a909c`)
- [ ] Icon size and stroke weight consistent (lucide, one size step)
- [ ] Button padding and font-weight match existing Button patterns
- [ ] Focus rings visible for keyboard users
- [ ] Touch targets ≥ 44px on mobile primary controls
- [ ] Footer / nav / floats don’t collide with content or each other
- [ ] Copy tone: calm academic authority — not hype startup

## Diff hygiene

- [ ] No unrelated file drive-bys
- [ ] No new UI library without explicit ask
- [ ] No `@radix-ui` additions
- [ ] Theme tokens preferred over new hard-coded hex islands

## Quick “vibe detector” questions

1. If I blur my eyes, is there still a clear focal point?
2. Could this screenshot sit next to a premium ed-tech or private-institute site without embarrassment?
3. Did I add any effect “because it looked cool” rather than “because it clarifies hierarchy”?
4. Would a senior designer ask “why is this radius different?” anywhere on the page?

If (3) is yes or (1)/(2)/(4) fail → revise.
