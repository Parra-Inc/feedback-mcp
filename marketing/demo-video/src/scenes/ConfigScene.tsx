import React from "react";
import { AbsoluteFill } from "remotion";
import { Scene } from "../components/Scene";
import { Caption } from "../components/Caption";
import { CodeCard } from "../components/CodeCard";
import { COLOR } from "../theme";

/** "Forms as config." The form JSON writes itself line by line. */
export const ConfigScene: React.FC<{ durationInFrames: number }> = ({
  durationInFrames,
}) => {
  return (
    <Scene durationInFrames={durationInFrames} badge="02 · config">
      <AbsoluteFill
        style={{ alignItems: "center", justifyContent: "center", paddingBottom: 80 }}
      >
        <CodeCard
          filename="config/projects/example-app/forms/bug-report.json"
          perLine={7}
          width={1000}
          lines={[
            [{ t: "{", c: COLOR.textMute }],
            [
              { t: "  " },
              { t: '"slug"', c: COLOR.emerald },
              { t: ": " },
              { t: '"bug-report"', c: COLOR.sky },
              { t: "," },
            ],
            [
              { t: "  " },
              { t: '"name"', c: COLOR.emerald },
              { t: ": " },
              { t: '"Bug Report"', c: COLOR.sky },
              { t: "," },
            ],
            [
              { t: "  " },
              { t: '"fields"', c: COLOR.emerald },
              { t: ": [", c: COLOR.textMute },
            ],
            [
              { t: "    { " },
              { t: '"name"', c: COLOR.emerald },
              { t: ": " },
              { t: '"title"', c: COLOR.sky },
              { t: ", " },
              { t: '"type"', c: COLOR.emerald },
              { t: ": " },
              { t: '"string"', c: COLOR.sky },
              { t: ", " },
              { t: '"required"', c: COLOR.emerald },
              { t: ": " },
              { t: "true", c: COLOR.amberSoft },
              { t: " }," },
            ],
            [
              { t: "    { " },
              { t: '"name"', c: COLOR.emerald },
              { t: ": " },
              { t: '"severity"', c: COLOR.sky },
              { t: ", " },
              { t: '"type"', c: COLOR.emerald },
              { t: ": " },
              { t: '"enum"', c: COLOR.sky },
              { t: ", " },
              { t: '"values"', c: COLOR.emerald },
              { t: ": [", c: COLOR.textMute },
              { t: '"low"', c: COLOR.sky },
              { t: ", " },
              { t: '"high"', c: COLOR.sky },
              { t: "] }" },
            ],
            [{ t: "  ]", c: COLOR.textMute }],
            [{ t: "}", c: COLOR.textMute }],
          ]}
        />
      </AbsoluteFill>
      <Caption
        kicker="Forms as config"
        title="No dashboard. Just files."
      />
    </Scene>
  );
};
