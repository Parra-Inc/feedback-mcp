/**
 * Single source of truth for the video's dimensions, frame rate, and the
 * frame ranges of each scene. `script.md` documents the same beats in seconds;
 * if you change a duration here, update the script (seconds = frames / fps).
 */

export const VIDEO = {
  fps: 30,
  width: 1920,
  height: 1080,
} as const;

/**
 * Optional background music. Drop a royalty-free track at
 * `public/music/track.mp3`, then set this to "music/track.mp3".
 * Left null so the video renders (silent) before you add audio.
 * See public/music/README.md for sourcing.
 */
export const MUSIC_SRC: string | null = null;
export const MUSIC_VOLUME = 0.55;

/** Scene timeline. `from` is the absolute start frame; keep them contiguous. */
export const SCENES = {
  title: { from: 0, durationInFrames: 120 }, // 0.0s  – 4.0s
  endpoint: { from: 120, durationInFrames: 300 }, // 4.0s  – 14.0s
  config: { from: 420, durationInFrames: 210 }, // 14.0s – 21.0s
  mcp: { from: 630, durationInFrames: 390 }, // 21.0s – 34.0s
  database: { from: 1020, durationInFrames: 210 }, // 34.0s – 41.0s
  site: { from: 1230, durationInFrames: 270 }, // 41.0s – 50.0s
  outro: { from: 1500, durationInFrames: 180 }, // 50.0s – 56.0s
} as const;

/** Total composition length = end of the last scene. */
export const TOTAL_FRAMES =
  SCENES.outro.from + SCENES.outro.durationInFrames; // 1680 = 56s
