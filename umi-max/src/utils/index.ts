export function mouseMoveDistance(
  e: MouseEvent | React.MouseEvent,
  cb: (distanceX: number, distanceY: number) => void,
  finish?: (distanceX: number, distanceY: number) => void
) {
  const mouseDownPointX = e.clientX;
  const mouseDownPointY = e.clientY;

  const mouseMove = (event: MouseEvent) => {
    const currentX = event.clientX;
    const currentY = event.clientY;

    cb && cb(currentX - mouseDownPointX, currentY - mouseDownPointY);
  };

  const mouseUp = (event: MouseEvent) => {
    const currentX = event.clientX;
    const currentY = event.clientY;

    finish && finish(currentX - mouseDownPointX, currentY - mouseDownPointY);
    window.removeEventListener("mouseup", mouseUp);
    window.removeEventListener("mousemove", mouseMove);
  };

  window.addEventListener("mouseup", mouseUp);
  window.addEventListener("mousemove", mouseMove);
}
