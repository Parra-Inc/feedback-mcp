import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { BG_GRADIENT, COLOR } from "../theme";

/**
 * The brand backdrop: grid + drifting emerald glows + vignette. The glow drift
 * is derived from the frame so it is deterministic across renders.
 */
export const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame / 90) * 24;

  return (
    <AbsoluteFill style={{ background: BG_GRADIENT }}>
      {/* grid */}
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage:
            "radial-gradient(ellipse 92% 82% at 50% 46%, black 40%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 92% 82% at 50% 46%, black 40%, transparent 100%)",
        }}
      />
      {/* glows */}
      <div
        style={{
          position: "absolute",
          top: "42%",
          left: `${8 + drift / 20}%`,
          width: 1000,
          height: 720,
          transform: "translateY(-50%)",
          background: `radial-gradient(ellipse at center, ${hexA(COLOR.emerald, 0.13)} 0%, transparent 68%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "54%",
          right: `${4 - drift / 20}%`,
          width: 900,
          height: 780,
          transform: "translateY(-50%)",
          background: `radial-gradient(ellipse at center, ${hexA(COLOR.emeraldDeep, 0.16)} 0%, transparent 70%)`,
        }}
      />
      {/* vignette */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 120% 110% at 50% 50%, transparent 55%, rgba(3,10,8,0.6) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

function hexA(hex: string, a: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r},${g},${b},${a})`;
}
