# Remotion reference

Practical, opinionated notes for building videos with [Remotion](https://remotion.dev)
(v4). This is the reference the `/demo-video` skill points at. It captures the parts
that actually bite: determinism, timing, async assets, and rendering.

> **Licensing (read first).** Remotion is source-available, not classic OSS. Individuals
> and companies up to 3 people use it free; companies of 4+ need a **company license**
> (remotion.pro). Feedback MCP is a Parra project, so confirm the org's license status
> before shipping renders commercially. Nothing else in this doc changes based on the
> license.

---

## Mental model

A Remotion video is a **React component rendered once per frame**. The current frame is
the only clock. Everything visual is a pure function of `frame`, same frame in, same
pixels out. That single rule drives every best practice below: if a render isn't
deterministic, scrubbing, re-renders, and distributed rendering all break.

- **Composition** = one renderable video (id, component, `durationInFrames`, `fps`,
  `width`, `height`, `defaultProps`). Registered in `Root.tsx`.
- **Frame** = `useCurrentFrame()`. Inside a `<Sequence>` it is **local** (0-based to that
  sequence). Outside, it's absolute.
- **Config** = `useVideoConfig()` returns the *composition's* `fps`, `width`, `height`,
  `durationInFrames`. It does **not** return the enclosing sequence's length, pass scene
  durations as props (this project does).

## Project shape

```
src/
  index.ts         registerRoot(RemotionRoot)
  Root.tsx         <Composition .../> for each video
  Demo.tsx         the composition component
  scenes/          one component per scene
  components/      reusable pieces
remotion.config.ts render-time config (codec, crf, image format)
public/            assets referenced via staticFile()
```

Entry point defaults to `src/index.ts`. `registerRoot` must be called there.

## Timing: interpolate and spring

```ts
const frame = useCurrentFrame();
const { fps } = useVideoConfig();

// linear map with clamping (ALWAYS clamp unless you want extrapolation)
const opacity = interpolate(frame, [0, 15], [0, 1], {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
});

// natural motion, spring returns ~0→1
const s = spring({ frame, fps, config: { damping: 200 } });
const y = interpolate(s, [0, 1], [40, 0]);
```

- `spring()` **needs `fps`** or it throws. `damping: 200` is a good "settle, no bounce."
- Stagger a list by offsetting the frame: `spring({ frame: frame - i * 6, fps })`.
- Reach for `Easing` (`Easing.bezier`, `Easing.out(Easing.cubic)`) inside `interpolate`
  when a spring is overkill.

## Sequencing

- `<Sequence from={f} durationInFrames={n}>` shifts children so their local frame starts
  at 0 and they only mount within the window. This is how you place scenes on a timeline.
- `<Series>` / `<Series.Sequence durationInFrames={n}>` lays clips back-to-back without
  computing `from` yourself.
- `@remotion/transitions` (`TransitionSeries` + presets `fade()`, `slide()`, `wipe()`,
  `clockWipe()`) cross-fades between sequences. Note transitions **overlap** and shorten
  total duration by the transition length, account for it, or (as this project does) do
  per-scene fade-in/out with `interpolate` for exact, predictable timing.
- `<AbsoluteFill>` = a `position:absolute; inset:0; display:flex` layer. Stack them for
  backgrounds/overlays.

## Assets

- **Reference everything in `public/` via `staticFile("path/under/public")`.** Never a raw
  relative path or an http URL you don't control (breaks determinism).
- Media components:
  - `<Img src={staticFile("x.png")} />`, waits for load before capturing the frame.
  - `<OffthreadVideo src={staticFile("clip.webm")} />`, **preferred for embedded video at
    render time.** Extracts exact frames with ffmpeg; more accurate and lighter than
    `<Video>`. Supports mp4/webm/mov. Use `startFrom` / `endAt` (in frames) to trim.
  - `<Video>`, the DOM `<video>`; fine in the Studio preview, less exact when rendering.
  - `<Audio src={staticFile("track.mp3")} volume={0.5} />`, `volume` can be a number or a
    `(frame) => number` for fades. `startFrom`/`endAt` trim. Remotion muxes it in.
- **Fonts:** use `@remotion/google-fonts/<Family>` → `loadFont()` returns `{ fontFamily }`.
  It self-hosts the font so renders never hit the network. (Loading a font via a raw
  `@import` in CSS is nondeterministic and can render a fallback on the first frames.)

## Determinism, the rules that prevent silent bugs

Rendering happens frame-by-frame, often across many parallel headless browsers. So:

- **No `Date.now()`, `new Date()`, `Math.random()`, or reading real time.** Derive
  time-like values from `frame` (`frame / fps`), and seed any randomness from the frame or
  pass it via props. (These are exactly the calls disallowed in workflow scripts too, for
  the same reason.)
- **No mutable module-level state** that changes across frames.
- **Load async data before rendering the frame** with `delayRender()`/`continueRender()`:

  ```ts
  const [handle] = useState(() => delayRender("loading stats"));
  useEffect(() => {
    fetch(staticFile("data.json")).then(() => continueRender(handle));
  }, [handle]);
  ```

  Or, better for inputs, compute/fetch in `calculateMetadata()` on the `<Composition>` and
  pass results as props. Prefer importing committed JSON (this project imports
  `captures.json`) over runtime fetches.

## Inputs / props

- Type `defaultProps` with a zod schema and pass `schema={...}` to `<Composition>`, the
  Studio then renders an editable props panel, and `npx remotion render --props=file.json`
  (or `--props='{"...":...}'`) overrides them per render. Good for A/B copy or a `music`
  toggle.

## Rendering & previewing

```bash
npm run studio                 # interactive preview + prop editor (localhost:3000)
npx remotion render Demo out/video.mp4          # render the "Demo" composition
npx remotion still Demo out/thumb.png --frame=690   # one frame → PNG (great for OG/thumb)
npx remotion render Demo out/v.mp4 --props=./props.json --concurrency=4 --crf=18
npx remotion compositions       # list composition ids
npx remotion benchmark          # find a good concurrency for this machine
```

- First render downloads a Remotion-managed Chromium (~150 MB) and uses the bundled
  ffmpeg. No system ffmpeg needed.
- `remotion.config.ts` sets defaults (codec `h264`, `crf` 18 = high quality, image format
  `jpeg` for speed). CLI flags override the config.
- Codecs: `h264` (mp4, universal), `h265`, `vp8`/`vp9` (webm), `gif`, `prores` (editing),
  plus `--audio-codec`. For social, h264 mp4 is safest.
- Transparent video: `--codec=vp8`/`prores` + `--image-format=png` and a transparent
  background.

## Performance

- Concurrency defaults to one thread per core; lower it (`--concurrency`) if you hit
  memory pressure with big embedded videos.
- Prefer `OffthreadVideo` over `Video` for renders.
- `--image-format=jpeg` renders faster than `png`; use `png` only when you need alpha.
- Keep DOM per frame lean; giant blurs/shadows across full-screen layers are the usual
  slowness. Precompute where you can.
- `--scale` renders at a multiple of composition size (e.g. `2` for a crisp downscale).

## Common pitfalls

| Symptom | Cause | Fix |
|---|---|---|
| Animation flickers / differs between preview and render | `Math.random()`/`Date.now()` in render | Derive from `frame`; seed via props |
| Blank/last-frame freeze where a video should play | Clip shorter than its `<Sequence>` | Trim the sequence to the clip, or capture a longer clip |
| Font renders as fallback on first frames | CSS `@import` font | Use `@remotion/google-fonts` `loadFont()` |
| Fade timing wrong inside a scene | Used `useVideoConfig().durationInFrames` (whole comp) for a scene | Pass the scene length as a prop |
| Image missing at render but fine in preview | Raw relative path / remote URL | Put it in `public/`, use `staticFile()` |
| `spring is not a function of fps` | Called `spring()` without `fps` | Pass `fps` from `useVideoConfig()` |

## Packages worth knowing

- `@remotion/cli`, `remotion` CLI + `remotion studio`.
- `@remotion/transitions`, scene transitions.
- `@remotion/google-fonts`, deterministic fonts.
- `@remotion/media-utils`, `getAudioData`, `visualizeAudio` (waveforms/bars synced to
  music), `getVideoMetadata`.
- `@remotion/shapes`, parametric SVG shapes.
- `@remotion/lambda` / `@remotion/cloudrun`, render at scale in the cloud (CI).
- `@remotion/player`, embed the composition as an interactive React component on a web
  page (e.g. an on-page demo player).

## How this project uses all of the above

- One composition, `Demo`, 1680 frames @ 30fps, assembled from 7 scene components with
  per-scene fade in/out (no transition overlap → exact timings).
- `captures.json` (committed) selects between animated fallbacks and real captured clips
  (`OffthreadVideo`), so it renders before any footage exists.
- Fonts via `@remotion/google-fonts`, brand tokens in `theme.ts`, all timing in
  `config.ts`.
- Music is an optional `<Audio>` gated behind `MUSIC_SRC` so a silent render always works.
