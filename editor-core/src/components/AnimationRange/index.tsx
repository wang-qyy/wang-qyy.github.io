import { Range, RangeProps } from 'rc-slider';
import { InputNumber } from 'antd';
import 'rc-slider/assets/index.css';
import './index.less';
import React, { CSSProperties } from 'react';
import ArrowNodeHandle from '@/components/AnimationRange/ArrowNodeHandle';

const defaultStyle = {
  width: 400,
};

export interface AnimationRangeType extends RangeProps {
  style?: CSSProperties;
  className?: string;
}

function AnimationRange(props: AnimationRangeType) {
  const {
    style = defaultStyle,
    className,
    value = [0, 0],
    max = 1,
    min = 1,
  } = props;
  const [startTime, endTime] = value;

  function onChange(value: number[]) {
    props.onChange?.(value);
  }

  return (
    <div style={style} className={`xiu-animationRange ${className || ''}`}>
      <InputNumber
        onChange={value => {
          onChange([value, endTime]);
        }}
        value={startTime}
        min={min}
        step={100}
        max={max - endTime}
      />
      <Range
        key={max}
        handle={props => (
          <ArrowNodeHandle
            key={`${props.prefixCls}-${props.index}`}
            {...props}
          />
        )}
        allowCross={false}
        {...props}
        max={max}
        min={min}
        onChange={value => {
          onChange([value[0], max - value[1]]);
        }}
        value={[startTime, max - endTime]}
      />
      <InputNumber
        onChange={value => {
          console.log(value);
          onChange([startTime, value]);
        }}
        value={endTime}
        min={min}
        step={100}
        max={max - startTime}
      />
    </div>
  );
}

export default AnimationRange;
