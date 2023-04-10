import { InputNumber } from 'antd';
import { observer } from 'mobx-react';

import { useLetterSpacing } from '@kernel/index';

import CustomInputNumber from '@/components/CustomInputNumber';
import { DefaultSettingProps } from '../typing';

//
function Spacing(props: DefaultSettingProps) {
  const [value, update] = useLetterSpacing();

  return (
    <CustomInputNumber
      label="Spacing"
      value={value}
      onChange={update}
      step={0.1}
    />
  );
}

export default observer(Spacing);
