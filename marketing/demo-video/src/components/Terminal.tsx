import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { COLOR, CARD_SHADOW } from "../theme";
import { MONO } from "../fonts";

export type Seg = { t: string; c?: string };
export type Line = Seg[];

/**
 * A window-chrome terminal that types command lines character-by-character,
 * then reveals the response after `respondAt`. Deterministic (frame-driven).
 */
export const Terminal: React.FC<{
  title?: string;
  command: Line[];
  response?: Line[];
  cps?: number; // characters per second
  respondAt?: number; // frame at which the response appears
  width?: number;
}> = ({
  title = "submit-feedback.sh",
  command,
  response = [],
  cps = 42,
  respondAt = 150,
  width = 1180,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const typed = Math.floor((frame / fps) * cps);

  // Walk the command lines, revealing up to `typed` characters total.
  let budget = typed;
  const rendered = command.map((line) => {
    const out: Seg[] = [];
    let active = false;
    for (const seg of line) {
      if (budget <= 0) break;
      const take = Math.min(seg.t.length, budget);
      out.push({ t: seg.t.slice(0, take), c: seg.c });
      budget -= take;
      if (take < seg.t.length) {
        active = true;
        break;
      }
    }
    return { segs: out, active: active && budget <= 0 };
  });

  const caretOn = Math.floor(frame / 8) % 2 === 0;
  const respOpacity = interpolate(frame, [respondAt, respondAt + 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        width,
        borderRadius: 18,
        background: "linear-gradient(180deg, #0c1a15 0%, #0a1613 100%)",
        border: `1px solid ${COLOR.line}`,
        boxShadow: `0 40px 100px rgba(0,0,0,0.5), 0 0 70px rgba(52,211,153,0.08), ${CARD_SHADOW}`,
        overflow: "hidden",
        fontFamily: MONO,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "18px 24px",
          background: "rgba(255,255,255,0.03)",
          borderBottom: `1px solid ${COLOR.line}`,
        }}
      >
        {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
          <div
            key={c}
            style={{ width: 14, height: 14, borderRadius: "50%", background: c }}
          />
        ))}
        <div style={{ marginLeft: 12, fontSize: 17, color: COLOR.textMute }}>
          {title}
        </div>
      </div>

      <div style={{ padding: "28px 32px", fontSize: 26, lineHeight: 1.7 }}>
        {rendered.map((line, i) => (
          <div key={i} style={{ whiteSpace: "pre-wrap", color: COLOR.textStrong }}>
            {line.segs.map((seg, j) => (
              <span key={j} style={{ color: seg.c ?? COLOR.textStrong }}>
                {seg.t}
              </span>
            ))}
            {line.active && caretOn ? (
              <span style={{ color: COLOR.mint }}>▋</span>
            ) : null}
          </div>
        ))}

        {response.length > 0 ? (
          <div
            style={{
              marginTop: 22,
              paddingTop: 18,
              borderTop: `1px solid ${COLOR.line}`,
              opacity: respOpacity,
            }}
          >
            {response.map((line, i) => (
              <div key={i} style={{ whiteSpace: "pre-wrap" }}>
                {line.map((seg, j) => (
                  <span key={j} style={{ color: seg.c ?? COLOR.text }}>
                    {seg.t}
                  </span>
                ))}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
};
