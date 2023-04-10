import { observer } from 'mobx-react';
import { Input } from 'antd';
import classNames from 'classnames';

import AssetItemState from '@/kernel/store/assetHandler/asset';
import { setAssetIntoView } from '@/utils/assetHandler';
import { getCurrentAsset, useTextByObserver } from '@/kernel';
import { stopPropagation } from '@/utils/single';

import styles from './index.less';

const TextItem = ({ asset }: { asset: AssetItemState }) => {
  const {
    attribute: { text = [] },
  } = asset;

  const currentAsset = getCurrentAsset();

  const [, update] = useTextByObserver();

  return (
    <div
      className={classNames(styles.TextItem, {
        [styles.active]: currentAsset?.id === asset.id,
      })}
      onMouseDown={e => {
        stopPropagation(e);
        setAssetIntoView({ asset, withAbsoluteTime: false });
      }}
    >
      <Input.TextArea
        value={text.join('\n')}
        autoSize
        onChange={e => {
          update(e.target.value.split('\n'));
        }}
      />
    </div>
  );
};

export default observer(TextItem);
