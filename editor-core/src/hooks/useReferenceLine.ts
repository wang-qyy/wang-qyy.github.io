import React, { useState } from 'react';
import { useReferenceLine } from '@/store/adapter/useGlobalStatus';
import { clickActionWeblog } from '@/utils/webLog';
import { BasicTarget } from 'ahooks/lib/utils/dom';
import { useSize, useScroll } from 'ahooks';

export function useReference() {
  const {
    referenceLineX,
    referenceLineY,
    referenceLineShow,
    updateReferenceLine,
    updateReferenceLineShow,
  } = useReferenceLine();
  const container = document.querySelector('.xiudodo-main') as HTMLDivElement;
  const scrollInfo = useScroll(container);
  const [hoverLine, setHoverLine] = useState(null);

  const size: any = useSize(
    document.querySelector('.xiudodo-canvas') as BasicTarget,
  );

  const canvasSize: any = useSize(
    document.querySelector('#xiudodo-canvas') as BasicTarget,
  );
  const { width, height } = canvasSize || {};

  const getId = () => {
    // 获取随机数id
    const date = Date.now();
    const rund = Math.ceil(Math.random() * 1000);
    const id = `${date}${rund}`;
    return id;
  };
  // 显示标尺和参考线
  const showLine = () => {
    if (!referenceLineShow) {
      if (referenceLineX.length === 0 && referenceLineY.length === 0) {
        const id = getId();
        updateReferenceLine([{ id, value: 50 }], 'x');
        const yid = getId();
        updateReferenceLine([{ id: yid, value: 50 }], 'y');
      }

      updateReferenceLineShow(true);
    } else {
      updateReferenceLineShow(false);
    }
  };

  // 新增竖向参考线
  const addY = () => {
    clickActionWeblog('referenceLine01');

    const right = ((size?.width / 2 - 3) / size?.width) * 100;
    const value = referenceLineY.length > 0 ? right : 50;
    const id = getId();
    const arr = [...referenceLineY, { value, id }];
    updateReferenceLine(arr, 'y');
    updateReferenceLineShow(true);
  };

  // 清除参考线
  const eliminate = () => {
    clickActionWeblog('referenceLine02');

    updateReferenceLine([], 'x');
    updateReferenceLine([], 'y');
  };

  // 更新横向参考线
  const uploadX = (value: number | string, id: number | string) => {
    const arr = referenceLineX.map(
      (i: { value: number | string; id: number | string }) => {
        if (i.id === id) {
          const obj = JSON.parse(JSON.stringify(i));
          obj.value = value;
          return obj;
        }
        return i;
      },
    );
    updateReferenceLine(arr, 'x');
  };

  // 更新横向参考线
  const uploadY = (value: number | string, id: number | string) => {
    const arr = referenceLineY.map(
      (i: { value: number | string; id: number | string }) => {
        if (i.id === id) {
          const obj = JSON.parse(JSON.stringify(i));
          obj.value = value;
          return obj;
        }
        return i;
      },
    );
    updateReferenceLine(arr, 'y');
  };

  // 新增横向参考线
  const addX = () => {
    clickActionWeblog('referenceLine01');

    const top = ((size?.height / 2 + 3) / size?.height) * 100;
    const value = referenceLineX.length > 0 ? top : 50;
    const id = getId();
    const arr = [...referenceLineX, { value, id }];
    updateReferenceLine(arr, 'x');
    updateReferenceLineShow(true);
  };

  // 获取鼠标按下的位置 创建参考线
  const getAddLine = (e: any, type: string) => {
    const doc: any = document.querySelector('.xiudodo-main');
    const { left, top } = doc.getBoundingClientRect();

    const { clientX, clientY } = e;

    const X = scrollInfo && scrollInfo.left + clientX - left;
    const Y = scrollInfo && scrollInfo.top + clientY - top;

    //  画布到外容器的距离
    const pad =
      type === 'x' ? (size?.height - height) / 2 : (size?.width - width) / 2;
    const newPad = pad > 0 ? pad : 0;

    // 移出画布不显示参考线
    if (type === 'y' && (X - 25 < newPad || X - 25 - newPad > width)) {
      return;
    }

    if (type === 'x' && (Y - 25 < newPad || Y - newPad - 25 > height)) {
      return;
    }
    setHoverLine(null);

    const arr =
      type === 'y'
        ? [
            ...referenceLineY,
            { value: ((X - newPad - 25) / width) * 100, id: getId() },
          ]
        : [
            ...referenceLineX,
            { value: ((Y - newPad - 25) / height) * 100, id: getId() },
          ];
    updateReferenceLine(arr, type);
  };

  // 获取鼠标移动的位置
  const getDisplay = (e: any, type: string) => {
    const doc: any = document.querySelector('.xiudodo-main');

    const { left, top } = doc.getBoundingClientRect();

    const { clientX, clientY } = e;

    const X = scrollInfo && scrollInfo.left + clientX - left;
    const Y = scrollInfo && scrollInfo.top + clientY - top;

    //  画布到外容器的距离
    const pad =
      type === 'x' ? (size?.height - height) / 2 : (size?.width - width) / 2;
    const newPad = pad > 0 ? pad : 0;

    // 移出画布不显示参考线
    if (type === 'y' && (X - 25 < newPad || X - newPad - 25 > width)) {
      setHoverLine(null);
      return;
    }

    if (type === 'x' && (Y - 25 < newPad || Y - newPad - 25 > height)) {
      setHoverLine(null);
      return;
    }

    setHoverLine({
      type,
      pos: type === 'y' ? X : Y,
    });
  };

  // 移出画布删除参考线
  const delLine = (type: string, num: number, id: string | number) => {
    if (type === 'y') {
      if (num < 0 || num > width) {
        const arr = referenceLineY.filter(i => {
          return i.id !== id;
        });
        updateReferenceLine(arr, 'y');
      } else {
        uploadY((num / width) * 100, id);
      }
    } else {
      if (num < 0 || num > height) {
        const arr = referenceLineX.filter(i => {
          return i.id !== id;
        });
        updateReferenceLine(arr, 'x');
      } else {
        uploadX((num / height) * 100, id);
      }
    }
  };

  return {
    showLine,
    addY,
    addX,
    eliminate,
    getAddLine,
    hoverLine,
    setHoverLine,
    getDisplay,
    delLine,
    uploadX,
  };
}
