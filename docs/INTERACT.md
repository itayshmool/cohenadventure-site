# Motion system — `@wix/interact`

How motion works on this site, why it's built this way, and how to extend it.
This doubles as a worked reference for the **`/interactor`** skill: a real,
production config touching every trigger type, with the invariants called out
where they bite.

- Config (single source of truth): [`src/lib/interact.config.ts`](../src/lib/interact.config.ts)
- Wiring (build + runtime): [`src/pages/index.astro`](../src/pages/index.astro)
- Overflow / old-parallax removal: [`src/layouts/Base.astro`](../src/layouts/Base.astro)

---

## 1. Mental model

`@wix/interact` is declarative. You describe **triggers → effects** bound to
elements by a **key**, and the library does the DOM wiring:

```
trigger (when)          effect (what)                    element (where)
viewEnter, viewProgress │ namedEffect: { type:'FloatIn' } │ [data-interact-key="…"]
hover/interest, click   │ keyframeEffect / customEffect   │ + optional selector to
pointerMove, animationEnd│ transition (CSS-state)          │   refine the target
```

Three packages:

| Package | Role | Where we use it |
| :-- | :-- | :-- |
| `@wix/interact` | declarative layer (`Interact`, `generate`, `add`, `create`) | everywhere |
| `@wix/motion-presets` | named effects (`FloatIn`, `ParallaxScroll`, …) | most effects |
| `@wix/motion` | the engine (WAAPI/ViewTimeline) | bundled inside interact; never called directly |

---

## 2. How it's integrated here (the two-phase split)

This is a **Wix Headless Astro SSR** site (`index.astro` is `prerender = false`).
We use the **vanilla** entry point (`@wix/interact`) because we inject motion into
existing server-rendered markup — plain `data-interact-key` on real elements is
cleaner than wrapping everything in `<interact-element>`.

One config feeds two phases, so the FOUC/entrance CSS can never drift from the
runtime wiring:

**Build / SSR** — `index.astro` frontmatter (runs on the server):

```ts
import { Interact, generate } from '@wix/interact';
import { FloatIn, RevealIn, ParallaxScroll, Tilt3DMouse, Pulse } from '@wix/motion-presets';
import { interactConfig } from '../lib/interact.config';

Interact.registerEffects({ FloatIn, RevealIn, ParallaxScroll, Tilt3DMouse, Pulse });
const interactCSS = generate(interactConfig, false); // useFirstChild=false for vanilla
```

…then inlined before the content paints:

```astro
<style is:inline set:html={interactCSS}></style>
```

**Runtime** — a bundled `<script>` (Astro/Vite compiles it, browser-only):

```ts
import { Interact, add } from '@wix/interact';
import { FloatIn, RevealIn, ParallaxScroll, Tilt3DMouse, Pulse } from '@wix/motion-presets';
import { interactConfig } from '../lib/interact.config';

Interact.registerEffects({ FloatIn, RevealIn, ParallaxScroll, Tilt3DMouse, Pulse });
Interact.create(interactConfig);                       // load config (binds nothing yet)
document.querySelectorAll('[data-interact-key]').forEach((el) =>
  add(el, el.dataset.interactKey));                    // vanilla: bind each keyed root
```

> **`generate()` before `create()` is not the order that matters — `registerEffects()` before both is.** An unregistered `namedEffect.type` doesn't throw; it warns and silently no-ops.

---

## 3. Every interaction on the site

| # | Key(s) | Trigger | Effect | What you see |
| :-- | :-- | :-- | :-- | :-- |
| 1 | `hero-bg` | `viewProgress` | `ParallaxScroll` (factor 0.3) | hero background drifts slower than the page (compositor-driven) |
| 2 | `hero-fg` | `pointerMove` | `Tilt3DMouse` (4°) | hero content tilts subtly toward the cursor |
| 3 | `hud` | `viewEnter` | `customEffect` count-up | HUD stats count 0→value |
| 4 | `roadbook-seq` | `viewEnter` | `RevealIn` title + staggered `FloatIn` | trips "land" like waypoints |
| 5 | `reviews-seq` | `viewEnter` | title wipe + `FloatIn` stagger | review cards cascade in |
| 6 | `training-seq` | `viewEnter` | title wipe + `FloatIn` stagger | course cards cascade in |
| 7 | `videos-seq` | `viewEnter` | title wipe + `FloatIn` stagger | video cards cascade in |
| 8 | `journal-seq` | `viewEnter` | title wipe + `FloatIn` stagger | journal rows cascade in |
| 9 | `about-photo` | `viewProgress` | `keyframeEffect` scale 1.02→1.1 | portrait slow-zooms inside its frame |
| 10 | `about-stats` | `viewEnter` | `customEffect` count-up | 18 / 10+ / 100% count up |
| 11 | `videos-pulse` | `interest` | `Pulse` (state) | play button "breathes" while a card is hovered/focused |
| 12 | `reviews-lift`, `training-lift` | `interest` | `transition` (CSS-state) | card lifts on hover/focus |

