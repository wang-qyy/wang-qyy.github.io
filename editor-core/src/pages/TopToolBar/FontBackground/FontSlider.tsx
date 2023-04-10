import { stopPropagation } from '@/utils/single';
import { Slider, InputNumber, SliderSingleProps, InputNumberProps } from 'antd';
import { PropsWithChildren } from 'react';
import styles from './index.less';

interface FontSliderProps extends SliderSingleProps {
  min: number;
  max: number;
  value: number;
  title: string;
  step?: number;
  formatter?: any;
  inputProps?: InputNumberProps;
}

const FontSlider = (props: PropsWithChildren<FontSliderProps>) => {
  const {
    min,
    max,
    title,
    value,
    formatter,
    step,
    onChange,
    inputProps,
    ...others
  } = props;
  return (
    <>
      <div className={styles.fontBgRow}>
        <div className={styles.fontBgRowName}>{title}</div>
        <span
          style={{
            padding: '0 8px',
            border: '1px solid #e3e3e3',
            borderRadius: 4,
            minWidth: 45,
            textAlign: 'center',
          }}
        >
          {formatter ? formatter(value) : value}
        </span>
        {/* <InputNumber
          formatter={formatter}
          step={step}
          min={min}
          max={max}
          // onChange={onChange}
          value={value}
          // style={{ margin: '0 16px' }}
          onKeyDown={stopPropagation}
          {...inputProps}
        /> */}
      </div>
      <div className={styles.fontBgRow}>
        <Slider
          min={min}
          max={max}
          onChange={onChange}
          value={value}
          step={step}
          {...others}
        />
      </div>
    </>
  );
};
export default FontSlider;
