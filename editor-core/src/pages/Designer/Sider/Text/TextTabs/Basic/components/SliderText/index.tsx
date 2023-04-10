import { Slider, InputNumber, SliderSingleProps } from 'antd';
import { PropsWithChildren, useEffect, useState } from 'react';

import styles from './index.modules.less';

interface OperationSliderProps extends SliderSingleProps {
  inputNumber?: boolean;
}

export const OperationSlider = (
  props: PropsWithChildren<OperationSliderProps>,
) => {
  const { defaultValue, onChange, inputNumber = true, ...reset } = props;
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
        {...reset}
      />
      {inputNumber && (
        <InputNumber
          className={styles.input}
          controls={false}
          min={1}
          max={100}
          style={{ margin: '0 16px' }}
          value={inputValue}
          onChange={onChangeClick}
        />
      )}
    </div>
  );
};
export default OperationSlider;