**Reveal + hover on the same section use two different keyed elements.** Each
content section keys its **inner container** for the reveal sequence and its
**outer `<section>`** for the hover-lift — because a key holds one controller, so
we don't stack two triggers on one element.

---

## 4. The invariants — where they bit, and what we did

Numbered per the `/interactor` skill. These are the failure modes that **don't
throw** — the page just renders wrong.

1. **`registerEffects()` before `generate()`/`create()`** — done in both the
   frontmatter and the runtime script. Miss it → console warning, no animation.
2. **`generate(config, useFirstChild)` parity** — `false` here (vanilla). `true`
   is only for the `<interact-element>` web entry.
3. **FOUC** — `generate()` emits the initial hidden/paused state; we inline it via
   `<style is:inline>` before content. Reveal targets start at `opacity:0 /
   translateY(120px) / paused` and interact un-pauses them on view-enter.
5. **`viewEnter` same source+target → only `'once'`.** Every reveal keys a
   **container** (source) and animates its **descendant** rows/cards (targets) via
   `selector`, so the animation can never move its own trigger out of view.
   `triggerType` is omitted — `viewEnter` defaults to `'once'`.
6. **Hit-area shift.** The play-button `Pulse` and the hover-lift keep the trigger
   on the card and target a **child** (`selector` on the *effect*). `selector` on
   the *interaction* would move the *source* instead — the opposite.
7. **`viewProgress` needs `overflow: clip`, not `hidden`.** ViewTimeline breaks if
   any ancestor creates a scroll container. We changed:
   - `body { overflow-x: clip }` (was `hidden`) — `Base.astro`
   - hero `<section> { overflow: clip }` (was `hidden`)
   - about photo frame `{ overflow: clip }` (was `hidden`)
8. **Only real registered presets; omit unknown options.** Every `type` here is in
   the preset catalog. No `DVD`, no `Bg*`/`ImageParallax` (experimental).
9. **`*Scroll` presets need `range`** — except `ParallaxScroll`, which uses
   `parallaxFactor`. Our hero parallax uses `parallaxFactor`; the about zoom is a
   raw `keyframeEffect` (deterministic scale, no preset-param ambiguity).
10. **Lists → one keyed wrapper + descendant `selector`/`listContainer`, never
    duplicate keys.** Reveals use **`selector`** (one `viewEnter` staggers many
    cards). Per-card hover/pulse use **`listContainer`** (each card its own
    trigger). Cards are never keyed individually.
11. **Layers that move as one → one keyed container.** The hero background is a
    stack (image + grid + gradient + grain) keyed once as `hero-bg` with a single
    `ParallaxScroll` — not one effect per layer.

Placement rule respected: the hero `<h1>` has **no** entrance effect (it's
above the fold — an opacity-0 entrance would flash invisible on load).

---

## 5. Accessibility & reduced motion

Risk-tiered motion is gated with conditions in the config:

```ts
conditions: {
  motionOK:    { type: 'media', predicate: '(prefers-reduced-motion: no-preference)' },
  hoverDevice: { type: 'media', predicate: '(hover: hover)' },
}
```

- **`motionOK`** gates the scroll parallax, pointer tilt, looping pulse, photo
  zoom, and count-ups. When a visitor prefers reduced motion those interactions
  **never bind**, and the server-rendered static state (final numbers, still
  images) is what remains. No JS teardown needed.
- **`hoverDevice`** gates the pointer tilt so touch devices don't get it.
- Mild entrance reveals (`FloatIn`/`RevealIn`) are left on for everyone — they're
  short, translate+fade, and don't spin/flash.
- `interest`/`activate` (hover+focus / click+keyboard) are used instead of raw
  `hover`/`click` so keyboard users reach the same states.

---

## 6. Validation workflow (how this config was checked)

No config ships without validating, and **no validator reference ships in the
code**:

```bash
npm install -D @wix/interact-validate --registry=https://npm.dev.wixpress.com/
# scratch script (NOT committed):
#   const V = await import('@wix/interact-validate');
#   const { interactConfig } = await import('./src/lib/interact.config.ts');
#   console.log(V.validateInteractConfig(interactConfig));   // → { valid: true }
npm uninstall @wix/interact-validate
grep -REn 'interact-validate|assertValidInteractConfig' src/   # → no matches
```

---

## 7. Extending it

1. Add markup: `data-interact-key="my-thing"` on the element (or its container).
2. Add an interaction + effect to `interactConfig` (pick a preset from the
   catalog; don't guess option names — omit unknowns).
3. Register any **new** preset in **both** the frontmatter and the runtime script.
4. Validate (section 6), `npx wix build`, `npx wix release`.
5. If it's `viewProgress`, check no ancestor has `overflow: hidden` (use `clip`).

**Verify checklist:** config `valid: true` · every `namedEffect.type` real ·
every key has matching markup · `useFirstChild=false` · child-targets use
`selector` on the *effect* · reduced-motion gating where risky · browser console
free of `"not found in registry"` warnings.
