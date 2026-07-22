import React from "react";
import { AbsoluteFill } from "remotion";
import { Scene } from "../components/Scene";
import { Caption } from "../components/Caption";
import { Terminal } from "../components/Terminal";
import { CapturedClip } from "../components/CapturedClip";
import { COLOR } from "../theme";
import captures from "../captures.json";

/**
 * "One endpoint in." If a VHS terminal capture exists it plays; otherwise the
 * animated Terminal types the curl call and shows the 200 response.
 */
export const EndpointScene: React.FC<{ durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const animatedTerminal = (
    <AbsoluteFill
      style={{ alignItems: "center", justifyContent: "center", paddingBottom: 90 }}
    >
      <Terminal
        title="submit-feedback.sh"
        cps={46}
        respondAt={168}
        command={[
          [
            { t: "curl ", c: COLOR.mint },
            { t: "-X", c: COLOR.textMute },
            { t: " POST https://feedback.your-app.com/api/v1/feedback \\" },
          ],
          [
            { t: "  -H ", c: COLOR.textMute },
            { t: '"X-Feedback-Key: $INGEST_KEY"', c: COLOR.sky },
            { t: " \\" },
          ],
          [
            { t: "  -d ", c: COLOR.textMute },
            { t: "'{ ", c: COLOR.textMute },
            { t: '"project"', c: COLOR.emerald },
            { t: ": " },
            { t: '"example-app"', c: COLOR.sky },
            { t: ", " },
            { t: '"form"', c: COLOR.emerald },
            { t: ": " },
            { t: '"bug-report"', c: COLOR.sky },
            { t: "," },
          ],
          [
            { t: "     " },
            { t: '"platform"', c: COLOR.emerald },
            { t: ": " },
            { t: '"ios"', c: COLOR.sky },
            { t: ", " },
            { t: '"data"', c: COLOR.emerald },
            { t: ": { " },
            { t: '"title"', c: COLOR.emerald },
            { t: ": " },
            { t: '"Crash on launch"', c: COLOR.sky },
            { t: " } }'" },
          ],
        ]}
        response={[
          [
            { t: "{ ", c: COLOR.textMute },
            { t: '"feedback"', c: COLOR.emerald },
            { t: ": { " },
            { t: '"id"', c: COLOR.emerald },
            { t: ": " },
            { t: '"fb_3xK9…"', c: COLOR.sky },
            { t: ", " },
            { t: '"createdAt"', c: COLOR.emerald },
            { t: ": " },
            { t: '"2026-…"', c: COLOR.sky },
            { t: " } }   " },
            { t: "← 200 OK", c: COLOR.emerald },
          ],
        ]}
      />
    </AbsoluteFill>
  );

  return (
    <Scene durationInFrames={durationInFrames} badge="01 · ingest">
      <CapturedClip src={captures.terminal} fallback={animatedTerminal} />
      <Caption kicker="One endpoint in" title="POST from any app." />
    </Scene>
  );
};
