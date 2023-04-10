import { Slider, InputNumber, SliderSingleProps } from 'antd';
import { PropsWithChildren, memo, ReactElement } from 'react';
import './index.less';

interface OverwriteSliderProps extends SliderSingleProps {
  value?: number;
  label?: string | ReactElement;
}

const AdjustSlider = ({
  value,
  onChange = () => {},
  label,
  min,
  max,
  className,
  onAfterChange = () => {},
}: PropsWithChildren<OverwriteSliderProps>) => {
  return (
    <div className="img-filter-slider">
      <div className="title">
        <div className="label">{label}</div>
        <InputNumber
          size="small"
          style={{ width: 60 }}
          min={min}
          max={max}
          value={value}
          onChange={v => {
            onChange(v);
            onAfterChange(v);
          }}
        />
      </div>
      <Slider
        tipFormatter={null}
        className={className}
        min={min}
        max={max}
        onAfterChange={onAfterChange}
        value={value}
        onChange={onChange}
      />
    </div>
  );
};

export default memo(AdjustSlider);
