import React, { MouseEvent, useRef, useEffect, useState } from 'react';
import { mouseMoveDistance, stopPropagation } from '@/utils/single';
import { useReference } from '@/hooks/useReferenceLine';
import { useSize } from 'ahooks';
import { BasicTarget } from 'ahooks/lib/utils/dom';
import styles from './index.less';

function Line(props: {
  item: { value: number; id: number | string };
  type: string;
  showTip: string | number;
  setShowTip: (id: string | number) => void;
  canvasInfo: { height: number; width: number; scale: number };
}) {
  const { item, type, canvasInfo, showTip, setShowTip } = props;
  const { delLine } = useReference();
  // 获取画布位移量
  const getDisplacement = () => {
    // 相对画布的位移量
    const w =
      type === 'x'
        ? (item.value / 100) * canvasInfo?.height
        : (item.value / 100) * canvasInfo?.width;
    return w;
  };

  const [distance, setDistance] = useState(getDisplacement());

  // 存储上一次比例
  const [initialScale, setInitialScale] = useState(canvasInfo?.scale);

  const size: any = useSize(
    document.querySelector('.xiudodo-canvas') as BasicTarget,
  );

  //  画布到外容器的距离
  const pad =
    type === 'x'
      ? (size?.height - canvasInfo?.height) / 2
      : (size?.width - canvasInfo?.width) / 2;
  const newPad = pad > 0 ? pad + 25 : 25;

  const handleMove = (e: MouseEvent<HTMLDivElement>) => {
    stopPropagation(e);
    e.preventDefault();
    mouseMoveDistance(
      e,
      (Xdistance, Ydistance) => {
        const num = type === 'x' ? Ydistance + distance : Xdistance + distance;
        // 移动参考距离 为模板宽高
        const referenceDistance =
          type === 'x' ? canvasInfo?.height / 2 : canvasInfo?.width / 2;

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
        delLine(type, num, item.id);
      },
    );
  };
  useEffect(() => {
    if (canvasInfo?.scale && initialScale !== canvasInfo?.scale) {
      setInitialScale(canvasInfo?.scale);
      setDistance(distance * (canvasInfo?.scale / initialScale));
    }
  }, [canvasInfo?.scale]);

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
                top: `${distance + newPad}px`,
              }
              : {
                left: `${distance + newPad}px`,
              }
          }
        >
          {(distance / canvasInfo.scale).toFixed(0)}
        </div>
      )}
      <div
        className={type === 'x' ? styles.referenceLineX : styles.referenceLineY}
        style={
          type === 'x'
            ? {
              top: `${distance + newPad}px`,
              left: 25,
              width: size?.width,
            }
            : {
              left: `${distance + newPad}px`,
              top: 25,
              height: size?.height,
            }
        }
        onMouseDown={handleMove}
      />
    </>
  );
}

export default Line;
