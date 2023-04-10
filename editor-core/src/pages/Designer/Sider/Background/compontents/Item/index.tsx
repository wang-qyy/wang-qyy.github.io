import { SyntheticEvent } from 'react';
import { message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import classNames from 'classnames';

import {
  getTemplateIndexById,
  getCurrentTemplate,
  getAllAsset,
  addTemplateWithNewAsset,
  useSetTemplateBackgroundImage,
  observer,
} from '@hc/editor-core';
import MaterialAutoImg from '@/pages/Designer/Sider/components/MaterialItem/MaterialAutoImg';

import { DEFAULT_TEMPLATE_PAGE_TIME } from '@/config/basicVariable';

import { XiuIcon } from '@/components';

import { formatNumberToTime, stopPropagation } from '@/utils/single';
import { getBackgroundAssetSize } from '@/utils/assetHandler/assetUtils';

import {
  handleAddAsset as addAsset,
  handleReplaceAsset as replaceAsset,
} from '@/utils/assetHandler';

import Preview from '../../../components/Preview';

import styles from './index.modules.less';

export type ItemType = 'pic' | 'video' | 'background';

const Item = (props: { item: any; type: ItemType }) => {
  const { item, type } = props;
  const { value, update } = useSetTemplateBackgroundImage();

  const imageParams = {
    picUrl: item.big_preview,
    width: item.width,
    height: item.height,
    assetWidth: item.width,
    assetHeight: item.height,
    resId: item.id,
    startTime: 0,
    endTime: DEFAULT_TEMPLATE_PAGE_TIME,
  };
  const videoParams = {
    width: item.width,
    height: item.height,
    resId: item.id,
    rt_url: item.sample,
    rt_preview_url: item.preview,
    rt_frame_url: item.frame_file,
    rt_total_frame: item.total_frame,
    rt_total_time: item.duration,
    endTime: item.duration,
    startTime: 0,
  };

  const attribute = type === 'video' ? videoParams : imageParams;

  /**
   * 背景图片
   */
  function updateBackgroundImage() {
    update({
      resId: item.id,
      rt_imageUrl: item.big_preview,
      backgroundSize: { width: 1920, height: 1080 },
    });
  }

  // 添加
  const handleAddAsset = async (event: SyntheticEvent) => {
    stopPropagation(event);

    const currentTemplate = getCurrentTemplate();

    if (type === 'background') {
      updateBackgroundImage();
    } else if (currentTemplate.backgroundAsset) {
      // 添加一个带背景的片段
      addTemplateWithNewAsset({
        assets: [
          {
            type,
            isBackground: true,
            ...attribute,
            ...getBackgroundAssetSize(attribute),
          },
        ],
        pageTime: item.duration || DEFAULT_TEMPLATE_PAGE_TIME,
        index: getTemplateIndexById(getCurrentTemplate().id) + 1,
      });
    } else {
      const pageTime = currentTemplate.videoInfo.allAnimationTime;
      // setTemplateEndTime(item.duration || currentTemplate.videoInfo.endTime);
      if (type === 'video' && item.duration < pageTime) {
        message.info('视频时长过短，无法添加到当前片段');
        return;
      }
      attribute.endTime = pageTime;

      await addAsset({
        meta: { type, isBackground: true },
        attribute,
      });
    }
  };

  const backgroundAsset = getAllAsset().find(asset => asset.meta.isBackground);

  async function handleReplace(event: SyntheticEvent) {
    stopPropagation(event);
    const currentTemplate = getCurrentTemplate();

    if (type === 'background') {
      updateBackgroundImage();
    } else if (backgroundAsset) {
      const pageTime = currentTemplate.videoInfo.allAnimationTime;

      if (type === 'video' && item.duration < pageTime) {
        message.info('视频时长过短，无法替换当前背景');
        return;
      }

      Object.assign(backgroundAsset?.attribute, attribute);

      Object.assign(
        backgroundAsset?.attribute,
        getBackgroundAssetSize(attribute),
      );

      backgroundAsset.meta.type = type;
      if (Number(backgroundAsset.attribute.cst) > -1) {
        delete backgroundAsset.attribute.cst;
        delete backgroundAsset.attribute.cet;
      }

      attribute.endTime = pageTime;

      replaceAsset({
        params: { meta: { type }, attribute },
        asset: backgroundAsset,
      });

      // if (backgroundAsset?.template) {
      //   reconcileAssets(backgroundAsset.template);
      // }
      // autoCorrectionTime();
    }
  }

  return (
    <Preview
      type={type === 'video' ? 'video' : 'image'}
      src={type === 'video' ? item.preview_video : item.preview}
    >
      <div className={styles.item}>
        <MaterialAutoImg src={item.preview} />

        {type === 'video' && (
          <div className={styles.time}>
            {formatNumberToTime(parseInt(`${item.duration / 1000}`, 10))}
          </div>
        )}

        <div
          className={classNames(
            styles.itemButton,
            type === 'background' && value?.resId
              ? styles.itemButtonAdd
              : styles.itemButtonReplace,
          )}
          onClick={handleReplace}
          hidden={type === 'background' ? !value?.resId : !backgroundAsset}
        >
          <div className={styles.itemButtonAdd}>
            <XiuIcon type="iconexchange" />
          </div>
        </div>

        <div
          className={classNames(styles.itemButton, styles.itemButtonAdd)}
          onClick={handleAddAsset}
          hidden={type === 'background' && !!value?.resId}
        >
          <PlusOutlined />
        </div>
      </div>
    </Preview>
  );
};

export default observer(Item);
