import { useEffect } from 'react';
import { getAllTemplates, getCurrentTemplate, getLayerAssets } from '@/kernel';
import { autorun } from 'mobx';
import AssetItemState from '@/kernel/store/assetHandler/asset';
import conciseModeStore, { ResAssets } from '../store';
import { getVisibleAssets } from '../utils';

// 组件初次加载时，默认选中第一个片段
export const useSetTemplateIndex = () => {
  const templates = getAllTemplates();
  const currentTemplate = getCurrentTemplate();
  const { setTemplateIndex } = conciseModeStore;
  useEffect(() => {
    currentTemplate &&
      setTemplateIndex(templates.findIndex(t => t.id === currentTemplate.id));
    return () => {
      setTemplateIndex(0);
    };
  }, [currentTemplate, templates]);
};

const isSame = (
  resAsset: ResAssets,
  asset: AssetItemState,
  offsetTime: number,
) => {
  const {
    attribute: { width, height, resId, startTime },
    transform: { posX, posY },
  } = asset;
  // 位置相同，且前后两个片段之间衔接
  return (
    `${resAsset.resId}-${resAsset.posX}-${resAsset.posY}-${resAsset.width}-${resAsset.height}` ===
      `${resId}-${posX}-${posY}-${width}-${height}` &&
    Math.abs(offsetTime + startTime - resAsset.endTime) < 100
  );
};

// 把位置大小相同，且前后两个片段之间衔接距离不超过100毫秒的元素 合并为同一个元素
export const useFormatResAssets = () => {
  useEffect(() => {
    const dispose = autorun(() => {
      const resAssets: ResAssets[] = [];
      const templates = getAllTemplates();
      const { initResAssets, loading } = conciseModeStore;

      if (loading) return;
      let offsetTime = 0;

      templates.forEach(temp => {
        const { mediaList } = getVisibleAssets(temp);
        mediaList.forEach(item => {
          const asset =
            item?.meta?.type === 'mask' && item?.assets?.length
              ? item.assets[0]
              : item;
          const {
            attribute: { resId, endTime, width, height },
            transform: { posX, posY },
            meta: { replaced },
          } = asset;
          const currentResAssets = resAssets.find(resAsset => {
            return isSame(resAsset, asset, offsetTime);
          });

          if (currentResAssets) {
            currentResAssets.endTime = offsetTime + endTime;
            currentResAssets.assets.push(asset);
          } else {
            resAssets.push({
              resId: resId as string,
              width,
              height,
              posX,
              posY,
              replaced: !!replaced,
              endTime: offsetTime + endTime,
              assets: [asset],
            });
          }
        });
        offsetTime += temp.videoInfo.endTime;
      });
      initResAssets(resAssets);
    });
    return dispose;
  }, []);
};
