import classNames from 'classnames';

import { message, Tooltip } from 'antd';
import {
  useGetCurrentAsset,
  addTemplateWithNewAsset,
  getCurrentTemplateIndex,
  pauseVideo,
  toJS,
  observer,
  addCopiedAsset,
  addEmptyTemplate,
  setAssetVisible,
  templateRearrange,
  setCurrentTime,
  getTemplateTimeScale,
  getRelativeCurrentTime,
  getAllTemplates,
  useCameraByObeserver,
} from '@hc/editor-core';
import { XiuIcon } from '@/components';

import { createTrackId } from '@/pages/Designer/Bottom/hooks';

import { stopPropagation } from '@/utils/single';
import { useRemoveAsset } from '@/hooks/useAssetActions';
import { DEFAULT_TEMPLATE_PAGE_TIME } from '@/config/basicVariable';
import { setAssetEditStatus } from '@/utils/assetHandler';
import { getNewAssetDuration } from '@/utils/assetHandler/init';
import SetAssetIsQuickEditor from './SetAssetIsQuickEditor';

import SetAssetDuration from './SetAssetDuration';
import { useSplit } from './handler';

import TimeScaleHandler from '../TimeHandler/TimeScaleHandler';

import styles from './index.modules.less';

export function Item({ item }: any) {
  return (
    <Tooltip title={item.tooltip} overlayInnerStyle={{ fontSize: 10 }}>
      <div
        className={classNames(styles['action-item'], {
          [styles.disabled]: item.disabled,
          [styles.choosed]: item.choosed,
        })}
        onClick={e => {
          stopPropagation(e);
          if (item.disabled) {
            item.disabledTip && message.info(item.disabledTip);
            return;
          }
          pauseVideo();
          item.onClick?.();
        }}
      >
        <XiuIcon
          type={item.icon}
          className={styles[item.key]}
          style={item.iconStyle}
        />
        {item.name && <span className={styles.name}>{item.name}</span>}
      </div>
    </Tooltip>
  );
}

function Handler() {
  const currentAsset = useGetCurrentAsset();

  const { handleRemoveAsset } = useRemoveAsset();

  const { assetDisable, templateDisable, split } = useSplit();
  const { start, inCamera } = useCameraByObeserver();

  function handleTemplateRearrange(currentIndex: number, targetIndex: number) {
    const currentTime = getRelativeCurrentTime();
    templateRearrange(currentIndex, targetIndex);

    const timeScale = getTemplateTimeScale();
    const time = timeScale[targetIndex][0] + currentTime;
    setCurrentTime(time, false);
  }

  const actions = [
    {
      key: 'copy',
      tooltip: '复制',
      disabled: !currentAsset,
      icon: 'icona-Frame6',
      onClick: () => {
        if (currentAsset) {
          const { startTime, endTime } = currentAsset.assetDuration;
          const pageTime = endTime - startTime;

          if (currentAsset.meta.isBackground) {
            const currentTemplateIndex = getCurrentTemplateIndex();

            addTemplateWithNewAsset({
              assets: [
                {
                  type: currentAsset.meta.type,
                  isBackground: true,
                  ...currentAsset.getAssetCloned().attribute,
                },
              ],
              pageTime,
              index: currentTemplateIndex + 1,
            });
          } else {
            addCopiedAsset(currentAsset.getAssetCloned(), {
              attribute: getNewAssetDuration(pageTime),
              meta: { trackId: createTrackId() },
            });
          }
        }
      },
    },
    {
      key: 'trim',
      tooltip: templateDisable ? '分割元素' : '分割片段',
      icon: 'iconfenge',
      disabled: assetDisable && templateDisable,
      onClick: split,
      disabledTip: '当前位置无法分割',
    },
    {
      key: 'delete',
      tooltip: '删除',
      icon: 'iconicons8_trash',
      disabled: !currentAsset,
      onClick: () => handleRemoveAsset(),
    },

    {
      key: 'lock',
      tooltip: '锁定',
      disabled: currentAsset ? currentAsset.meta.locked : true,
      icon: 'iconmdi_lock-outline',
      hidden: !currentAsset,
      onClick: () => setAssetEditStatus(currentAsset),
    },
    {
      key: 'hide',
      tooltip: currentAsset?.meta.hidden ? '显示元素' : '隐藏元素',
      // disabled: !currentAsset,
      hidden: !currentAsset,
      icon: currentAsset?.meta.hidden ? 'iconbiyanjing1' : 'iconyanjing',
      onClick: () => setAssetVisible(currentAsset),
    },

    {
      key: 'addTemplate',
      tooltip: '添加片段',
      icon: 'icontianjia',
      onClick() {
        addEmptyTemplate(
          DEFAULT_TEMPLATE_PAGE_TIME,
          getCurrentTemplateIndex() + 1,
        );
      },
    },
    {
      key: 'forward',
      tooltip: '片段前移',
      icon: 'iconfangxiang',
      iconStyle: {
        transform: 'rotate(180deg)',
        fontSize: 14,
      },
      onClick() {
        const index = getCurrentTemplateIndex();
        if (index > 0) {
          handleTemplateRearrange(index, index - 1);
        }
      },
    },
    {
      key: 'backward',
      tooltip: '片段后移',
      icon: 'iconfangxiang',
      iconStyle: {
        fontSize: 14,
      },
      onClick() {
        const index = getCurrentTemplateIndex();
        if (index < getAllTemplates().length - 1) {
          handleTemplateRearrange(index, index + 1);
        }
      },
    },
    {
      key: 'camera',
      name: '镜头',
      tooltip: '镜头',
      icon: 'jingtou-duijiao',
      disabled: false,
      choosed: inCamera,
      onClick: () => {
        start();
      },
      disabledTip: '',
    },
  ];

  return (
    <div className={classNames(styles.actions, styles['flex-box'])}>
      <div className={classNames(styles['actions-left'], styles['flex-box'])}>
        {actions.map(
          item => !item.hidden && <Item item={item} key={item.key} />,
        )}
        <SetAssetDuration />
        <SetAssetIsQuickEditor />
      </div>
      <div className={styles['actions-right']}>
        <TimeScaleHandler />
      </div>
    </div>
  );
}

export default observer(Handler);
