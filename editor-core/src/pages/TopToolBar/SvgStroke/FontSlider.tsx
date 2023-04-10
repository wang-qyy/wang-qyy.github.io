import { Slider, InputNumber } from 'antd';
import styles from './index.less';

const FontSlider = (props: {
  min: number;
  max: number;
  value: number;
  title: string;
  step?: number;
  formatter?: any;
  onChange: (val: number) => void;
  onAfterChange: (val: number) => void;
}) => {
  const { min, max, title, value, formatter, step, onChange, onAfterChange } =
    props;
  return (
    <>
      <div className={styles.fontBgRow}>
        <div className={styles.fontBgRowName}>{title}</div>
        <InputNumber
          formatter={formatter}
          step={step}
          min={min}
          max={max}
          onChange={v => {
            onChange(v);
            onAfterChange(v);
          }}
          value={value}
          className={styles.fontBgRowRight}
          style={{ margin: '0 16px' }}
        />
      </div>
      <div className={styles.fontBgRow}>
        <Slider
          min={min}
          max={max}
          onChange={onChange}
          value={value}
          step={step}
          onAfterChange={onAfterChange}
        />
      </div>
    </>
  );
};
export default FontSlider;
