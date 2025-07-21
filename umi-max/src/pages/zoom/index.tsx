import {
  TransformWrapper,
  TransformComponent,
  useControls,
  useTransformEffect,
  useTransformComponent,
} from "react-zoom-pan-pinch";
import { Input } from "antd";

import { useEffect, useRef, useState } from "react";

import { MD5 } from "crypto-js";

import "./index.less";
const SCALE = [0.1, 0.25, 0.5, 0.75, 1, 1.25, 2, 3, 5];

const image = {
  url: "https://png.pngtree.com/export/pngtree/img/2025-2-20/56828466_3a169b.jpg",
  width: 1000,
  height: 1000,
};

const canvasInfo = {
  width: 600,
  height: 600,
};

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

  const stepRef = useRef(0);

  const content = useTransformComponent(({ state }) => {
    const { previousScale, scale } = state;

    const changeScale = (num: number) => {
      const { width, height } = image;

      if (instance.wrapperComponent) {
        const { width: wrapperW, height: wrapperH } =
          instance.wrapperComponent?.getBoundingClientRect();
        const posX = -(width * num - wrapperW) / 2;
        const posY = -(height * num - wrapperH) / 2;
        setTransform(posX, posY, num, 0);
      }
    };
    return (
      <div className="tools">
        <div>scale: {scale}</div>
        <button onClick={() => zoomIn()}>+</button>
        <button onClick={() => zoomOut()}>-</button>
        <button onClick={() => centerView()}>center</button>
        <button onClick={() => resetTransform()}>clear</button>

        {SCALE.map((item) => {
          return (
            <button
              onClick={() => {
                changeScale(item);
              }}
            >
              x{item}
            </button>
          );
        })}

        <button
          onClick={() => {
            setTransform(-200, -200, 2);
          }}
        >
          setTransform
        </button>
      </div>
    );
  });

  return (
    <div style={{ marginBottom: 20 }}>
      <Input
        type="text"
        onChange={(e) => {
          stepRef.current = Number(e.target.value);
        }}
      />
      {content}
    </div>
  );
};

interface MainProps {
  transform: { positionX: number; positionY: number; scale: number };
}
function Main(props: MainProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={wrapRef}
      style={{ flex: 1, display: "flex", backgroundColor: "#eee" }}
    >
      <div
        style={{
          width: 200,
          background: "#999",
          marginRight: 16,
          height: "100%",
        }}
      ></div>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div style={{ height: 40, background: "pink", marginBottom: 16 }}></div>

        <div style={{ flex: 1 }}>
          <TransformComponent
            wrapperStyle={{
              maxWidth: "100%",
              maxHeight: "calc(100vh - 250px)",
              // width: "100%",
              // height: "100%",
              backgroundColor: "#000",
              // margin: "0 auto",
            }}
            contentProps={
              {
                "data-testid": "content",
              } as React.HTMLAttributes<HTMLDivElement>
            }
          >
            <img
              id="zoom_image"
              src={image.url}
              alt="test"
              width={image.width}
              height={image.height}
            />
          </TransformComponent>
        </div>
        <div style={{ height: 40, background: "pink", marginBottom: 16 }}></div>
      </div>

      <div style={{ width: 200, background: "#999", marginLeft: 16 }}></div>
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
      // initialScale={0.5}
      zoomAnimation={{ animationTime: 0 }}
      minPositionX={-1000}
      maxPositionX={0}
      minPositionY={-1000}
      maxPositionY={0}
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
      centerZoomedOut={true}
      centerOnInit={true}
      onTransformed={(ref, state) => {
        // console.log("onTransformed", ref, state);
        changeTransform(state);
      }}
      // customTransform={(x: number, y: number, scale: number) => {
      //   return "";
      // }}
      onPanning={({ state }) => {
        // console.log("onPanning", state);
      }}
      onWheel={(ref, e) => {
        // console.log('onWheel', ref, e);
      }}
    >
      {(props) => {
        return (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              height: "100vh",
            }}
          >
            <Controls />
            <Main transform={transform} />
          </div>
        );
      }}
    </TransformWrapper>
  );
};

export default Example;
