import { InputNumber } from 'antd';
import { observer } from 'mobx-react';
import CustomInputNumber from '@/components/CustomInputNumber';

import { useRotate } from '@kernel/index';
import { DefaultSettingProps } from '../typing';

//
function Rotation(props: DefaultSettingProps) {
  const [value, update] = useRotate();

  return <CustomInputNumber label="Rotation" value={value} onChange={update} />;
}

export default observer(Rotation);
