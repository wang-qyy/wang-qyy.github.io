import { Canvas } from "fabric";
import { Button } from "antd";
import { useEffect, useRef } from "react";

import data, { cropObj, rawpixelObj } from "./data";

export default () => {
  const canvasRef = useRef<Canvas>();
  useEffect(() => {
    const canvasDom = document.getElementById("canvas") as HTMLCanvasElement;

    const canvas = new Canvas(canvasDom);
    canvasRef.current = canvas;
    // canvas.loadFromJSON({ objects: [object, { type: "IText", text: "1234" }] });
    canvas.loadFromJSON(data);
    canvas.requestRenderAll();

    canvas.on({
      "object:modified": (a) => {
        console.log(a);
      },
    });
    canvas.toJSON();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <div style={{ lineHeight: 2 }}>
        clipSize:
        <br />
        width : {rawpixelObj.width} * {rawpixelObj.scaleX} =
        {rawpixelObj.width * rawpixelObj.scaleX}
        <br />
        height : {rawpixelObj.height} * {rawpixelObj.scaleY} =
        {rawpixelObj.height * rawpixelObj.scaleY}
        <br />
        imageSize:
        <br />
        width :{rawpixelObj.originalWidth}*{rawpixelObj.scaleX}=
        {rawpixelObj.originalWidth * rawpixelObj.scaleX}
        <br />
        height :{rawpixelObj.originalHeight}*{rawpixelObj.scaleY}=
        {rawpixelObj.originalHeight * rawpixelObj.scaleY}
      </div>
      <Button
        onClick={() => {
          // console.log(canvasRef.current?.getActiveObject()?.toSVG());
          console.log(canvasRef.current?.toSVG());
        }}
      >
        导出
      </Button>
      <div>
        imageSize:
        {cropObj.scaleX * cropObj.assetWidth} *
        {cropObj.scaleY * cropObj.assetHeight}
        <br />
        clipSize:
        {cropObj.clipPath.width * cropObj.scaleX} *
        {cropObj.clipPath.height * cropObj.scaleY}
        <br />
        normal:
        {cropObj.width * cropObj.scaleX} *{cropObj.height * cropObj.scaleY}
        <br />
        {cropObj.cropX} * {cropObj.cropY}
        <br />
      </div>
      <canvas id="canvas" width={data.width} height={data.height} />
    </div>
  );
};
