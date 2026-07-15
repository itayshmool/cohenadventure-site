import type { InteractConfig } from '@wix/interact';

/**
 * ============================================================================
 * Cohen Adventure — motion system (@wix/interact)
 * ============================================================================
 *
 * ONE declarative config binds triggers → effects onto elements by `key`. It is
 * consumed in two places, from this single source of truth (so the generated
 * FOUC/entrance CSS can never drift from the runtime wiring):
 *
 *   • BUILD/SSR (index.astro frontmatter): registerEffects → generate(config,false)
 *     emits the initial-state + keyframe CSS, inlined into the page <head>/body.
 *   • RUNTIME (index.astro <script>): registerEffects → Interact.create(config)
 *     → add(root, key) wires the triggers in the browser.
 *
 * Entry point: **vanilla** `@wix/interact` → generate(config, false) with
 * useFirstChild=false, and manual add() per keyed root (see index.astro). We inject into existing
 * server-rendered markup, so vanilla (plain `data-interact-key` on real elements)
 * is cleaner than wrapping everything in <interact-element>.
 *
 * Invariants honoured (see docs/INTERACT.md for the full write-up):
 *   3  FOUC — generate() CSS is inlined before content paints.
 *   5  viewEnter same source+target → only 'once'. All our sequences use a
 *      container as source and its descendants as targets, so re-trigger loops
 *      can't happen; triggerType is omitted (viewEnter defaults to 'once').
 *   6  hit-area shift — pointer/hover effects that move the element target a
 *      CHILD via `selector` on the EFFECT, trigger stays on the stable parent.
 *   7  overflow:clip — viewProgress needs `overflow:clip` (not hidden) on every
 *      ancestor. We switched body + hero + about-photo frame to clip.
 *   8  only real registered presets; unknown options omitted (defaults apply).
 *   9  *Scroll presets carry `range` — except ParallaxScroll (parallaxFactor).
 *   10 lists → one keyed wrapper + descendant selector/listContainer, never
 *      duplicate keys.
 *   11 layered composites (hero bg stack) → one keyed container, one effect.
 *
 * Accessibility: risky motion (scroll parallax, 3D pointer tilt, looping pulse,
 * the count-up) is gated behind `motionOK` = (prefers-reduced-motion: no-preference).
 * When a user prefers reduced motion those interactions simply never bind and the
 * server-rendered static state is what remains. Mild entrance reveals are left on.
 * ============================================================================
 */

/** Count-up: animate a number 0→target as it enters view. Reads data-* off the
 *  element so one function serves every stat. Non-CSS, so it's a customEffect. */
const countUp = (el: Element, progress: number) => {
  const node = el as HTMLElement;
  const to = Number(node.dataset.countTo);
  if (!Number.isFinite(to)) return;
  const suffix = node.dataset.countSuffix ?? '';
  const pad = node.dataset.countPad ? Number(node.dataset.countPad) : 0;
  const val = Math.round((typeof progress === 'number' ? progress : 1) * to);
  node.textContent = (pad ? String(val).padStart(pad, '0') : String(val)) + suffix;
};

