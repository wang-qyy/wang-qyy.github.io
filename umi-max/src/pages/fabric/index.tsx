import {
  Canvas,
  loadSVGFromURL,
  loadSVGFromString,
  Rect,
  Path,
  Group,
} from "fabric";
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

const data = {
  id: "APxCmQX_hz",
  name: "企业印刷名片",
  width: 500,
  height: 500,
  zoom: 1,
  left: 0,
  top: 0,
  version: "6.6",
  objects: [],
  workSpace: {
    fillType: 0,
    left: 0,
    top: 0,
    angle: 0,
    scaleX: 1,
    scaleY: 1,
    color: "#ffffff",
    fill: "#ffffff",
    backgroundColor: "rgba(0,0,0,0)",
  },
};

// 创建两个 Path 对象
const path1 = new Path("M 10 10 L 100 10 L 100 100 L 10 100 Z", {
  fill: "red",
  stroke: "black",
  strokeWidth: 2,
});

const path2 = new Path("M 70 70 L 160 70 L 160 160 L 70 160 Z", {
  fill: "blue",
  stroke: "black",
  strokeWidth: 2,
});

export default () => {
  useEffect(() => {
    const canvasDom = document.getElementById("canvas") as HTMLCanvasElement;
    console.log(canvasDom);

    const canvas = new Canvas(canvasDom);
    // canvas.loadFromJSON({ objects: [] });
    // // canvas.loadFromJSON(data);
    // 创建 Group 来组合路径

    canvas.add(path1, path2);

    canvas.requestRenderAll();

    console.log(canvas.toJSON());
  }, []);
  return <canvas id="canvas" width={data.width} height={data.height} />;
};
