import { XiuIcon } from '@/components';
import { Slider, InputNumber } from 'antd';
import classNames from 'classnames';
import { useEffect, useState } from 'react';

import styles from './index.modules.less';

export const SliderText = props => {
  const { defaultValue, onChange } = props;
  const [inputValue, setInputValue] = useState(defaultValue);
  const onChangeClick = value => {
    setInputValue(value);
    onChange && onChange(value);
  };
  useEffect(() => {
    setInputValue(defaultValue);
  }, [defaultValue]);
  return (
    <div className={styles.sliderText}>
      <Slider
        tipFormatter={null}
        className={styles.slider}
        min={1}
        max={100}
        onChange={onChangeClick}
        value={typeof inputValue === 'number' ? inputValue : 0}
      />
      <InputNumber
        className={styles.input}
        controls={false}
        min={1}
        max={100}
        style={{ margin: '0 16px' }}
        value={inputValue}
        onChange={onChangeClick}
      />
    </div>
  );
};
export default SliderText;
