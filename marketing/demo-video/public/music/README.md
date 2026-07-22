# Background music

The demo renders silent until you add a track here and point `MUSIC_SRC` at it.

## Add a track

1. Drop a royalty-free file in this folder, e.g. `track.mp3`.
2. In [`src/config.ts`](../../src/config.ts), set:
   ```ts
   export const MUSIC_SRC: string | null = "music/track.mp3";
   ```
3. Re-render. Tune loudness with `MUSIC_VOLUME` (0–1). Remotion also supports a
   per-frame volume function if you want a fade, e.g.
   `volume={(f) => interpolate(f, [0, 30], [0, 0.55], {extrapolateRight: "clamp"})}`
   in `Demo.tsx`.

## Where to get a clean, licensable track (60s, calm-but-driving tech vibe)

- **Uppbeat** (uppbeat.io), free with attribution, clear license, good "tech/corporate" beds.
- **YouTube Audio Library**, free, filter by mood "Inspirational" / genre "Electronic".
- **Epidemic Sound / Artlist**, paid subscription, safe for commercial launches.
- **Pixabay Music**, CC0-style, no attribution required.

Pick something ~56s or longer (the video is 56s) so it doesn't loop mid-play. If
your track is longer, Remotion trims it to the composition length automatically.

## Licensing note

Tracks are gitignored on purpose (see `.gitignore`), do not commit licensed
audio to the public repo. Keep the license receipt with your launch records.
