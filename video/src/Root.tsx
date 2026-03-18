import { Composition } from "remotion";
import { ProductDemo } from "./ProductDemo";

export const RemotionRoot = () => {
  return (
    <Composition
      id="ProductDemo"
      component={ProductDemo}
      durationInFrames={900}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
