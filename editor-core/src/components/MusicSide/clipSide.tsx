import react, { FC } from 'react';
import { Slider, Progress } from 'antd';
import styles from './index.less';

interface Prop {
  style: any;
  sliderValue: Array;
  bindSliderChange: (value) => void;
}
const MisicSide: FC<Prop> = Props => {
  const { style, sliderValue, bindSliderChange } = Props;
  return (
    <div>
      <div className={styles.slidewarp2} style={style}>
        <Slider
          tipFormatter={null}
          range
          value={sliderValue}
          max={100.0}
          min={0.0}
          step={0.01}
          // defaultValue={[0, 100]}
          onChange={value => bindSliderChange(value)}
        />
      </div>
    </div>
  );
};

export default MisicSide;
