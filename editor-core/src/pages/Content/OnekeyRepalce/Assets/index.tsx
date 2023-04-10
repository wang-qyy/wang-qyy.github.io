/* eslint-disable react/no-array-index-key */
import { observer } from 'mobx-react';
import AssetItemState from '@/kernel/store/assetHandler/asset';
import { useState } from 'react';
import classNames from 'classnames';
import { XiuIcon } from '@/components';
import { clickActionWeblog } from '@/utils/webLog';
import styles from './index.less';
import MediaItem from './MediaItem';
import oneKeyReplaceStore from '../store';

const Assets = () => {
  const { quickAssets } = oneKeyReplaceStore;
  const [type, setType] = useState(0);
  return (
    <div className={styles.assetWrap}>
      <div className={styles.actionWrap}>
        <div
          className={classNames(styles.actionItem, {
            [styles.actionItemChoosed]: type === 0,
          })}
          onClick={() => {
            setType(0);
            clickActionWeblog('onkeyReplace_005');
          }}
        >
          <XiuIcon type="iconliebiao" />
        </div>
        <div
          className={classNames(styles.actionItem, {
            [styles.actionItemChoosed]: type === 1,
          })}
          onClick={() => {
            setType(1);
            clickActionWeblog('onkeyReplace_006');
          }}
        >
          <XiuIcon type="iconpingpu" />
        </div>
      </div>
      <div
        className={classNames(styles.assetList, {
          [styles.assetListItemWrap]: type === 0,
        })}
      >
        {quickAssets.map((assets, index) => {
          if (assets.length === 0) {
            return null;
          }
          return type === 0 ? (
            <>
              {(assets ?? []).map((item: AssetItemState) => (
                <MediaItem isDrag={false} key={item.meta.id} asset={item} />
              ))}
            </>
          ) : (
            <div key={index} className={styles.assetListItem}>
              <div className={styles.assetListItemTitle}>
                片段 {index < 9 ? 0 : ''}
                {index + 1}
              </div>
              <div className={styles.assetListItemWrap}>
                {(assets ?? []).map((item: AssetItemState) => (
                  <MediaItem isDrag={false} key={item.meta.id} asset={item} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default observer(Assets);
