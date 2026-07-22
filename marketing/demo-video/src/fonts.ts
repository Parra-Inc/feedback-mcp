/**
 * Fonts are loaded through @remotion/google-fonts, which self-hosts the files
 * so renders are deterministic and never touch the network at render time.
 */
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";

const inter = loadInter();
const mono = loadMono();

export const SANS = inter.fontFamily;
export const MONO = mono.fontFamily;
