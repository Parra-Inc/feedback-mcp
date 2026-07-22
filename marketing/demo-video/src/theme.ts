/**
 * Brand tokens, kept in lockstep with the repo's open-assets banner/OG
 * (assets/assets/banner.html) and the Product Hunt gallery. Emerald/teal on
 * near-black green, Inter + JetBrains Mono.
 */

export const COLOR = {
  bg0: "#06110d",
  bg1: "#0b2019",
  bg2: "#081517",
  emerald: "#34d399",
  emeraldDeep: "#0e9f6e",
  mint: "#86efac",
  sky: "#7dd3fc",
  amber: "#f59e0b",
  amberSoft: "#f5c04e",
  ink: "#06110d",
  textStrong: "rgba(255,255,255,0.92)",
  text: "rgba(255,255,255,0.66)",
  textMute: "rgba(255,255,255,0.42)",
  line: "rgba(255,255,255,0.12)",
  cardTop: "#12261f",
  cardBottom: "#0e1f1a",
} as const;

export const BG_GRADIENT = `linear-gradient(135deg, ${COLOR.bg0} 0%, ${COLOR.bg1} 55%, ${COLOR.bg2} 100%)`;

export const CARD_GRADIENT = `linear-gradient(170deg, ${COLOR.cardTop} 0%, ${COLOR.cardBottom} 100%)`;

export const CARD_SHADOW =
  "0 20px 60px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.08)";
