import { RGBAToString } from '@kernel/utils/single';
import { useEffect, useRef } from 'react';

const useCanvasGradient = (id: string) => {
  const ctxRef = useRef(null);
  useEffect(() => {
    const canvasScreen = document.getElementById(id);
    ctxRef.current = canvasScreen.getContext('2d');
  }, [id]);
  function paintGradient(tmpList: any) {
    const linearGradient = ctxRef.current.createLinearGradient(0, 0, 205, 0);
    tmpList.forEach((element: any) => {
      const percent = element.percent / 100;
      if (typeof element.color === 'string') {
        linearGradient.addColorStop(percent, element.color);
      } else {
        linearGradient.addColorStop(percent, RGBAToString(element.color));
      }
    });
    ctxRef.current.fillStyle = linearGradient;
    ctxRef.current.fillRect(10, 10, 205, 30);
  }
  function getCanvasGradientColor(left: number, top: number) {
    const imgData = ctxRef.current.getImageData(left, top, 1, 1);
    return {
      r: imgData.data[0],
      g: imgData.data[1],
      b: imgData.data[2],
      a: imgData.data[3],
    };
  }
  return {
    paintGradient,
    getCanvasGradientColor,
  };
};
export default useCanvasGradient;
