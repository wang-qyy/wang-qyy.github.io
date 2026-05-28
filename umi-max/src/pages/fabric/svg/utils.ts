import type { FabricObject } from "fabric";

/**
 * 将 fabric.Object 转换为完整的 SVG 字符串
 * @param {fabric.Object} obj
 * @returns {string}
 */
export function objectToFullSVG(obj: FabricObject) {
  if (!obj || typeof obj.toSVG !== 'function') {
    throw new Error('Invalid fabric.Object');
  }

  // 获取对象的真实包围盒（含旋转、缩放）
  const box = obj.getBoundingRect();

  // 防止宽高为 0
  const width = Math.ceil(box.width) || 1;
  const height = Math.ceil(box.height) || 1;

  // 计算 viewBox
  const viewBox = `${box.left} ${box.top} ${width} ${height}`;

  // 对象自身的 SVG 片段
  const innerSVG = obj.toSVG();

  // 组装完整 SVG
  const svg = `
<svg
  xmlns="http://www.w3.org/2000/svg"
  width="100%"
  height="100%"
  viewBox="${viewBox}"
  preserveAspectRatio="xMidYMid meet"
>
${innerSVG}
</svg>
`.trim();

  return svg;
}