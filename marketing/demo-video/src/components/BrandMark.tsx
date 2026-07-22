import React from "react";
import { COLOR } from "../theme";

/** The chat-bubble mark from the repo's OG/banner, drawn with divs. */
export const BrandMark: React.FC<{ size?: number }> = ({ size = 40 }) => {
  const r = size / 40; // scale factor relative to the 40px reference
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 12 * r,
        background: `linear-gradient(170deg, #123128 0%, #0c241d 100%)`,
        border: `${1.5 * r}px solid rgba(52,211,153,0.45)`,
        boxShadow: `0 ${8 * r}px ${24 * r}px rgba(0,0,0,0.4), 0 0 ${24 * r}px rgba(52,211,153,0.16), inset 0 1px 0 rgba(255,255,255,0.1)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: 20 * r,
          height: 15 * r,
          borderRadius: 6 * r,
          background: `linear-gradient(160deg, ${COLOR.emerald}, ${COLOR.emeraldDeep})`,
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 2.5 * r,
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 3 * r,
              height: 3 * r,
              borderRadius: "50%",
              background: "rgba(6,17,13,0.85)",
            }}
          />
        ))}
        <div
          style={{
            position: "absolute",
            bottom: -4 * r,
            left: 4 * r,
            width: 6 * r,
            height: 6 * r,
            background: COLOR.emeraldDeep,
            clipPath: "polygon(0 0, 100% 0, 0 100%)",
          }}
        />
      </div>
    </div>
  );
};
