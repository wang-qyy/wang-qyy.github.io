import React, { useState, useRef, useEffect } from 'react';
import { useThrottleFn, useUpdateEffect } from 'ahooks';
import { getAngle } from '@/kernel/utils/single';

const DegPicker = (props: {
  angle: number;
  onChange: (coord: { angle: number; rotate: number }) => void;
}) => {
  const { onChange, angle } = props;
  const degPosBox = useRef(null);
  const dragBox = useRef(null);
  const point = useRef(null);
  const [coord, setCoord] = useState({ angle, rotate: -angle });

  useEffect(() => {
    onChange && onChange(coord);
  }, [coord]);
  useUpdateEffect(() => {
    setCoord({
      angle,
      rotate: -angle,
    });
  }, [angle]);
  /**
   * 获取坐标
   */
  const getCoord = () => {
    const { clientWidth, clientHeight } = degPosBox.current;
    const { left, top } = degPosBox.current.getBoundingClientRect();
    const originX = left + clientWidth / 2;
    const originY = top + clientHeight / 2;
    const R = clientWidth / 2;
    // 斜边
    const hypot = Math.sqrt(2 * R * R);
    return {
      originX,
      originY,
      R,
      hypot,
    };
  };

  // 计算角度
  const { run: dispose } = useThrottleFn(
    event => {
      const { clientX, clientY } = event;
      const { originX, originY } = getCoord();
      const x = clientX - originX;
      const y = clientY - originY;
      // 计算角度和left,top
      const angle = getAngle(x, y);
      setCoord({
        ...coord,
        angle,
        rotate: -angle,
      });
    },
    { wait: 160 },
  );

  /**
   * 松开鼠标
   */
  const { run: mouseUp } = useThrottleFn(
    event => {
      dispose(event);
      window.removeEventListener('mousemove', dispose);
      window.removeEventListener('mouseup', mouseUp);
    },
    { wait: 160 },
  );

  /**
   * 按下鼠标
   */
  const { run: mouseDown } = useThrottleFn(
    () => {
      window.addEventListener('mousemove', dispose);
      window.addEventListener('mouseup', mouseUp);
    },
    { wait: 160 },
  );

  return (
    <>
      <div className="deg-picker" ref={degPosBox}>
        <div
          className="deg-picker-main"
          ref={dragBox}
          onMouseDown={mouseDown}
          style={{ transform: `rotate(${coord.rotate}deg)` }}
        >
          <div ref={point} className="deg-picker-main-chose" />
        </div>
      </div>
    </>
  );
};
export default DegPicker;
