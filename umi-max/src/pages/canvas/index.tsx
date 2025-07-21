import { createRef, useEffect, useRef, useState } from "react";
import classNames from "classnames";
import { observer } from "mobx-react";
import { Button, Space } from "antd";
import { ArrowLeftOutlined, ArrowRightOutlined } from "@ant-design/icons";

import { type DrawType } from "./store";

import { useImageErase } from "./adapter";
import UndoRedoManager from "./UndoRedoManager";
import { renderImageWithAngle } from "./utils";

import "./index.less";

const imageInfo = {
  url: "/imageHost/edit_user/p_upload/20250110/45035856b3_56828466.png",
  width: 200,
  height: 200,
  originWidth: 640,
  originHeight: 640,
  x: 100,
  y: 100,
  angle: 20,
};

const mix_blend_mode: { value: GlobalCompositeOperation; label: string }[] = [
  // { value: "normal", label: "正常" },
  // { value: "multiply", label: "正片叠底" },
  // { value: "screen", label: "滤色" },
  // { value: "overlay", label: "叠加" },
  // { value: "darken", label: "变暗" },
  // { value: "lighten", label: "变亮" },
  // { value: "color-dodge", label: "颜色减淡" },
  // { value: "color-burn", label: "颜色加深" },
  // { value: "hard-light", label: "强光" },
  // { value: "soft-light", label: "柔光" },
  // { value: "difference", label: "差值" },
  // { value: "exclusion", label: "排除" },
  // { value: "hue", label: "色相" },
  // { value: "saturation", label: "饱和度" },
  // { value: "color", label: "颜色" },
  // { value: "luminosity", label: "亮度" },
  // { value: "initial", label: "initial" },
  // { value: "inherit", label: "inherit" },
  // { value: "unset", label: "unset" },

  { value: "source-over", label: "这是默认设置，并在现有画布上绘制新图形。" },

  {
    value: "source-in",
    label: "仅在新形状和目标画布重叠的地方绘制新形状。其他的都是透明的。",
  },

  { value: "source-out", label: "在不与现有画布内容重叠的地方绘制新图形。" },

  { value: "source-atop", label: "只在与现有画布内容重叠的地方绘制新图形。" },

  { value: "destination-over", label: "在现有画布内容的后面绘制新的图形。" },

  {
    value: "destination-in",
    label: "仅保留现有画布内容和新形状重叠的部分。其他的都是透明的。",
  },

  {
    value: "destination-out",
    label: "仅保留现有画布内容和新形状不重叠的部分。",
  },

  {
    value: "destination-atop",
    label:
      "仅保留现有画布内容和新形状重叠的部分。新形状是在现有画布内容的后面绘制的。",
  },

  { value: "lighter", label: "两个重叠图形的颜色是通过颜色值相加来确定的。" },

  { value: "copy", label: "只显示新图形。" },

  { value: "xor", label: "形状在重叠处变为透明，并在其他地方正常绘制。" },

  {
    value: "multiply",
    label: "将顶层像素与底层相应像素相乘，结果是一幅更黑暗的图片。",
  },

  {
    value: "screen",
    label:
      "像素被倒转、相乘、再倒转，结果是一幅更明亮的图片（与 multiply 相反）。",
  },

  {
    value: "overlay",
    label: "multiply 和 screen 的结合。原本暗的地方更暗，原本亮的地方更亮。",
  },

  { value: "darken", label: "保留两个图层中最暗的像素。" },

  { value: "lighten", label: "保留两个图层中最亮的像素。" },

  { value: "color-dodge", label: "将底层除以顶层的反置。" },

  { value: "color-burn", label: "将反置的底层除以顶层，然后将结果反过来。" },

  {
    value: "hard-light",
    label: "类似于 overlay，multiply 和 screen 的结合——但上下图层互换了。",
  },

  {
    value: "soft-light",
    label: "柔和版本的 hard-light。纯黑或纯白不会导致纯黑或纯白。",
  },

  {
    value: "difference",
    label: "从顶层减去底层（或反之亦然），始终得到正值。",
  },

  { value: "exclusion", label: "与 difference 类似，但对比度较低。" },

  {
    value: "hue",
    label:
      "保留底层的亮度（luma）和色度（chroma），同时采用顶层的色调（hue）。",
  },

  { value: "saturation", label: "保留底层的亮度和色调，同时采用顶层的色度。" },

  { value: "color", label: "保留了底层的亮度，同时采用了顶层的色调和色度。" },

  { value: "luminosity", label: "保持底层的色调和色度，同时采用顶层的亮度。" },
];

const DRAW_TYPE: { label: string; value: DrawType }[] = [
  { label: "涂鸦", value: "erase" },
  { label: "橡皮擦", value: "restore" },
];

