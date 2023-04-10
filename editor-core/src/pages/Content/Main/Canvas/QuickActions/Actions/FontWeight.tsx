import { XiuIcon } from '@/components';
import { clickActionWeblog } from '@/utils/webLog';
import { useFontWeightByObserver } from '@hc/editor-core';
import classNames from 'classnames';
import { observer } from 'mobx-react';

import commonStyles from './common.modules.less';

// { asset }: { asset: AssetClass }

const FontWeight = () => {
  const [fontWeight, updateFontWeight] = useFontWeightByObserver();

  return (
    <div
      onClick={() => {
        clickActionWeblog('QuickActions14');
        updateFontWeight(fontWeight === 'bold' ? 'normal' : 'bold');
      }}
      className={classNames(commonStyles.item, {
        [commonStyles.active]: fontWeight === 'bold',
      })}
    >
      <XiuIcon type="iconjiacu" style={{ fontSize: 14 }} />
    </div>
  );
};

export default observer(FontWeight);
