import React from 'react';
import { AssetItemProps } from '@kernel/typing';
import { observer } from 'mobx-react';
import OriginText from './components/originText';

const Text = (props: AssetItemProps) => {
  return <OriginText {...props} />;
};
export default observer(Text);
