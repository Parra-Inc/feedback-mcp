import React from "react";
import { Composition } from "remotion";
import { Demo } from "./Demo";
import { VIDEO, TOTAL_FRAMES } from "./config";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Demo"
      component={Demo}
      durationInFrames={TOTAL_FRAMES}
      fps={VIDEO.fps}
      width={VIDEO.width}
      height={VIDEO.height}
    />
  );
};
