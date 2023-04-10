import { observer } from 'mobx-react';
import { InputNumber } from 'antd';
import CustomInputNumber from '@/components/CustomInputNumber';

import { useFontSize } from '@kernel/index';
import { DefaultSettingProps } from '../typing';
//
function FontSize(props: DefaultSettingProps) {
  const [value, update] = useFontSize();

  const { asset, ...others } = props;

  return <InputNumber value={value} onChange={update} {...others} />;

  return (
    <CustomInputNumber
      label="Font size"
      value={value}
      onChange={update}
      {...others}
    />
  );
}

export default observer(FontSize);
