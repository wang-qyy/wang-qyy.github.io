import { stopPropagation } from '@/utils/single';
import { Slider, InputNumber } from 'antd';

import { SliderSingleProps } from 'antd/lib/slider';
import './index.modules.less';

export const SliderInput = (props: SliderSingleProps) => {
  return (
    <>
      <Slider tipFormatter={null} className="row-slider" {...props} />
      <InputNumber
        className="row-input"
        controls={false}
        {...props}
        onKeyDown={stopPropagation}
      />
    </>
  );
};
export default SliderInput;