export const interactConfig: InteractConfig = {
  conditions: {
    // Gates for the risk-tiered effects. All listed conditions must pass.
    motionOK: { type: 'media', predicate: '(prefers-reduced-motion: no-preference)' },
    hoverDevice: { type: 'media', predicate: '(hover: hover)' },
  },

  interactions: [
    // ── Hero background: scroll parallax (replaces the old main-thread JS handler) ──
    // One keyed container over the whole layered stack (image+grid+gradient+grain →
    // invariant 11). ParallaxScroll uses parallaxFactor, not `range` (invariant 9).
    {
      key: 'hero-bg',
      trigger: 'viewProgress',
      conditions: ['motionOK'],
      effects: [{ effectId: 'bg-parallax' }],
    },

    // ── Hero foreground: subtle 3D tilt toward the cursor (desktop, motion-safe) ──
    // Trigger on the content wrapper; no rangeStart/rangeEnd (pointerMove-driven).
    {
      key: 'hero-fg',
      trigger: 'pointerMove',
      params: { hitArea: 'root' },
      conditions: ['hoverDevice', 'motionOK'],
      effects: [{ effectId: 'fg-tilt' }],
    },

    // ── Hero HUD stat count-up ──
    { key: 'hud', trigger: 'viewEnter', conditions: ['motionOK'], effects: [{ effectId: 'count', selector: '.hud-num' }] },

    // ── Content sections: title wipe + staggered card cascade on view-enter ──
    // Each keyed on the section's inner container; the title RevealIn and the card
    // FloatIn share the one viewEnter trigger (multiple effects fire together).
    {
      key: 'roadbook-seq',
      trigger: 'viewEnter',
      effects: [{ effectId: 'title-wipe', selector: '.sec-head' }],
      sequences: [{ offset: 110, offsetEasing: 'quadOut', effects: [{ effectId: 'reveal-up', selector: '.roadbook-row' }] }],
    },
    {
      key: 'reviews-seq',
      trigger: 'viewEnter',
      effects: [{ effectId: 'title-wipe', selector: '.sec-head' }],
      sequences: [{ offset: 80, offsetEasing: 'quadOut', effects: [{ effectId: 'reveal-up', selector: '.review-card' }] }],
    },
    {
      key: 'training-seq',
      trigger: 'viewEnter',
      effects: [{ effectId: 'title-wipe', selector: '.sec-head' }],
      sequences: [{ offset: 80, offsetEasing: 'quadOut', effects: [{ effectId: 'reveal-up', selector: '.course-card' }] }],
    },
    {
      key: 'videos-seq',
      trigger: 'viewEnter',
      effects: [{ effectId: 'title-wipe', selector: '.sec-head' }],
      sequences: [{ offset: 80, offsetEasing: 'quadOut', effects: [{ effectId: 'reveal-up', selector: '.video-card' }] }],
    },
    {
      key: 'journal-seq',
      trigger: 'viewEnter',
      effects: [{ effectId: 'title-wipe', selector: '.sec-head' }],
      sequences: [{ offset: 90, offsetEasing: 'quadOut', effects: [{ effectId: 'reveal-up', selector: '.journal-row' }] }],
    },

    // ── About: portrait slow scroll-zoom + stat count-up ──
    { key: 'about-photo', trigger: 'viewProgress', conditions: ['motionOK'], effects: [{ effectId: 'photo-zoom', selector: 'img' }] },
    { key: 'about-stats', trigger: 'viewEnter', conditions: ['motionOK'], effects: [{ effectId: 'count', selector: '.stat-num' }] },

    // ── Video cards: play button "breathes" while the card is hovered/focused ──
    // interest = hover+focus (accessible). listContainer → each card is its own
    // trigger; the Pulse targets that card's .play-btn child (invariant 6/10).
    {
      key: 'videos-pulse',
      trigger: 'interest',
      listContainer: '.video-card',
      conditions: ['motionOK'],
      effects: [{ effectId: 'play-pulse', selector: '.play-btn' }],
    },

    // ── Card hover-lift (accessible CSS-state toggle) ──
    // Keyed on each section's OUTER <section> (a different element than the
    // reveal's inner container) so no key carries two triggers. listContainer
    // makes each card its own interest source.
    { key: 'reviews-lift', trigger: 'interest', listContainer: '.review-card', effects: [{ effectId: 'lift' }] },
    { key: 'training-lift', trigger: 'interest', listContainer: '.course-card', effects: [{ effectId: 'lift' }] },
  ],

  effects: {
    // Entrance: gentle drift-up + fade. Mild enough to leave on under reduced motion.
    'reveal-up': {
      duration: 640,
      easing: 'cubic-bezier(.16,1,.3,1)',
      namedEffect: { type: 'FloatIn', direction: 'bottom' },
    },
    // Section title: clip-path wipe from the inline-start edge.
    'title-wipe': {
      duration: 720,
      easing: 'cubic-bezier(.16,1,.3,1)',
      namedEffect: { type: 'RevealIn', direction: 'bottom' },
    },
    // Hero background parallax — scrubbed across the element's full cover range.
    'bg-parallax': {
      rangeStart: { name: 'cover', offset: { value: 0, unit: 'percentage' } },
      rangeEnd: { name: 'cover', offset: { value: 100, unit: 'percentage' } },
      fill: 'both',
      namedEffect: { type: 'ParallaxScroll', parallaxFactor: 0.3 },
    },
    // About portrait: subtle deterministic scroll-zoom inside its clip frame
    // (keyframeEffect scrubbed by scroll — no preset param ambiguity).
    'photo-zoom': {
      rangeStart: { name: 'cover', offset: { value: 0, unit: 'percentage' } },
      rangeEnd: { name: 'cover', offset: { value: 100, unit: 'percentage' } },
      fill: 'both',
      keyframeEffect: { name: 'photoZoom', keyframes: [{ transform: 'scale(1.02)' }, { transform: 'scale(1.1)' }] },
    },
    // Hero foreground: 3D tilt toward cursor (smoothed so it doesn't snap).
    'fg-tilt': {
      fill: 'both',
      transitionDuration: 240,
      transitionEasing: 'easeOut',
      namedEffect: { type: 'Tilt3DMouse', angle: 4 },
    },
    // Looping "breath" on the play button while its card has interest.
    'play-pulse': {
      duration: 1600,
      iterations: Infinity,
      namedEffect: { type: 'Pulse', intensity: 0.35 },
      triggerType: 'state',
    },
    // Count-up (imperative; no CSS emitted by generate()).
    count: { duration: 1100, easing: 'quadOut', customEffect: countUp },
    // Hover-lift: CSS-state transition toggle (shared timing).
    lift: {
      stateAction: 'toggle',
      transition: {
        duration: 220,
        easing: 'ease-out',
        styleProperties: [
          { name: 'transform', value: 'translateY(-6px)' },
          { name: 'borderColor', value: 'var(--line-strong)' },
          { name: 'boxShadow', value: '0 18px 40px -22px rgba(0,0,0,.7)' },
        ],
      },
    },
  },
};
