import { Config } from "@remotion/cli/config";

// Rendering defaults. Overridable per-invocation with CLI flags.
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setConcurrency(null); // auto (one thread per core)

// H.264 with a high-quality CRF. Lower is better quality / larger file.
Config.setCodec("h264");
Config.setCrf(18);

// Captured clips (Playwright .webm / VHS .mp4) can be large; give the browser room.
Config.setChromiumOpenGlRenderer("angle");
