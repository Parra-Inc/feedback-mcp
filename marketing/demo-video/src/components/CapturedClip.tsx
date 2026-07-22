import React from "react";
import { OffthreadVideo, staticFile } from "remotion";
import { COLOR } from "../theme";

/**
 * Plays a captured clip (VHS terminal .mp4 or Playwright .webm) from public/.
 * When the clip is null (not captured yet) it renders `fallback` instead, so
 * the composition builds and previews before any footage exists.
 *
 * The clip sits inside a rounded "device" frame so real captures match the
 * polish of the animated scenes.
 */
export const CapturedClip: React.FC<{
  src: string | null;
  fallback: React.ReactNode;
  startFrom?: number;
  frameWidth?: number;
  frameHeight?: number;
}> = ({ src, fallback, startFrom = 0, frameWidth = 1360, frameHeight = 766 }) => {
  if (!src) {
    return <>{fallback}</>;
  }
  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "52%",
        transform: "translate(-50%, -50%)",
        width: frameWidth,
        height: frameHeight,
        borderRadius: 18,
        overflow: "hidden",
        border: `1px solid ${COLOR.line}`,
        boxShadow:
          "0 50px 120px rgba(0,0,0,0.55), 0 0 80px rgba(52,211,153,0.08)",
        background: "#0a1613",
      }}
    >
      <OffthreadVideo
        src={staticFile(src)}
        startFrom={startFrom}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </div>
  );
};