export default observer(() => {
  const {
    botRef,
    topRef,
    init,
    lineWidth,
    changeLineWidth,
    changeType,
    drawType,
  } = useImageErase();

  const { undo, redo, canRedo, canUndo } = UndoRedoManager;

  useEffect(() => {
    init(imageInfo);
  }, []);

  function changeDrawType(type: DrawType) {
    changeType(type);
  }

  function drawPath(
    ctx: CanvasRenderingContext2D,
    info: { x: number; y: number; color: string }
  ) {
    // ctx.fillStyle = info.color;
    // ctx.rect(info.x, info.y, 100, 100);

    // 设置填充颜色为白色
    ctx.fillStyle = info.color;

    // 绘制一个填充白色的矩形
    // 参数分别是：x坐标，y坐标，宽度，高度
    ctx.fillRect(info.x, info.y, 100, 100);
  }

  useEffect(() => {
    const erase = document.getElementById("erase") as HTMLCanvasElement;
    const restore = document.getElementById("restore") as HTMLCanvasElement;

    drawPath(erase.getContext("2d") as CanvasRenderingContext2D, {
      x: 10,
      y: 10,
      color: "rgba(255, 0, 0,1)",
    });
    drawPath(restore.getContext("2d") as CanvasRenderingContext2D, {
      x: 50,
      y: 50,
      color: "rgba(0, 255, 26, 0.6)",
    });

    renderImageWithAngle(
      document.getElementById("compose") as HTMLCanvasElement,
      { ...imageInfo, x: 0, y: 0, angle: 0 }
    );
  }, []);

  return (
    <>
      <div className="img_tools cf">
        {DRAW_TYPE.map((item) => {
          return (
            <div
              key={item.value}
              className={classNames("img_tool fl", {
                img_tool_active: drawType == item.value,
              })}
              onClick={() => changeDrawType(item.value)}
            >
              {item.label}
            </div>
          );
        })}
        <Button
          className={classNames("img_tool fl")}
          icon={<ArrowLeftOutlined />}
          onClick={() => {
            console.log("undo");
            undo();
          }}
          disabled={!canUndo}
        />
        <Button
          className={classNames("img_tool fl")}
          icon={<ArrowRightOutlined />}
          onClick={() => {
            console.log("redo");
            redo();
          }}
          disabled={!canRedo}
        />
      </div>

      <div className="bg_img"></div>

      <canvas
        ref={botRef}
        id="myCanvasBot"
        className="my_canvas"
        width="674"
        height="495"
      ></canvas>
      <canvas
        ref={topRef}
        id="myCanvasTop"
        className="my_canvas"
        width="674"
        height="495"
      ></canvas>
      <div style={{ display: "flex", backgroundColor: "#eee", marginTop: 650 }}>
        <div>
          <canvas
            id="compose"
            width="674"
            height="495"
            style={{ border: "1px #000 solid", display: "block" }}
          ></canvas>
          <canvas
            id="erase"
            width="674"
            height="495"
            style={{ border: "1px #000 solid", display: "block" }}
          ></canvas>
          <canvas
            id="restore"
            width="674"
            height="495"
            style={{ border: "1px #000 solid", display: "block" }}
          ></canvas>
        </div>
        <Space wrap direction="vertical" style={{ marginBottom: 16 }}>
          {mix_blend_mode.map((item) => {
            return (
              <Button
                key={item.value}
                onClick={() => {
                  const canvas = document.getElementById(
                    "compose"
                  ) as HTMLCanvasElement;

                  const compose = document.getElementById(
                    "erase"
                  ) as HTMLCanvasElement;

                  // compose.width = canvas.width;
                  // compose.height = canvas.height;

                  const ctx = compose.getContext("2d");
                  // ctx!.globalCompositeOperation = "source-out";

                  // ctx?.clearRect(0, 0, canvas.width, canvas.height);

                  // ctx?.drawImage(
                  //   document.getElementById("erase") as HTMLImageElement,
                  //   0,
                  //   0
                  // );
                  ctx!.globalCompositeOperation = item.value;

                  ctx?.drawImage(
                    document.getElementById("restore") as HTMLImageElement,
                    0,
                    0
                  );

                  const canvasCtx = canvas.getContext("2d");
                  canvasCtx!.globalCompositeOperation = "destination-out";
                  canvasCtx?.drawImage(compose, 0, 0);

                  // 重置合成模式
                  canvasCtx!.globalCompositeOperation = "source-out";
                }}
              >
                {item.label}：{item.value}
              </Button>
            );
          })}
        </Space>
      </div>
    </>
  );
});
