import React from "react";
import { BrandMark } from "./BrandMark";
import { COLOR } from "../theme";
import { SANS, MONO } from "../fonts";

/** Persistent top bar: brand lockup left, scene badge right. */
export const Header: React.FC<{ badge?: string }> = ({ badge }) => {
  return (
    <>
      <div
        style={{
          position: "absolute",
          top: 56,
          left: 96,
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <BrandMark size={48} />
        <div
          style={{
            fontFamily: SANS,
            fontSize: 26,
            fontWeight: 700,
            color: COLOR.textStrong,
            letterSpacing: -0.5,
          }}
        >
          Feedback MCP
        </div>
      </div>
      {badge ? (
        <div
          style={{
            position: "absolute",
            top: 64,
            right: 96,
            fontFamily: MONO,
            fontSize: 16,
            fontWeight: 600,
            letterSpacing: 1.5,
            color: COLOR.textMute,
          }}
        >
          {badge}
        </div>
      ) : null}
    </>
  );
};
