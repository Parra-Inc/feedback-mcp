import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { SCENES, MUSIC_SRC, MUSIC_VOLUME } from "./config";
import { TitleScene } from "./scenes/TitleScene";
import { EndpointScene } from "./scenes/EndpointScene";
import { ConfigScene } from "./scenes/ConfigScene";
import { McpScene } from "./scenes/McpScene";
import { DatabaseScene } from "./scenes/DatabaseScene";
import { SiteScene } from "./scenes/SiteScene";
import { OutroScene } from "./scenes/OutroScene";

export const Demo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#06110d" }}>
      <Sequence from={SCENES.title.from} durationInFrames={SCENES.title.durationInFrames}>
        <TitleScene durationInFrames={SCENES.title.durationInFrames} />
      </Sequence>

      <Sequence from={SCENES.endpoint.from} durationInFrames={SCENES.endpoint.durationInFrames}>
        <EndpointScene durationInFrames={SCENES.endpoint.durationInFrames} />
      </Sequence>

      <Sequence from={SCENES.config.from} durationInFrames={SCENES.config.durationInFrames}>
        <ConfigScene durationInFrames={SCENES.config.durationInFrames} />
      </Sequence>

      <Sequence from={SCENES.mcp.from} durationInFrames={SCENES.mcp.durationInFrames}>
        <McpScene durationInFrames={SCENES.mcp.durationInFrames} />
      </Sequence>

      <Sequence from={SCENES.database.from} durationInFrames={SCENES.database.durationInFrames}>
        <DatabaseScene durationInFrames={SCENES.database.durationInFrames} />
      </Sequence>

      <Sequence from={SCENES.site.from} durationInFrames={SCENES.site.durationInFrames}>
        <SiteScene durationInFrames={SCENES.site.durationInFrames} />
      </Sequence>

      <Sequence from={SCENES.outro.from} durationInFrames={SCENES.outro.durationInFrames}>
        <OutroScene durationInFrames={SCENES.outro.durationInFrames} />
      </Sequence>

      {/* Background music. Silent until you set MUSIC_SRC in config.ts. */}
      {MUSIC_SRC ? (
        <Audio src={staticFile(MUSIC_SRC)} volume={MUSIC_VOLUME} />
      ) : null}
    </AbsoluteFill>
  );
};
