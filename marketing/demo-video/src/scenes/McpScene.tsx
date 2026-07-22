import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Scene } from "../components/Scene";
import { Caption } from "../components/Caption";
import { BarChart } from "../components/BarChart";
import { COLOR, CARD_SHADOW } from "../theme";
import { SANS, MONO } from "../fonts";

const THEMES = [
  { n: "18×", label: "Dark mode", note: "most-requested feature" },
  { n: "11×", label: "Offline sync", note: '"notes vanish on the subway"' },
  { n: "7×", label: "Widget", note: "home-screen quick add" },
];

export const McpScene: React.FC<{ durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const askIn = spring({ frame: frame - 8, fps, config: { damping: 200 } });
  const replyIn = spring({ frame: frame - 60, fps, config: { damping: 200 } });

  return (
    <Scene durationInFrames={durationInFrames} badge="03 · read">
      <AbsoluteFill
        style={{ alignItems: "center", justifyContent: "center", paddingBottom: 70 }}
      >
        <div
          style={{
            width: 1180,
            borderRadius: 22,
            background: "linear-gradient(180deg, #10201a 0%, #0d1a16 100%)",
            border: `1px solid ${COLOR.line}`,
            boxShadow: `0 50px 120px rgba(0,0,0,0.55), 0 0 80px rgba(52,211,153,0.1), ${CARD_SHADOW}`,
            padding: "34px 38px 40px",
            fontFamily: SANS,
          }}
        >
          {/* connection header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              paddingBottom: 22,
              marginBottom: 26,
              borderBottom: `1px solid ${COLOR.line}`,
              fontFamily: MONO,
              fontSize: 18,
              color: COLOR.textMute,
            }}
          >
            <div
              style={{
                width: 11,
                height: 11,
                borderRadius: "50%",
                background: COLOR.emerald,
                boxShadow: `0 0 12px ${COLOR.emerald}`,
              }}
            />
            feedback · connected over MCP
          </div>

          {/* user question */}
          <div
            style={{
              marginLeft: 220,
              marginBottom: 26,
              padding: "18px 22px",
              fontSize: 26,
              fontWeight: 600,
              color: COLOR.textStrong,
              background: "rgba(255,255,255,0.07)",
              border: `1px solid ${COLOR.line}`,
              borderRadius: "18px 18px 6px 18px",
              opacity: askIn,
              transform: `translateY(${interpolate(askIn, [0, 1], [16, 0])}px)`,
            }}
          >
            What are iOS users asking for most this week?
          </div>

          {/* Claude reply */}
          <div
            style={{
              marginRight: 90,
              padding: "24px 26px 28px",
              background: "rgba(52,211,153,0.08)",
              border: "1px solid rgba(52,211,153,0.22)",
              borderRadius: "18px 18px 18px 6px",
              opacity: replyIn,
              transform: `translateY(${interpolate(replyIn, [0, 1], [16, 0])}px)`,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontSize: 22,
                fontWeight: 700,
                color: COLOR.mint,
                marginBottom: 20,
              }}
            >
              <Spark />
              42 submissions · top 3 themes
            </div>

            {THEMES.map((t, i) => {
              const s = spring({
                frame: frame - 78 - i * 12,
                fps,
                config: { damping: 200 },
              });
              return (
                <div
                  key={t.label}
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 16,
                    marginBottom: 14,
                    opacity: s,
                    transform: `translateX(${interpolate(s, [0, 1], [-12, 0])}px)`,
                  }}
                >
                  <div
                    style={{
                      fontFamily: MONO,
                      fontSize: 20,
                      fontWeight: 700,
                      color: COLOR.emerald,
                      width: 52,
                    }}
                  >
                    {t.n}
                  </div>
                  <div style={{ fontSize: 24, color: COLOR.textStrong, fontWeight: 500 }}>
                    {t.label}
                    <span style={{ color: COLOR.text, fontWeight: 400 }}>
                      {" "}
                      : {t.note}
                    </span>
                  </div>
                </div>
              );
            })}

            <div
              style={{
                marginTop: 22,
                paddingTop: 20,
                borderTop: `1px solid ${COLOR.line}`,
              }}
            >
              <BarChart
                delay={126}
                height={150}
                bars={[
                  { label: "dark", value: 1.0 },
                  { label: "sync", value: 0.61 },
                  { label: "widget", value: 0.39 },
                  { label: "export", value: 0.22 },
                  { label: "other", value: 0.14 },
                ]}
              />
            </div>
          </div>
        </div>
      </AbsoluteFill>
      <Caption kicker="MCP out" title="Your AI is the" accent="dashboard." />
    </Scene>
  );
};

const Spark: React.FC = () => (
  <div
    style={{
      width: 20,
      height: 20,
      background: `radial-gradient(circle at 50% 50%, ${COLOR.mint}, ${COLOR.emerald})`,
      clipPath:
        "polygon(50% 0%, 61% 39%, 100% 50%, 61% 61%, 50% 100%, 39% 61%, 0% 50%, 39% 39%)",
    }}
  />
);
