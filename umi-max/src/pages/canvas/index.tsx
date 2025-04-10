import { createRef, useEffect, useRef, useState } from "react";
import classNames from "classnames";
import { observer } from "mobx-react";
import { Button } from "antd";
import { ArrowLeftOutlined, ArrowRightOutlined } from "@ant-design/icons";

import { type DrawType, ImageHandlerClass } from "./store";

import { useImageErase } from "./adapter";
import UndoRedoManager from "./UndoRedoManager";

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

const DRAW_TYPE: { label: string; value: DrawType }[] = [
  { label: "涂鸦", value: "curve" },
  { label: "直线", value: "line" },
  { label: "橡皮擦", value: "eraser" },
];

export default observer(() => {
  const [drawType, changeType] = useState<DrawType>("curve");

  const { botRef, topRef, init, lineWidth, changeLineWidth } = useImageErase();

  const { undo, redo, canRedo, canUndo } = UndoRedoManager;

  const handlerRef = useRef<ImageHandlerClass>();

  useEffect(() => {
    init(imageInfo);
  }, []);

  function changeDrawType(type: DrawType) {
    changeType(type);
    handlerRef.current?.changeType(type);
  }

  function renderCanvas() {
    // 获取Canvas元素
    const canvas = document.getElementById("myCanvas") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      // ctx.fillStyle = "yellow"; // 你可以将 "yellow" 替换为任何你想要的颜色

      // 绘制填充矩形
      // ctx.fillRect(50, 50, 100, 100);

      const gradient = ctx.createLinearGradient(0, 0, 200, 0);
      gradient.addColorStop(0, "red");
      gradient.addColorStop(0.3, "yellow");
      gradient.addColorStop(1, "black");

      // 设置描边样式
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 5;
      // 绘制矩形
      ctx.strokeRect(50, 50, 100, 100);
    }
    // 创建线性渐变
  }

  useEffect(() => {
    renderCanvas();
  }, []);

  return (
    <>
      <canvas
        id="myCanvas"
        width={500}
        height={500}
        style={{ background: "#eee" }}
      />
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
        ></Button>
        <Button
          className={classNames("img_tool fl")}
          icon={<ArrowRightOutlined />}
          onClick={() => {
            console.log("redo");
            redo();
          }}
          disabled={!canRedo}
        ></Button>
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
    </>
  );
});
