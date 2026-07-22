import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Backdrop } from "../components/Backdrop";
import { BrandMark } from "../components/BrandMark";
import { COLOR } from "../theme";
import { SANS, MONO } from "../fonts";

export const OutroScene: React.FC<{ durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const markIn = spring({ frame, fps, config: { damping: 200 } });
  const titleIn = spring({ frame: frame - 8, fps, config: { damping: 200 } });
  const repoIn = spring({ frame: frame - 26, fps, config: { damping: 200 } });
  const chipsIn = interpolate(frame, [40, 58], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const out = interpolate(
    frame,
    [0, 14, durationInFrames - 20, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ opacity: out }}>
      <Backdrop />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
        <div style={{ transform: `scale(${interpolate(markIn, [0, 1], [0.7, 1])})`, marginBottom: 36 }}>
          <BrandMark size={104} />
        </div>
        <div
          style={{
            fontFamily: SANS,
            fontSize: 84,
            fontWeight: 800,
            letterSpacing: -3,
            color: COLOR.textStrong,
            textAlign: "center",
            transform: `translateY(${interpolate(titleIn, [0, 1], [24, 0])}px)`,
            opacity: titleIn,
          }}
        >
          No dashboard. <span style={{ color: COLOR.emerald }}>On purpose.</span>
        </div>
        <div
          style={{
            fontFamily: SANS,
            fontSize: 30,
            color: COLOR.text,
            marginTop: 22,
            opacity: titleIn,
          }}
        >
          Free, open-source, self-hosted. Own your feedback.
        </div>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 14,
            marginTop: 40,
            fontFamily: MONO,
            fontSize: 26,
            fontWeight: 700,
            color: COLOR.ink,
            background: `linear-gradient(160deg, ${COLOR.emerald}, ${COLOR.emeraldDeep})`,
            borderRadius: 100,
            padding: "18px 38px",
            boxShadow: "0 18px 50px rgba(52,211,153,0.3)",
            opacity: repoIn,
            transform: `scale(${interpolate(repoIn, [0, 1], [0.94, 1])})`,
          }}
        >
          ★ github.com/Parra-Inc/feedback-mcp
        </div>
        <div style={{ display: "flex", gap: 14, marginTop: 30, opacity: chipsIn }}>
          {["MIT licensed", "Next.js 16 · Prisma 7", "MCP over streamable HTTP"].map((c) => (
            <div
              key={c}
              style={{
                fontFamily: MONO,
                fontSize: 17,
                color: COLOR.text,
                background: "rgba(255,255,255,0.045)",
                border: `1px solid ${COLOR.line}`,
                borderRadius: 100,
                padding: "10px 20px",
              }}
            >
              {c}
            </div>
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
