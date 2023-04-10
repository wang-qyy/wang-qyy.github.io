import { Slider, InputNumber } from 'antd';

import { SliderSingleProps } from 'antd/lib/slider';
import styles from './index.modules.less';

export const SliderWithInput = (props: SliderSingleProps) => {
  return (
    <div className={styles.sliderText}>
      <Slider tipFormatter={null} className={styles.slider} {...props} />
      <InputNumber
        className={styles.input}
        controls={false}
        style={{ margin: '0 16px' }}
        {...props}
      />
    </div>
  );
};
export default SliderWithInput;
