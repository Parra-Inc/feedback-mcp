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

export const TitleScene: React.FC<{ durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pop = spring({ frame, fps, config: { damping: 200 } });
  const markScale = interpolate(pop, [0, 1], [0.7, 1]);
  const titleY = interpolate(
    spring({ frame: frame - 8, fps, config: { damping: 200 } }),
    [0, 1],
    [30, 0]
  );
  const subOpacity = interpolate(frame, [26, 44], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const out = interpolate(
    frame,
    [0, 14, durationInFrames - 14, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ opacity: out }}>
      <Backdrop />
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <div style={{ transform: `scale(${markScale})`, marginBottom: 40 }}>
          <BrandMark size={128} />
        </div>
        <div
          style={{
            fontFamily: MONO,
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: COLOR.emerald,
            marginBottom: 20,
            opacity: subOpacity,
          }}
        >
          Self-hosted · Open source · MIT
        </div>
        <div
          style={{
            fontFamily: SANS,
            fontSize: 104,
            fontWeight: 800,
            letterSpacing: -4,
            color: COLOR.textStrong,
            transform: `translateY(${titleY}px)`,
          }}
        >
          Feedback MCP
        </div>
        <div
          style={{
            fontFamily: SANS,
            fontSize: 34,
            fontWeight: 400,
            color: COLOR.text,
            marginTop: 22,
            opacity: subOpacity,
          }}
        >
          Collect user feedback from any app.{" "}
          <span style={{ color: COLOR.textStrong, fontWeight: 600 }}>
            Analyze it with Claude.
          </span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
