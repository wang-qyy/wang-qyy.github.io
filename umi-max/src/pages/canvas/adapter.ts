import ImageHandler, { type DrawType } from "./store";

const changeLineWidth = ImageHandler.changeLineWidth;

export function useImageErase() {
  return {
    topRef: ImageHandler.topRef,
    botRef: ImageHandler.botRef,

    lineWidth: ImageHandler.lineWidth,
    changeLineWidth,
    changeType: (type: DrawType) => {
      ImageHandler.changeType(type);
    },
    drawType: ImageHandler.drawType,
    init(image: any) {
      ImageHandler.init();

      ImageHandler.drawImage(image);
    },
  };
}
