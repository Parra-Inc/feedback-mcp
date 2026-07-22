import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLOR } from "../theme";
import { MONO } from "../fonts";

export type Bar = { label: string; value: number };

/** Bars that grow with a staggered spring. `value` is 0..1 of full height. */
export const BarChart: React.FC<{
  bars: Bar[];
  height?: number;
  delay?: number;
}> = ({ bars, height = 150, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: 18,
        height,
        marginTop: 8,
      }}
    >
      {bars.map((b, i) => {
        const grow = spring({
          frame: frame - delay - i * 6,
          fps,
          config: { damping: 200 },
        });
        return (
          <div
            key={b.label}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
              height: "100%",
              justifyContent: "flex-end",
            }}
          >
            <div
              style={{
                width: "100%",
                height: `${b.value * grow * 100}%`,
                borderRadius: "8px 8px 0 0",
                background: `linear-gradient(180deg, ${COLOR.emerald}, rgba(52,211,153,0.35))`,
              }}
            />
            <div style={{ fontFamily: MONO, fontSize: 18, color: COLOR.textMute }}>
              {b.label}
            </div>
          </div>
        );
      })}
    </div>
  );
};
