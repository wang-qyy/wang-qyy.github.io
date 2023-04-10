import React, { MouseEvent, useEffect, useState } from 'react';
import { mouseMoveDistance, stopPropagation } from '@/utils/single';
import { useReference } from './hook/useReferenceLine';
import styles from './index.less';

function Line(props: {
  item: { value: number; id: number | string };
  type: string;
  showTip: string | number;
  setShowTip: any;
  canvasInfo: { height: number; width: number; scale: number };
  docWidth: number;
  docHeight: number;
}) {
  const { item, type, canvasInfo, showTip, setShowTip, docWidth, docHeight } =
    props;

  const { height, width, scale } = canvasInfo;
  // 获取画布实际宽高
  const canvasHeight = height * scale;
  const canvasWidth = width * scale;

  const { delLine, getPad } = useReference();
  // 获取画布位移量
  const getDisplacement = () => {
    // 相对画布的位移量
    const w =
      type === 'x'
        ? (item.value / 100) * canvasHeight
        : (item.value / 100) * canvasWidth;
    return Number(w);
  };

  // 参考线相对画布的距离
  const [distance, setDistance] = useState(getDisplacement());

  useEffect(() => {
    setDistance(getDisplacement());
  }, [scale]);

  // 画布到外容器的距离;
  const newPad = getPad(type, canvasHeight, canvasWidth);

  const handleMove = (e: MouseEvent<HTMLDivElement>) => {
    stopPropagation(e);
    e.preventDefault();
    mouseMoveDistance(
      e,
      (Xdistance, Ydistance) => {
        const num = type === 'x' ? Ydistance + distance : Xdistance + distance;

        // 移动参考距离 为模板宽高
        const referenceDistance =
          type === 'x' ? canvasHeight / 2 : canvasWidth / 2;
        setShowTip(item.id);

        // 中心吸附
        if (
          (num < referenceDistance && num > referenceDistance - 10) ||
          (num < referenceDistance + 10 && num > referenceDistance)
        ) {
          setDistance(referenceDistance);
        } else {
          setDistance(num);
        }
      },
      (Xdistance, Ydistance) => {
        setShowTip('');
        const num = type === 'x' ? Ydistance + distance : Xdistance + distance;
        delLine(type, num, item.id, canvasHeight, canvasWidth);
      },
    );
  };

  return (
    <>
      {showTip === item.id && (
        <div
          className={
            type === 'x' ? styles.referenceLineXTip : styles.referenceLineYTip
          }
          style={
            type === 'x'
              ? {
                  top: `${distance + newPad - 5 + 26}px`, // 5是xiudodo-canvas 容器的border 26是刻度尺的宽度
                }
              : {
                  left: `${distance + newPad - 5 + 26}px`,
                }
          }
        >
          {type === 'x'
            ? (height - distance / canvasInfo.scale).toFixed(0)
            : (distance / canvasInfo.scale).toFixed(0)}
        </div>
      )}
      <div
        className={type === 'x' ? styles.referenceLineX : styles.referenceLineY}
        style={
          type === 'x'
            ? {
                top: `${distance + newPad - 5 + 26}px`,
                left: 30,
                width: docWidth,
              }
            : {
                left: `${distance + newPad - 5 + 26}px`,
                top: 30,
                height: docHeight,
              }
        }
        onMouseDown={handleMove}
      />
    </>
  );
}

export default Line;
