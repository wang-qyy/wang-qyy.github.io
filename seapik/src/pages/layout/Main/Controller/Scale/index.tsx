import { Popover, Slider } from 'antd';
import { useCanvasScaleByObserver, getCanvasInfo } from '@/kernel';
import { getScale } from '@/utils';

import styles from './index.modules.less';
import { observer } from 'mobx-react';

const SCALE = [0.1, 0.25, 0.5, 0.75, 1];

function Scale() {
  const { value, update } = useCanvasScaleByObserver();

  return (
    <div className={styles.scale}>
      <Popover
        placement="top"
        trigger="click"
        overlayClassName={styles['scale-popover']}
        content={
          <div className={styles['scales']}>
            {SCALE.map((item) => (
              <div key={item} onClick={() => update(Number(item))}>
                {item * 100}%
              </div>
            ))}
            <div
              onClick={() => {
                update(getScale(getCanvasInfo()));
              }}
            >
              Fit
            </div>
          </div>
        }
      >
        <span className={styles['scale-num']}>
          {parseInt(`${value * 100}`)}%
        </span>
        &nbsp;&nbsp;
      </Popover>
      <Slider
        max={5}
        min={0.1}
        value={value}
        tooltip={{ open: false }}
        step={0.01}
        onChange={update}
      />
    </div>
  );
}
export default observer(Scale);
