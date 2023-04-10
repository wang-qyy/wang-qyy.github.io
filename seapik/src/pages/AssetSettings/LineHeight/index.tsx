import { observer } from 'mobx-react';

import CustomInputNumber from '@/components/CustomInputNumber';

import { useLineHeight } from '@kernel/index';
import { DefaultSettingProps } from '../typing';
//
function LineHeight(props: DefaultSettingProps) {
  const [value, update] = useLineHeight();

  const { asset, ...others } = props;

  return (
    <CustomInputNumber
      label="Line height"
      value={value}
      onChange={update}
      step={0.1}
      {...others}
    />
  );
}

export default observer(LineHeight);
