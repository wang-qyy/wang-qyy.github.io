import { observer } from 'mobx-react';
import type { AssetItemProps } from '@kernel/typing';
import Lottie from './lottie';
import Static from './static';

export default observer((props: AssetItemProps) => {
  const { asset, showOnly } = props;
  // eslint-disable-next-line no-nested-ternary
  return showOnly ? <Static {...props} /> : <Lottie {...props} />;
});
