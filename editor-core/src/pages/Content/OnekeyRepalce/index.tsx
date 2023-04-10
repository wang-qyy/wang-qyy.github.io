import { observer } from 'mobx-react';
import { Spin } from 'antd';

import { assetBlur, getCurrentTemplate } from '@/kernel';

import { useOneKeyReplace } from '@/store/adapter/useGlobalStatus';
import classNames from 'classnames';
import NoTitleModal from '@/components/NoTitleModal';
import Assets from './Assets';
import styles from './index.less';
import { useFormatResAssets } from './hooks/observer';
import oneKeyReplaceStore from './store';
import Header from './Header';

const OnekeyRepalce = () => {
  useFormatResAssets();
  const currentTemplate = getCurrentTemplate();

  const { loading } = oneKeyReplaceStore;
  const { openCloseOneKeyReplace } = useOneKeyReplace();

  if (!currentTemplate) return null;

  return (
    <NoTitleModal
      visible
      onCancel={() => {
        openCloseOneKeyReplace(false);
      }}
      className={styles.oneKeyReplaceModal}
      centered
      footer={null}
      // 比替换弹窗低一级
      zIndex={998}
    >
      <div
        className={styles.oneKeyWrapper}
        onMouseDown={() => {
          assetBlur();
        }}
      >
        <div
          className={classNames(styles.loading, {
            [styles.show]: loading,
          })}
        >
          <Spin spinning tip="替换中..." />
        </div>
        <Header />
        <Assets />
      </div>
    </NoTitleModal>
  );
};

export default observer(OnekeyRepalce);
