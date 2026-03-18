import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { IntroScene } from "./scenes/IntroScene";
import { UrlInputScene } from "./scenes/UrlInputScene";
import { AnalysisScene } from "./scenes/AnalysisScene";
import { ResultsScene } from "./scenes/ResultsScene";
import { OutroScene } from "./scenes/OutroScene";

// 30 seconds at 30fps = 900 frames
// Scene durations (before transition overlaps):
// Intro: 165 frames (~5.5s)
// URL Input: 195 frames (~6.5s)
// Analysis: 165 frames (~5.5s)
// Results: 255 frames (~8.5s)
// Outro: 180 frames (~6s)
// 4 transitions × 15 frames = 60 frames overlap
// Total: 165+195+165+255+180 - 60 = 900 frames ✓

const TRANSITION_DURATION = 15;

export const ProductDemo: React.FC = () => {
  return (
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={165}>
        <IntroScene />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
      />

      <TransitionSeries.Sequence durationInFrames={195}>
        <UrlInputScene />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={slide({ direction: "from-right" })}
        timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
      />

      <TransitionSeries.Sequence durationInFrames={165}>
        <AnalysisScene />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
      />

      <TransitionSeries.Sequence durationInFrames={255}>
        <ResultsScene />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={slide({ direction: "from-bottom" })}
        timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
      />

      <TransitionSeries.Sequence durationInFrames={180}>
        <OutroScene />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};
