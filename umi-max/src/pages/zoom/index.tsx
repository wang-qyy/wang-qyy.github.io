import {
  TransformWrapper,
  TransformComponent,
  useControls,
} from "react-zoom-pan-pinch";

import { useEffect, useRef, useState } from "react";

import "./index.less";

const Controls = () => {
  const {
    zoomIn,
    zoomOut,
    resetTransform,
    setTransform,
    centerView,
    zoomToElement,
    instance,
  } = useControls();

  return (
    <div className="tools">
      <button onClick={() => zoomIn()}>+</button>
      <button onClick={() => zoomOut()}>-</button>
      <button onClick={() => centerView()}>center</button>
      <button onClick={() => resetTransform()}>x</button>
      <button
        onClick={() => {
          setTransform(0, 0, 3);
          zoomIn(3 - instance.transformState.scale);
          // centerView();
        }}
      >
        X3
      </button>
      <button
        onClick={() => {
          setTransform(200, 200, 1);
        }}
      >
        setTransform
      </button>
    </div>
  );
};

interface MainProps {
  transform: { positionX: number; positionY: number; scale: number };
}
function Main(props: MainProps) {
  const wrapRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={wrapRef} style={{ backgroundColor: "pink" }}>
      <TransformComponent
        wrapperStyle={{
          width: "calc(100vw - 100px)",
          height: "calc(100vh - 100px)",
          backgroundColor: "#000",
        }}
        contentProps={
          {
            "data-testid": "content",
          } as React.HTMLAttributes<HTMLDivElement>
        }
      >
        <img
          id="zoom_image"
          src="https://png.pngtree.com/export/pngtree/img/2025-2-20/56828466_3a169b.jpg"
          alt="test"
        />
      </TransformComponent>
    </div>
  );
}

const Example = () => {
  const [transform, changeTransform] = useState({
    positionX: 0,
    positionY: 0,
    scale: 1,
  });

  return (
    <TransformWrapper
      doubleClick={{ disabled: true }}
      minScale={0.1}
      zoomAnimation={{ animationTime: 0 }}
      // initialScale={0.6}
      wheel={{
        activationKeys: ["Control", "Meta"],
        wheelDisabled: true,
      }}
      panning={{
        // activationKeys: ["Control", "Meta"],
        wheelPanning: true,
        // allowLeftClickPan: false,
        // allowRightClickPan: false,
        // allowMiddleClickPan: false,
      }}
      centerZoomedOut={false}
      onTransformed={(ref, state) => {
        console.log("onTransformed", ref, state);
        // setCanvasTransform(state);
      }}
      onPanning={({ state }) => {
        // console.log("onPanning", state);
      }}
      onWheel={(ref, e) => {
        // console.log('onWheel', ref, e);
      }}
    >
      {(props) => {
        return (
          <>
            <Controls />
            <Main transform={transform} />
          </>
        );
      }}
    </TransformWrapper>
  );
};

export default Example;
