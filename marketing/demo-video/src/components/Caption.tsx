import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLOR } from "../theme";
import { SANS, MONO } from "../fonts";

/**
 * Lower-third caption. `kicker` is the small mono eyebrow, `title` the big line.
 * Animates in with a spring and up-fade. Positioned bottom-left by default.
 */
export const Caption: React.FC<{
  kicker?: string;
  title: string;
  accent?: string;
  delay?: number;
  align?: "left" | "center";
}> = ({ kicker, title, accent, delay = 0, align = "left" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 200 } });
  const y = interpolate(s, [0, 1], [26, 0]);
  const opacity = interpolate(s, [0, 1], [0, 1]);

  return (
    <div
      style={{
        position: "absolute",
        left: 96,
        right: 96,
        bottom: 96,
        transform: `translateY(${y}px)`,
        opacity,
        textAlign: align,
      }}
    >
      {kicker ? (
        <div
          style={{
            fontFamily: MONO,
            fontSize: 20,
            fontWeight: 600,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: COLOR.emerald,
            marginBottom: 16,
          }}
        >
          {kicker}
        </div>
      ) : null}
      <div
        style={{
          fontFamily: SANS,
          fontSize: 58,
          fontWeight: 800,
          letterSpacing: -2,
          lineHeight: 1.02,
          color: COLOR.textStrong,
        }}
      >
        {title}
        {accent ? (
          <span style={{ color: COLOR.emerald }}> {accent}</span>
        ) : null}
      </div>
    </div>
  );
};
