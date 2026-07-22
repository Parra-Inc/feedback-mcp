import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { COLOR, CARD_SHADOW } from "../theme";
import { MONO } from "../fonts";
import type { Line } from "./Terminal";

/**
 * A file/code window whose lines reveal one after another (line-by-line, not
 * char-by-char) for a calmer "code writing itself" feel than the terminal.
 */
export const CodeCard: React.FC<{
  filename: string;
  lines: Line[];
  perLine?: number; // frames between each line appearing
  width?: number;
}> = ({ filename, lines, perLine = 6, width = 900 }) => {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        width,
        borderRadius: 16,
        background: "linear-gradient(180deg, #0c1a15 0%, #0a1613 100%)",
        border: `1px solid ${COLOR.line}`,
        boxShadow: `0 40px 100px rgba(0,0,0,0.5), ${CARD_SHADOW}`,
        overflow: "hidden",
        fontFamily: MONO,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "16px 22px",
          background: "rgba(255,255,255,0.03)",
          borderBottom: `1px solid ${COLOR.line}`,
        }}
      >
        {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
          <div
            key={c}
            style={{ width: 13, height: 13, borderRadius: "50%", background: c }}
          />
        ))}
        <div style={{ marginLeft: 12, fontSize: 16, color: COLOR.textMute }}>
          {filename}
        </div>
      </div>

      <div style={{ padding: "26px 30px", fontSize: 25, lineHeight: 1.75 }}>
        {lines.map((line, i) => {
          const start = i * perLine;
          const opacity = interpolate(frame, [start, start + 8], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const x = interpolate(frame, [start, start + 8], [10, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <div
              key={i}
              style={{
                whiteSpace: "pre-wrap",
                opacity,
                transform: `translateX(${x}px)`,
              }}
            >
              {line.length === 0 ? (
                <span>&nbsp;</span>
              ) : (
                line.map((seg, j) => (
                  <span key={j} style={{ color: seg.c ?? COLOR.textStrong }}>
                    {seg.t}
                  </span>
                ))
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
