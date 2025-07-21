import { useEffect, useRef } from "react";

const canvas = {
  width: 500,
  height: 500,
  fill: "#eee",
};

const element = {
  left: 100,
  top: 100,
  width: 200,
  height: 100,
  rotate: -30,
  fill: "#333",
};

interface Element {
  left: number;
  top: number;
  width: number;
  height: number;
  rotate: number;
  fill: string;
}

export default () => {
  const wrapper = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  function draw(info: Element) {
    const div = document.createElement("div");

    div.style.cssText = `
      position: absolute;
      left: ${info.left}px;
      top: ${info.top}px;
      width: ${info.width}px;
      height: ${info.height}px;
      background: red;
      transform: rotate(${info.rotate}deg);
      background: ${info.fill};
    `;

    wrapper.current?.appendChild(div);
  }

  function drawCanvas(info: Element) {
    var ctx = canvasRef.current?.getContext("2d");

    const { left, top, width, height } = info;

    if (ctx) {
      var rotationAngle = (info.rotate * Math.PI) / 180; // 将角度转换为弧度

      ctx.translate(left + rectWidth / 2, top + rectHeight / 2);

      ctx.rotate(info.rotate);
      ctx.fillStyle = info.fill; // 设置填充颜色为红色
      ctx.fillRect(info.left, info.top, info.width, info.height); // 绘制一个填充的矩形
      ctx.restore();
    }
  }

  useEffect(() => {
    draw({ ...element, rotate: 0, fill: "pink" });
    draw(element);
    drawCanvas(element);
  }, []);

  return (
    <div style={{ display: "flex" }}>
      <div
        ref={wrapper}
        style={{
          width: canvas.width,
          height: canvas.height,
          background: canvas.fill,
          margin: "50px",
          position: "relative",
        }}
      ></div>

      <canvas
        ref={canvasRef}
        width={canvas.width}
        height={canvas.height}
        style={{ background: canvas.fill, margin: "50px" }}
      />
    </div>
  );
};
