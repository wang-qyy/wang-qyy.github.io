import { useState, MouseEvent, useRef } from 'react';
import { MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import { mouseMoveDistance } from '@/utils/single';
import { useSetTimeScale } from '@/store/adapter/useDesigner';

import styles from './index.modules.less';

const step = 0.5;

export default function TimeScaleHandler() {
  // const [scale, setScale] = useState(1);
  const ref = useRef<HTMLDivElement>(null);
  const { timeRuleScale: scale, update: setScale } = useSetTimeScale();

  function handleMove(e: MouseEvent<HTMLDivElement>) {
    e.preventDefault();
    const width = ref.current?.getBoundingClientRect().width || 0;

    mouseMoveDistance(e, distance => {
      const change = Math.ceil((distance / width) * 100) + scale;

      if (change < 1 || change > 100) return;
      setScale(change);
    });
  }

  return (
    <div className={styles.wrap}>
      <div
        className={styles['change-btn']}
        onClick={() => {
          if (scale > 1) setScale(scale - step);
        }}
      >
        <MinusCircleOutlined />
      </div>
      <div className={styles.slider} ref={ref}>
        <div className={styles.line} style={{ width: `${scale}%` }} />
        <Tooltip
          placement="top"
          title={`${scale}%`}
          getTooltipContainer={ele => ele}
          overlayInnerStyle={{ fontSize: 12 }}
        >
          <div
            className={styles.handler}
            style={{ left: `${scale}%` }}
            onMouseDown={handleMove}
          />
        </Tooltip>
      </div>
      <div
        className={styles['change-btn']}
        onClick={() => {
          if (scale < 100) setScale(scale + step);
        }}
      >
        <PlusCircleOutlined />
      </div>
    </div>
  );
}
