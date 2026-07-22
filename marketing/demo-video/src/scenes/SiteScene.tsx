import React from "react";
import { AbsoluteFill } from "remotion";
import { Scene } from "../components/Scene";
import { Caption } from "../components/Caption";
import { CapturedClip } from "../components/CapturedClip";
import { COLOR } from "../theme";
import { SANS, MONO } from "../fonts";
import captures from "../captures.json";

/**
 * "See it live." Plays the Playwright capture of the marketing site scrolling.
 * Before that capture exists, a browser-chrome placeholder stands in.
 */
export const SiteScene: React.FC<{ durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const fallback = (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingBottom: 80 }}>
      <div
        style={{
          width: 1360,
          height: 720,
          borderRadius: 18,
          overflow: "hidden",
          border: `1px solid ${COLOR.line}`,
          boxShadow: "0 50px 120px rgba(0,0,0,0.55)",
          background: "linear-gradient(180deg, #0c1a15, #0a1613)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "16px 22px",
            borderBottom: `1px solid ${COLOR.line}`,
          }}
        >
          {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
            <div key={c} style={{ width: 13, height: 13, borderRadius: "50%", background: c }} />
          ))}
          <div
            style={{
              marginLeft: 14,
              fontFamily: MONO,
              fontSize: 16,
              color: COLOR.textMute,
            }}
          >
            parra-inc.github.io/feedback-mcp
          </div>
        </div>
        <div
          style={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 20,
            paddingBottom: 60,
          }}
        >
          <div style={{ fontFamily: MONO, fontSize: 18, color: COLOR.textMute }}>
            run `npm run capture` to drop the live-site recording here
          </div>
          <div style={{ fontFamily: SANS, fontSize: 44, fontWeight: 800, color: COLOR.textStrong }}>
            The marketing one-pager, captured with Playwright
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );

  return (
    <Scene durationInFrames={durationInFrames} badge="05 · try it">
      <CapturedClip src={captures.site} fallback={fallback} />
      <Caption kicker="See it live" title="Clone it. Run it in a minute." />
    </Scene>
  );
};
