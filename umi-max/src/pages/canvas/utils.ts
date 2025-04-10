import { ImageInfo } from "./typing";

// 计算旋转的左上角坐标及宽度
export function calculateBounds({ x, y, width, height, angle }: ImageInfo) {
  const radians = (angle * Math.PI) / 180;
  const centerX = x + width / 2;
  const centerY = y + height / 2;
  const corners = [
    { x: x, y: y },
    { x: x + width, y: y },
    { x: x + width, y: y + height },
    { x: x, y: y + height },
  ];

  // Rotate the corners around the center
  const rotatedCorners = corners.map((corner) => {
    const dx = corner.x - centerX;
    const dy = corner.y - centerY;
    return {
      x: centerX + dx * Math.cos(radians) - dy * Math.sin(radians),
      y: centerY + dx * Math.sin(radians) + dy * Math.cos(radians),
    };
  });

  // Calculate the bounding box of the rotated rectangle
  const minX = Math.min(...rotatedCorners.map((corner) => corner.x));
  const minY = Math.min(...rotatedCorners.map((corner) => corner.y));
  const maxX = Math.max(...rotatedCorners.map((corner) => corner.x));
  const maxY = Math.max(...rotatedCorners.map((corner) => corner.y));

  const newWidth = maxX - minX;
  const newHeight = maxY - minY;

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: newWidth,
    height: newHeight,
  };
}

// 渲染带旋转角度的图片
export function renderImageWithAngle(
  canvas: HTMLCanvasElement,
  { url, angle, width, height, x, y }: ImageInfo
) {
  const ctx = canvas.getContext("2d");

  if (!ctx) return;
  const radians = (angle * Math.PI) / 180;

  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = url;

  img.onload = function () {
    const o = {
      x: x + width / 2,
      y: y + height / 2,
    };
    const fill = {
      x: -width / 2,
      y: -height / 2,
    };

    ctx.translate(o.x, o.y);
    ctx.rotate(radians);
    ctx.drawImage(img, fill.x, fill.y, width, height);
    ctx?.setTransform(1, 0, 0, 1, 0, 0);
  };
}

// 重置旋转角度
export function reSetRenderImageWithAngle(
  canvasA: HTMLCanvasElement,
  canvasB: HTMLCanvasElement,
  imageInfo: ImageInfo
) {
  const ctxA = canvasA.getContext("2d");
  const ctxB = canvasB.getContext("2d");

  if (!ctxA || !ctxB) return;
  const { angle, width, height, x, y } = imageInfo;

  const {
    minX,
    minY,
    width: newWidth,
    height: newHeight,
  } = calculateBounds(imageInfo);

  const imageData = ctxA.getImageData(minX, minY, newWidth, newHeight);
  const newCanvas = document.createElement("canvas");
  newCanvas.width = newWidth;
  newCanvas.height = newHeight;

  newCanvas.getContext("2d")?.putImageData(imageData, 0, 0);

  ctxB.translate(minX + newWidth / 2, minY + newHeight / 2);
  ctxB.rotate((-angle * Math.PI) / 180);
  ctxB.drawImage(newCanvas, -newWidth / 2, -newHeight / 2);
  ctxB.setTransform(1, 0, 0, 1, 0, 0); // 恢复画布状态
  ctxB.restore();

  const canvasC = document.createElement("canvas");

  const ctxC = canvasC.getContext("2d");

  canvasC.width = width;
  canvasC.height = height;

  // canvasC.setAttribute(
  //   'style',
  //   'position:fixed;left:100px;top:100px;z-index:9999;background:#000',
  // );

  ctxC?.putImageData(ctxB.getImageData(x, y, width, height), 0, 0);

  // document.body.appendChild(canvasC);

  return canvasC;
}

export function canvasToFile(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error("Failed to convert canvas to blob"));
      }
    });
  });
}
