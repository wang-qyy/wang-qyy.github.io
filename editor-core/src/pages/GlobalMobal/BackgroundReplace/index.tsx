import React, { useState } from 'react';
import { useSize } from 'ahooks';
import classNames from 'classnames';
import { Button } from 'antd';

import { assetBlur, useAssetReplaceByObserver } from '@hc/editor-core';
import { CloseOutlined } from '@ant-design/icons';

import NoTitleModal from '@/components/NoTitleModal';
import {
  useAssetReplaceModal,
  useOneKeyReplace,
} from '@/store/adapter/useGlobalStatus';
import { getResAssets } from '@/pages/Content/ConciseMode/store/adapter';
import { getOneReplaceList } from '@/pages/Content/OnekeyRepalce/store/adapter';
import {
  handleBatchReplaceAsset,
  handleOnkeyBatchReplaceAsset,
} from '@/utils/assetHandler';
import { clickActionWeblog } from '@/utils/webLog';
import Personal from './Personal';
import Cloud from './Cloud';
import styles from './index.less';

function ReplaceModal() {
  const { isOneKeyReplace, openCloseOneKeyReplace } = useOneKeyReplace();
  const { endClip, inReplacing } = useAssetReplaceByObserver();

  const [active, setActive] = useState('personal');
  const size = useSize(document.querySelector('body'));
  const {
    value: { visible, type, selectedList },
    close: closeAssetReplaceModal,
  } = useAssetReplaceModal();

  const resAssets = isOneKeyReplace ? getOneReplaceList() : getResAssets();

  const isReplaceAll = type === 'replace-batch';

  const replacedList = resAssets.filter(t => t.replaced);

  const newList = selectedList.map((item: any) => ({
    meta: {
      type: item.picUrl ? 'image' : 'videoE',
    },
    attribute: { ...item },
    transform: {},
  }));

  /**
   * 关闭相关弹窗
   */
  function closeModal() {
    closeAssetReplaceModal();
    // 退出替换状态
    if (inReplacing) {
      endClip();
    }
  }
  return (
    <>
      <NoTitleModal
        visible={visible}
        onCancel={closeModal}
        footer={false}
        width={size?.width > 1600 ? 1332 : 911}
        centered
        closeIcon={<CloseOutlined style={{ color: 'rgba(72, 78, 95, 1)' }} />}
        zIndex={999}
      >
        <div className={styles.replaceModalContent}>
          <div className={styles.left}>
            {[
              { name: '个人空间', id: 'personal' },
              { name: '云端空间', id: 'cloud' },
            ].map(item => {
              return (
                <div
                  onClick={() => {
                    setActive(item.id);
                  }}
                  key={item.id}
                  className={classNames(styles.leftItem, {
                    [styles.leftItemActive]: active === item.id,
                  })}
                >
                  {item.name}
                </div>
              );
            })}
          </div>
          <div className={styles.right}>
            <div className={styles.content}>
              {active === 'personal' ? <Personal /> : <Cloud />}
            </div>
            {isReplaceAll && (
              <div className={styles.replaceInfo}>
                <div className={styles.text}>
                  该模板还需要替换
                  <span>{resAssets.length - replacedList.length}</span>
                  张图片，已替换成功 <span>{replacedList.length}</span> 张
                </div>
                <Button
                  size="small"
                  type="primary"
                  disabled={!selectedList.length}
                  onClick={() => {
                    // 'video' ? 'videoE' : 'image'
                    if (isOneKeyReplace) {
                      // 一键替换功能的
                      handleOnkeyBatchReplaceAsset(newList);
                      assetBlur();
                      // 关闭一键替换弹窗
                      openCloseOneKeyReplace(false);
                      clickActionWeblog('onkeyReplace_010');
                    } else {
                      // 极速模式的一键替换
                      handleBatchReplaceAsset(newList);
                      clickActionWeblog('concise23');
                    }
                    closeModal();
                  }}
                >
                  确认替换
                </Button>
              </div>
            )}
          </div>
        </div>
      </NoTitleModal>
    </>
  );
}

export default ReplaceModal;
