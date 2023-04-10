import { Slider, InputNumber, SliderSingleProps } from 'antd';
import classNames from 'classnames';
import { PropsWithChildren, memo, ReactElement } from 'react';
import './index.less';

interface OverwriteSliderProps extends SliderSingleProps {
  value?: number;
  label?: string | ReactElement;
  wrapperClassName?: string;
}

const AdjustSlider = ({
  value,
  onChange = () => {},
  label,
  min,
  max,
  className,
  wrapperClassName,
  onAfterChange = () => {},
}: PropsWithChildren<OverwriteSliderProps>) => {
  return (
    <div className={classNames('filter-slider', wrapperClassName)}>
      <div className="img-filter-label">{label}</div>
      <Slider
        tipFormatter={null}
        className={className}
        min={min}
        max={max}
        onAfterChange={onAfterChange}
        value={value}
        onChange={onChange}
      />
      <InputNumber
        size="small"
        style={{ width: 60, marginLeft: 18 }}
        min={min}
        max={max}
        value={value}
        onChange={v => {
          onChange(v);
          onAfterChange(v);
        }}
      />
    </div>
  );
};

export default memo(AdjustSlider);
