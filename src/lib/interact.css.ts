// Server-only: register presets + generate the interact CSS ONCE per server
// instance (module top-level runs once), instead of on every SSR request. The
// config is static so the output is constant. Imported by index.astro's
// frontmatter only — never reaches the client bundle.
import { Interact, generate } from '@wix/interact';
import { FloatIn, RevealIn, ParallaxScroll, Tilt3DMouse, Pulse } from '@wix/motion-presets';
import { interactConfig } from './interact.config';

Interact.registerEffects({ FloatIn, RevealIn, ParallaxScroll, Tilt3DMouse, Pulse });

export const interactCSS = generate(interactConfig, false); // useFirstChild=false (vanilla)
