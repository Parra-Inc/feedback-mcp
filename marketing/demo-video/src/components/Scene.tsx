import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Backdrop } from "./Backdrop";
import { Header } from "./Header";

/**
 * Wraps a scene's content with the backdrop, header, and a symmetric
 * fade-in/out. `durationInFrames` must be passed in because useVideoConfig()
 * returns the composition duration, not the enclosing <Sequence>'s.
 */
export const Scene: React.FC<{
  durationInFrames: number;
  badge?: string;
  fade?: number;
  children: React.ReactNode;
}> = ({ durationInFrames, badge, fade = 14, children }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [0, fade, durationInFrames - fade, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ opacity }}>
      <Backdrop />
      <Header badge={badge} />
      {children}
    </AbsoluteFill>
  );
};
