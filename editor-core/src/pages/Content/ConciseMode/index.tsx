import { observer } from 'mobx-react';
import { useEffect } from 'react';
import { Spin } from 'antd';

import {
  assetBlur,
  getAllAudios,
  getCurrentTemplate,
  getLayerAssets,
  getRelativeCurrentTime,
  useAssetReplaceByObserver,
} from '@/kernel';

import { useAssetReplaceModal } from '@/store/adapter/useGlobalStatus';
import classNames from 'classnames';
import Parts from './Parts';
import Content from './Content';
import Assets from './Assets';
import styles from './index.less';
import { useFormatResAssets, useSetTemplateIndex } from './hooks/observer';
import conciseModeStore from './store';
// import { setCurrentTemplate } from '@/kernel/store';

const ConciseMode = () => {
  // 组件初次加载时，默认选中第一个片段
  useSetTemplateIndex();
  useFormatResAssets();
  const currentTemplate = getCurrentTemplate();

  const { loading } = conciseModeStore;

  const { inReplacing } = useAssetReplaceByObserver();
  const { open: openAssetReplaceModal } = useAssetReplaceModal();

  useEffect(() => {
    if (inReplacing) {
      // 双击替换视频、图片
      openAssetReplaceModal('modal-replace');

      // clickActionWeblog('canvas_dbClick', {
      //   action_label: replaceAsset?.meta.type,
      // });
    }
  }, [inReplacing]);

  if (!currentTemplate) return null;

  return (
    <div
      className={styles.ConciseMode}
      onMouseDown={() => {
        assetBlur();
      }}
    >
      <div
        className={classNames(styles.loading, {
          [styles.show]: loading,
        })}
      >
        <Spin spinning={loading} tip="替换中..." />
      </div>
      <Parts />
      <Content />
      <Assets />
    </div>
  );
};

export default observer(ConciseMode);
