import type { InteractConfig } from '@wix/interact';

/**
 * Roadbook "waypoints landing" — one viewEnter trigger on the trips container
 * fans a staggered FloatIn across each .roadbook-row (the rows drift up + fade
 * in one after another, like GPS waypoints dropping onto the map).
 *
 * Shared by the page frontmatter (server: registerEffects → generate CSS) and
 * the client script (browser: registerEffects → create → add). Keeping one
 * source of truth means the generated FOUC CSS can never drift from the config.
 *
 * `triggerType` is intentionally omitted — viewEnter defaults to 'once', which
 * is exactly what an entrance cascade wants (and satisfies invariant 5: the
 * source is the container, the targets are its descendant rows).
 */
export const roadbookConfig: InteractConfig = {
  interactions: [
    {
      key: 'roadbook-seq',
      trigger: 'viewEnter',
      sequences: [
        {
          offset: 110,
          offsetEasing: 'quadOut',
          effects: [{ effectId: 'wpt-in', selector: '.roadbook-row' }],
        },
      ],
    },
  ],
  effects: {
    'wpt-in': {
      duration: 640,
      easing: 'cubic-bezier(.16,1,.3,1)',
      namedEffect: { type: 'FloatIn', direction: 'bottom' },
    },
  },
};
