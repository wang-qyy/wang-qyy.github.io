import { stopPropagation } from '@/utils/single';
import { Slider, InputNumber, SliderSingleProps } from 'antd';
import {
  PropsWithChildren,
  CSSProperties,
  memo,
  useRef,
  ReactElement,
} from 'react';
import './index.less';

interface OverwriteSliderProps extends SliderSingleProps {
  colon?: boolean;
  value?: number;
  label?: string | ReactElement;
  inputNumber?: boolean;
  onAfterChange?: (value: any) => void;
}

const OverwriteSlider = ({
  colon = true,
  value,
  onChange,
  onAfterChange,
  inputNumber = false,
  label,
  style,
  min = 0,
  max = 100,
  ...res
}: PropsWithChildren<OverwriteSliderProps>) => {
  const sliderRef = useRef();

  return (
    <div className="cover-slider" style={style} onKeyDown={stopPropagation}>
      {label && (
        <div className="cover-slider-label">
          {label}
          {colon ? '：' : ''}
        </div>
      )}
      <Slider
        ref={sliderRef}
        style={{}}
        min={min}
        max={max}
        value={value || 0}
        onAfterChange={value => {
          if (sliderRef.current) {
            sliderRef.current.blur();
          }
          if (onAfterChange) {
            onAfterChange(value);
          }
        }}
        onChange={onChange}
        {...res}
      />

      {inputNumber && (
        <InputNumber
          size="small"
          min={min}
          max={max}
          value={value}
          onChange={onChange}
        />
      )}
    </div>
  );
};

export default memo(OverwriteSlider);
