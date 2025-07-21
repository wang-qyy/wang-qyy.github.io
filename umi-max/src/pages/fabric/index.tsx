import { Canvas } from "fabric";
import { useEffect } from "react";

const object = {
  resId: "asset_svg_44",
  isSvg: true,
  id: "PJxJJRHg24",
  type: "Polygon",
  objectCaching: false,
  selectable: true,
  transparentCorners: false,
  hasBorders: true,
  hasControls: true,
  padding: 0,
  lockMovementX: false,
  lockMovementY: false,
  version: "6.7.0",
  originX: "left",
  originY: "top",
  left: 0,
  top: 0,
  width: 576,
  height: 1052,
  fill: "#7230A5",
  stroke: null,
  strokeWidth: 1,
  strokeDashArray: null,
  strokeLineCap: "butt",
  strokeDashOffset: 0,
  strokeLineJoin: "miter",
  strokeUniform: false,
  strokeMiterLimit: 4,
  scaleX: 1,
  scaleY: 1,
  angle: 0,
  flipX: false,
  flipY: false,
  opacity: 1,
  shadow: null,
  visible: true,
  backgroundColor: "",
  fillRule: "nonzero",
  paintFirst: "stroke",
  globalCompositeOperation: "source-over",
  skewX: 0,
  skewY: 0,
  points: [
    {
      x: 612.9,
      y: 962.9,
    },
    {
      x: 596.1,
      y: 994.1,
    },
    {
      x: 84.2,
      y: 15.9,
    },
    {
      x: 117.5,
      y: 16.2,
    },
  ],
};

export default () => {
  useEffect(() => {
    const canvasDom = document.getElementById("canvas") as HTMLCanvasElement;
    console.log(canvasDom);

    const canvas = new Canvas(canvasDom);
    canvas.loadFromJSON({ objects: [object, { type: "IText", text: "1234" }] });
    canvas.requestRenderAll();
  }, []);
  return <canvas id="canvas" width={object.width} height={object.height} />;
};
