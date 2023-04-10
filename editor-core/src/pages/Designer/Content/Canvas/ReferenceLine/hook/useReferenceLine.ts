import { useState } from 'react';
import { useDesignerReferenceLine } from '@/store/adapter/useGlobalStatus';

export function useReference() {
  const [hoverLine, setHoverLine] = useState(null);
  const { XLine, YLine, show, updateLine, _show } = useDesignerReferenceLine();

  const getId = () => {
    // 获取随机数id
    const date = Date.now();
    const rund = Math.ceil(Math.random() * 1000);
    const id = `${date}${rund}`;
    return id;
  };
  // 显示标尺和参考线
  const showLine = () => {
    if (!show) {
      if (XLine.length === 0 && YLine.length === 0) {
        const id = getId();
        updateLine([{ id, value: 50 }], 'x');
        const yid = getId();
        updateLine([{ id: yid, value: 50 }], 'y');
      }

      _show(true);
    } else {
      _show(false);
    }
  };
  // 清除参考线
  const clearLine = () => {
    updateLine([], 'x');
    updateLine([], 'y');
  };
  // 更新参考线
  const upload = (
    value: number | string,
    id: number | string,
    type: string,
  ) => {
    const lineArr = type === 'x' ? XLine : YLine;
    const arr = lineArr.map(
      (i: { value: number | string; id: number | string }) => {
        if (i.id === id) {
          const obj = JSON.parse(JSON.stringify(i));
          obj.value = value;
          return obj;
        }
        return i;
      },
    );

    updateLine(arr, type);
  };

  // 鼠标移动获取参考线
  const getDisplay = (
    e: any,
    type: string,
    canvasWidth: number,
    canvasHeight: number,
    event: string,
  ) => {
    const doc: any = document.querySelector('#xiudodo-canvas');

    const {
      left,
      top,
      width: docWidth,
      height: docHeight,
    } = doc.getBoundingClientRect();

    const { clientX, clientY } = e;

    // 鼠标位置到外容器边缘的距离
    const X = clientX - left;
    const Y = clientY - top;

    // 画布到外容器的距离;
    const pad =
      type === 'x'
        ? (docHeight - canvasHeight - 26) / 2
        : (docWidth - canvasWidth - 26) / 2;
    const newPad = pad > 0 ? pad : 0;

    // 移出画布不显示参考线
    if (type === 'y' && (X - 26 < newPad || X - newPad - 26 > canvasWidth)) {
      setHoverLine(null);
      return;
    }
    if (type === 'x' && (Y - 26 < newPad || Y - newPad - 26 > canvasHeight)) {
      setHoverLine(null);
      return;
    }

    if (event === 'click') {
      setHoverLine(null);

      if (type === 'y') {
        updateLine(
          [
            ...XLine,
            { value: ((X - newPad - 26) / canvasWidth) * 100, id: getId() },
          ],
          'x',
        );
      } else {
        updateLine(
          [
            ...YLine,
            { value: ((Y - newPad - 26) / canvasHeight) * 100, id: getId() },
          ],
          'y',
        );
      }
    } else {
      setHoverLine({
        type,
        pos: type === 'y' ? X : Y,
      });
    }
  };

  // 移出画布删除参考线
  const delLine = (
    type: string,
    num: number,
    id: string | number,
    canvasHeight: number,
    canvasWidth: number,
  ) => {
    if (type === 'y') {
      if (num < 0 || num > canvasWidth) {
        const arr = XLine.filter(i => {
          return i.id !== id;
        });
        updateLine(arr, 'x');
      } else {
        upload((num / canvasWidth) * 100, id, 'x');
      }
    } else {
      if (num < 0 || num > canvasHeight) {
        const arr = YLine.filter(i => {
          return i.id !== id;
        });
        updateLine(arr, 'y');
      } else {
        upload((num / canvasHeight) * 100, id, 'y');
      }
    }
  };

  const getPad = (type: string, canvasHeight: number, canvasWidth: number) => {
    const doc: any = document.querySelector('#xiudodo-canvas');
    const { width: docWidth, height: docHeight } = doc.getBoundingClientRect();

    const pad =
      type === 'x'
        ? (docHeight - canvasHeight - 26) / 2
        : (docWidth - canvasWidth - 26) / 2;
    const newPad = pad > 0 ? pad : 0;
    return newPad;
  };

  return {
    show,
    showLine,
    clearLine,
    hoverLine,
    setHoverLine,
    getDisplay,
    delLine,
    getPad,
  };
}
