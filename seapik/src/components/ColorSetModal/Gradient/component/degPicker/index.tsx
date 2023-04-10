import { useState, useRef, useEffect } from 'react';
import { useThrottleFn, useUpdateEffect } from 'ahooks';
import { InputNumber } from 'antd';
import { getAngle } from '@/kernel/utils/single';

import './index.less';

const DegPicker = (props: {
  angle: number;
  onChange: (angle: number) => void;
}) => {
  const { onChange, angle } = props;
  const degPosBox = useRef<HTMLDivElement>(null);
  const dragBox = useRef(null);
  const point = useRef(null);
  const [coord, setCoord] = useState({ angle, rotate: -angle });

  useEffect(() => {
    onChange(coord.angle);
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
    (event) => {
      event.preventDefault();
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
    { wait: 100 },
  );

  /**
   * 松开鼠标
   */
  const { run: mouseUp } = useThrottleFn(
    (event) => {
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
        <InputNumber
          style={{ width: 70, marginLeft: 8 }}
          value={coord.angle}
          onChange={(v) => {
            setCoord({ angle: Number(v), rotate: coord.rotate });
          }}
        />
      </div>
    </>
  );
};
export default DegPicker;
