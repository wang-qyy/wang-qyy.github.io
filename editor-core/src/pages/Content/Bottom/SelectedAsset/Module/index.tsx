import { observer } from '@hc/editor-core';

import XiuIcon from '@/components/XiuIcon';
import './index.less';

export default observer(() => {
  return (
    <div className="selected-asset-module">
      <XiuIcon type="icona-173" />
      组件
    </div>
  );
});
