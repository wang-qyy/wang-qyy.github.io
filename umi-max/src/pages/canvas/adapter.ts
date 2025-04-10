import ImageHandler from "./store";

const changeLineWidth = ImageHandler.changeLineWidth;

export function useImageErase() {
  return {
    topRef: ImageHandler.topRef,
    botRef: ImageHandler.botRef,

    lineWidth: ImageHandler.lineWidth,
    changeLineWidth,
    init(image: any) {
      ImageHandler.init();

      ImageHandler.drawImage(image);
    },
  };
}
