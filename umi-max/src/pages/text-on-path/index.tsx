import { useEffect, useState, useRef, useLayoutEffect } from "react";
import { Input, InputNumber, Slider } from "antd";
import { useSize } from "ahooks";
import { useUpdateEffect } from "ahooks";

import { calculateArcLength, calcRadius } from "./utils";
import { arcToSvgPath } from "./handler";

import { IText, Canvas, Path } from "fabric";

export default () => {
  // 圆心角
  const [angle, setAngle] = useState(120);

  const canvasRef = useRef<Canvas>();
  const textRef = useRef<any>();

  const ogRef = useRef<HTMLDivElement>(null);

  const size = useSize(ogRef);

  const [textWidth, setTextWidth] = useState(0);

  const [axis, setAxis] = useState<any>({});
  function drawArc() {
    // Initiate an itext object
    const text = new IText("Add sample text here.", {
      // width: 10,
      left: 50,
      top: 70,
      fill: "red",
    });

    const width = document.getElementById("orText")?.clientWidth || 0;

    setTextWidth(width);

    const radius = calcRadius(width, angle);

    const res = arcToSvgPath(radius, angle);
    const { d: svgPath } = res;

    setAxis(res);

    document.getElementById("svg_path")?.setAttribute("d", svgPath);

    var path = new Path(svgPath, {
      height: 20,
      top: 20,
      strokeWidth: 1,
      fill: "transparent",
      stroke: "pink",
    });

    text.set({
      path,
      pathSide: "left",
      pathStartOffset: 0,
    });

    textRef.current = text;

    // Add it to the canvas
    // canvasRef.current?.add(textRef.current);
    canvasRef.current?.add(path);
  }

  useLayoutEffect(() => {
    if (size?.width) {
      const width = size?.width || 0;
      console.log("textWidth", width);

      const res = arcToSvgPath(angle, width);
      const { d } = res;

      setAxis(res);

      document.getElementById("svg_path")?.setAttribute("d", d);
    }
  }, [angle, size?.width]);
  const svgW = axis.radius * 2;
  const svgH = axis.radius * 2;

  return (
    <div style={{ background: "#eee" }}>
      <div
        style={{ display: "inline-block", border: "1px solid red", margin: 8 }}
      >
        <svg width="200" height="200" viewBox="0 0 200 200">
          {/* <!-- 圆心标记 --> */}
          <circle cx="100" cy="100" r="2" fill="red" />
          <text x="100" y="95" text-anchor="middle" fill="red">
            圆心(100,100)
          </text>

          {/* <!-- 圆弧路径 --> */}
          <path
            d="M 56.70 125 A 50 50 0 0 1 143.30 125"
            stroke="blue"
            stroke-width="3"
            fill="none"
          />
        </svg>
      </div>
      <div
        style={{ display: "inline-block", border: "1px solid red", margin: 8 }}
      >
        <svg
          width="300"
          height="300"
          viewBox="-100 -100 200 200"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* <!-- 坐标系 --> */}
          <path
            d="M -100 0 H 100 M 0 -100 V 100"
            stroke="#ccc"
            stroke-width="0.5"
            stroke-dasharray="2"
          />

          {/* <!-- 圆心标记 --> */}
          <circle cx="0" cy="0" r="3" fill="red" />
          <text x="0" y="0" text-anchor="middle" dy=".3em" font-size="8">
            (0,0)
          </text>

          {/* <!-- 圆弧路径 --> */}
          <path
            d="M -43.3 -25 
           A 50 50 0 0 0 43.3 -25"
            stroke="#2196F3"
            stroke-width="2"
            fill="none"
            marker-end="url(#arrowhead)"
          />

          {/* <!-- 角度标注 --> */}
          <text x="-70" y="-40" font-size="10">
            210°
          </text>
          <text x="60" y="-40" font-size="10">
            -30°
          </text>

          {/* <!-- 箭头标记定义 --> */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="5"
              markerHeight="5"
              refX="2.5"
              refY="2.5"
              orient="auto"
            >
              <polygon points="0 0, 5 2.5, 0 5" fill="#2196F3" />
            </marker>
          </defs>
        </svg>
      </div>

      <div
        style={{ display: "inline-block", border: "1px solid red", margin: 8 }}
        hidden
      >
        <svg
          width="300"
          height="300"
          viewBox="-60 -60 120 120"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* <!-- 坐标系 --> */}
          <path
            d="M -60 0 H 60 M 0 -60 V 60"
            stroke="#ccc"
            stroke-width="0.5"
            stroke-dasharray="2"
          />

          {/* <!-- 圆心标记 --> */}
          <circle cx="0" cy="-50" r="3" fill="red" />
          <circle cx="43.3" cy="25" r="3" fill="red" />
          <circle cx="0" cy="0" r="3" fill="red" />

          <line x1={0} y1={0} x2="43.3" y2="25" stroke="blue"></line>

          <text x="0" y="0" text-anchor="middle" dy=".3em" font-size="8">
            (0,0)
          </text>

          {/* <!-- 圆弧路径 --> */}
          <path
            d="M 0 -50 A 50 50 0 0 1 43.3 25"
            stroke="#2196F3"
            stroke-width="2"
            fill="none"
            marker-end="url(#arrowhead)"
          />

          {/* <!-- 角度标注 --> */}
          <text x="20" y="-30" font-size="10">
            30°
          </text>
          <text x="-30" y="-45" font-size="10">
            270°
          </text>

          {/* <!-- 箭头标记定义 --> */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="5"
              markerHeight="5"
              refX="2.5"
              refY="2.5"
              orient="auto"
            >
              <polygon points="0 0, 5 2.5, 0 5" fill="#2196F3" />
            </marker>
          </defs>
        </svg>
      </div>
      <div hidden>
        <svg width="200" height="200" viewBox="-100 -100 200 200">
          {/* <!-- 圆弧路径 --> */}
          <path
            d="M 0 -50 A 50 50 0 0 1 43.30 25"
            stroke="blue"
            stroke-width="2"
            fill="none"
          />

          {/* <!-- 辅助线（可选） --> */}
          <line
            x1="0"
            y1="-50"
            x2="43.30"
            y2="25"
            stroke="red"
            stroke-dasharray="4 2"
          />
        </svg>
      </div>

      <div>
        <div
          ref={ogRef}
          id="orText"
          style={{ fontSize: 100, display: "inline-block" }}
        >
          Add sample text here.
        </div>
      </div>

      <div>
        <label htmlFor="start">起始角度</label>
        <InputNumber
          value={angle}
          onChange={(v) => {
            setAngle(v);
          }}
        />

        <Slider
          id="start"
          value={angle}
          min={-360}
          max={360}
          style={{ width: 300 }}
          onChange={(v) => setAngle(v)}
        />
      </div>
      <div style={{ border: "1px solid #000", display: "inline-block" }}>
        <svg
          viewBox={`0 0 ${svgW} ${svgH}`}
          width={500}
          xmlns="http://www.w3.org/2000/svg"
        >
          {/**
           * M angle y A rx ry angle-axis-rotation large-arc-flag sweep-flag angle y
           * angle-axis-rotation 圆弧的旋转角度
           * large-arc-flag = 0 表示小弧，1 表示大弧
           * sweep-flag = 0 表示逆时针，1 表示顺时针
           * */}
          <path
            id="svg_path"
            fill="none"
            stroke="red"
            strokeWidth="1"
            d="M 50,200 A 0 0 30 0 1 191,200"
          />
          <line x1="6" y1="10" x2="14" y2="10" stroke="black" />
          <text x="10" y="100" font-size="100px" fill="black">
            <textPath xlinkHref="#svg_path" textAnchor="start">
              Add sample text here.
            </textPath>
          </text>
          <g>
            <circle cx={axis.x1} cy={axis.y1} r="10" fill="pink" />
            <text
              x={axis.x1}
              y={axis.y1 + 30}
              r={5}
              fill="pink"
              text-anchor="middle"
            >
              起点坐标 {axis.x1}, {axis.y1}
            </text>
          </g>
          <g>
            <circle cx={axis.x2} cy={axis.y2} r="5" fill="#000" />
            <text x={axis.x2} y={axis.y2 + 30} r={5} text-anchor="middle">
              终点坐标 {axis.x2}, {axis.y2}
            </text>
          </g>
          <g>
            <circle cx={axis.radius} cy={axis.radius} r={5} fill="black" />
            <text
              x={axis.radius}
              y={axis.radius + 20}
              fill="black"
              text-anchor="middle"
            >
              圆心 {axis.radius} ,{axis.radius}
            </text>
          </g>
          {/* 坐标系 */}
          <path
            // d={"M -60 0 H 60 M 0 -60 V 60"}
            d={`M 0 ${axis.radius} H ${2 * axis.radius} M ${axis.radius} 0 V ${2 * axis.radius}`}
            stroke="#999"
            stroke-width="1"
            stroke-dasharray="2"
          ></path>
        </svg>
      </div>

      <canvas id="canvas" width="500" height="500"></canvas>
    </div>
  );
};
