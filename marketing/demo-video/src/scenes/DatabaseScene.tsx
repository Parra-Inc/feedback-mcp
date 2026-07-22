import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Scene } from "../components/Scene";
import { COLOR, CARD_GRADIENT, CARD_SHADOW } from "../theme";
import { SANS, MONO } from "../fonts";

const DBS = [
  { name: "PostgreSQL", tag: "production default", value: "postgresql", accent: COLOR.emerald, primary: true },
  { name: "SQLite", tag: "one container + a volume", value: "sqlite", accent: "#cbd5e1", primary: false },
  { name: "Cloudflare D1", tag: "SQLite at the edge", value: "d1", accent: COLOR.sky, primary: false },
];

const DEPLOYS = [
  { label: "Render", dot: "#46e3b1" },
  { label: "Vercel", dot: "#ffffff" },
  { label: "Cloudflare Workers", dot: "#f6821f" },
  { label: "Docker anywhere", dot: "#2496ed" },
];

export const DatabaseScene: React.FC<{ durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const titleIn = spring({ frame, fps, config: { damping: 200 } });

  return (
    <Scene durationInFrames={durationInFrames} badge="04 · own your data">
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 190 }}>
        <div
          style={{
            fontFamily: MONO,
            fontSize: 20,
            fontWeight: 600,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: COLOR.emerald,
            marginBottom: 18,
            opacity: titleIn,
          }}
        >
          Your database · your infra
        </div>
        <div
          style={{
            fontFamily: SANS,
            fontSize: 68,
            fontWeight: 800,
            letterSpacing: -2.5,
            color: COLOR.textStrong,
            opacity: titleIn,
            transform: `translateY(${interpolate(titleIn, [0, 1], [20, 0])}px)`,
          }}
        >
          One env var. Three databases.
        </div>

        {/* cards */}
        <div style={{ display: "flex", gap: 30, marginTop: 70 }}>
          {DBS.map((db, i) => {
            const s = spring({
              frame: frame - 18 - i * 8,
              fps,
              config: { damping: 200 },
            });
            return (
              <div
                key={db.name}
                style={{
                  width: 380,
                  borderRadius: 18,
                  background: CARD_GRADIENT,
                  border: db.primary
                    ? "1px solid rgba(52,211,153,0.42)"
                    : `1px solid ${COLOR.line}`,
                  boxShadow: db.primary
                    ? `0 20px 60px rgba(0,0,0,0.42), 0 0 44px rgba(52,211,153,0.14), ${CARD_SHADOW}`
                    : CARD_SHADOW,
                  padding: "28px 28px 26px",
                  opacity: s,
                  transform: `translateY(${interpolate(s, [0, 1], [26, 0])}px)`,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 13,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "rgba(255,255,255,0.06)",
                    }}
                  >
                    <div
                      style={{
                        width: 24,
                        height: 26,
                        borderRadius: "12px 12px 9px 9px / 6px 6px 5px 5px",
                        background: `linear-gradient(160deg, ${db.accent}, ${db.accent})`,
                        opacity: 0.9,
                      }}
                    />
                  </div>
                  <div>
                    <div style={{ fontFamily: SANS, fontSize: 26, fontWeight: 700, color: COLOR.textStrong }}>
                      {db.name}
                    </div>
                    <div style={{ fontFamily: MONO, fontSize: 15, color: COLOR.textMute, marginTop: 2 }}>
                      {db.tag}
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: 17,
                    color: COLOR.textStrong,
                    background: "rgba(0,0,0,0.28)",
                    border: `1px solid ${COLOR.line}`,
                    borderRadius: 10,
                    padding: "12px 14px",
                    whiteSpace: "nowrap",
                  }}
                >
                  DATABASE_PROVIDER=
                  <span style={{ color: COLOR.mint }}>{db.value}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* deploy targets */}
        <div style={{ marginTop: 64, display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
          <div style={{ fontFamily: MONO, fontSize: 16, letterSpacing: 3, textTransform: "uppercase", color: COLOR.textMute }}>
            Deploy in one click
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            {DEPLOYS.map((d, i) => {
              const s = spring({ frame: frame - 40 - i * 5, fps, config: { damping: 200 } });
              return (
                <div
                  key={d.label}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 12,
                    fontFamily: SANS,
                    fontSize: 21,
                    fontWeight: 600,
                    color: COLOR.textStrong,
                    background: "rgba(255,255,255,0.05)",
                    border: `1px solid ${COLOR.line}`,
                    borderRadius: 100,
                    padding: "13px 26px",
                    opacity: s,
                  }}
                >
                  <div style={{ width: 12, height: 12, borderRadius: "50%", background: d.dot }} />
                  {d.label}
                </div>
              );
            })}
          </div>
        </div>
      </AbsoluteFill>
    </Scene>
  );
};
