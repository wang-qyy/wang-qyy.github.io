import { Canvas, Textbox, Path } from "fabric";
import { useEffect } from "react";

export default () => {
  useEffect(() => {
    // 创建画布

    const canvas = new Canvas("canvas");

    // 定义弯曲路径（例如：圆弧）
    const path = new Path("M 100 100 Q 200 0 300 100", {
      fill: "",
      stroke: "red", // 路径不可见
      strokeWidth: 2,
      selectable: false,
      evented: false,
      left: 0,
      top: 0,
    });

    // 创建文本
    const text = new Textbox("沿着路径弯曲的文本", {
      left: 100,
      top: 100,
      fontSize: 20,
      fill: "#333",
      path: path,
    });

    // 将路径和文本添加到画布
    // canvas.add(path);
    canvas.add(text);

    console.log(canvas.toJSON());

    // 手动计算文本沿路径的位置（简化示例）
    function positionTextAlongPath() {
      // 这里需要实现文本沿路径分布的算法
      // 可以使用路径的 getPointOnPath 方法获取路径上的点
    }
  }, []);
  return (
    <div style={{ background: "#eee" }}>
      <canvas id="canvas" width={1000} height={1000}></canvas>
    </div>
  );
};
