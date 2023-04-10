import { MouseEvent, useState } from 'react';
import { useThrottleFn } from 'ahooks';
import { message } from 'antd';
import {
  AssetClass,
  setAssetVisible,
  assetBlur,
  pauseVideo,
  setEditAsset,
} from '@hc/editor-core';
import { stopPropagation } from '@/utils/single';
import { setAssetEditStatus, setAssetIntoView } from '@/utils/assetHandler';
import { useAssetReplaceModal } from '@/store/adapter/useGlobalStatus';

const useLayerItem = (asset: AssetClass) => {
  const { open: openAssetReplaceModal } = useAssetReplaceModal();
  const [textAsset, setTextAset] = useState<AssetClass>();
  const showLayerName = () => {
    let showTxt = '';
    switch (asset?.meta.type) {
      case 'text':
        (asset?.attribute?.text || []).forEach(item => {
          showTxt += item;
        });
        break;
      case 'video':
      case 'videoE':
        showTxt = '视频';
        if (asset?.meta.isOverlay) {
          showTxt = '视频特效';
        }
        break;
      case 'pic':
        showTxt = '图片';
        break;
      case 'image':
        showTxt = '图片';
        break;
      case 'SVG':
        showTxt = '矢量图';
        break;
      case 'lottie':
        showTxt = '角色';
        break;
      case 'mask':
        showTxt = '蒙版';
        break;
      case 'module':
        showTxt = '组合';
        break;

      case 'qrcode':
        showTxt = '二维码';
        break;
      default:
        showTxt = '不可修改';
    }
    if (asset?.meta?.isBackground) {
      showTxt = `背景${showTxt}`;
    }
    return showTxt;
  };
  // 锁定解锁元素
  const { run: clickLockFunction } = useThrottleFn(
    (text: string) => {
      setAssetEditStatus(asset);
      message.info(text);
      assetBlur();
    },
    { wait: 200 },
  );
  // 元素显隐
  const { run: clickSeeFunction } = useThrottleFn(
    (text: string) => {
      if (asset?.meta.locked) {
        message.info('请先解锁元素');
        return;
      }
      setAssetVisible(asset);
      message.info(text);
    },
    { wait: 200 },
  );
  // 单击元素
  const handleItemClick = (e: MouseEvent<HTMLDivElement>) => {
    stopPropagation(e);
    e.preventDefault();
    if (asset?.meta?.isBackground) {
      message.info('视频背景，不可选中！');
      return;
    }

    // 图层锁定时 可双击
    if (!asset?.meta.hidden) {
      pauseVideo();
      setAssetIntoView({ asset });
    }
  };
  // 双击元素
  const handleItemDoubleClick = (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
  ) => {
    e.stopPropagation();
    e.preventDefault();
    if (asset.meta.locked) {
      message.info('请先解锁元素');
      return;
    }
    if (asset.meta.type === 'text') {
      setTextAset(asset);
    } else if (asset.meta.isBackground) {
      openAssetReplaceModal('t_b_replace');
    } else {
      pauseVideo();
      setAssetIntoView({ asset });
      setEditAsset(asset);
    }
  };
  const clearTextAsset = () => {
    setTextAset(undefined);
  };
  return {
    textAsset,
    showLayerName,
    clickLockFunction,
    clickSeeFunction,
    clearTextAsset,
    handleItemClick,
    handleItemDoubleClick,
  };
};
export default useLayerItem;
