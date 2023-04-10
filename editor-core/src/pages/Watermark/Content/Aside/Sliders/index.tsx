import { FC } from 'react';
import OverwriteSlider from '@/components/OverwriteSlider';

import styles from './index.less';

interface Prop {
  title: string;
  bindChange: any;
  onAfterChange: any;
  num: number;
  min: number;
}
const Sliders: FC<Prop> = Props => {
  const { title, bindChange, num, min, onAfterChange } = Props;
  return (
    <div className={styles.transparency}>
      <div className={styles.top}>
        <div className={styles.left}>{title}</div>
        <div className={styles.right}>{Number(num)}</div>
      </div>
      <div className={styles.bottom}>
        <OverwriteSlider
          value={Number(num)}
          min={min}
          onChange={value => bindChange(value)}
          onAfterChange={value => onAfterChange(value)}
          tooltipVisible={false}
        />
      </div>
    </div>
  );
};

export default Sliders;
