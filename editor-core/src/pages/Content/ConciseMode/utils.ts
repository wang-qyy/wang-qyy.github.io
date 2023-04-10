import { getLayerAssets, getRealAsset, isTempModuleType } from '@/kernel';
import AssetItemState from '@/kernel/store/assetHandler/asset';
import TemplateState from '@/kernel/store/assetHandler/template';
import { sortBy } from 'lodash-es';

const loopList = (assets: AssetItemState[]) => {
  const mediaList: AssetItemState[] = [];
  const textList: AssetItemState[] = [];
  assets.forEach(item => {
    const asset = getRealAsset(item);
    const { type, isBackground } = asset.meta;

    // 需求 可以过滤一下：1、透明的视频元素（暂时无法判断）  2、svg格式图片 3、lottie动画  4、带背景属性的图片/视频
    if (['SVG', 'lottie'].includes(type) || isBackground) return;

    // 组元素 递归展开元素
    if (type === 'module') {
      const groups = loopList(asset.assets);
      mediaList.push(...groups.mediaList);
      textList.push(...groups.textList);
      return;
    }
    if (type === 'text') {
      textList.push(item);
      return;
    }
    mediaList.push(item);
  });

  return { mediaList, textList };
};

export const getVisibleAssets = (template?: TemplateState) => {
  const assets = getLayerAssets(template).filter(
    item => item.meta.isQuickEditor,
  );
  // 根据时间-层级排序
  const assetsList = sortBy(
    [...assets],
    ['assetDuration.startTime', o => -o.transform.zindex],
  );
  return loopList(assetsList);
};

// 是否为可替换元素
export const checkCanReplace = (item: AssetItemState) => {
  const asset =
    item?.meta?.type === 'mask' && item?.assets?.length ? item.assets[0] : item;
  const { type, isBackground } = asset.meta;
  const { meta } = asset;
  const unVisibility =
    !isTempModuleType(asset) && !meta.isTransfer && !meta.isLogo;
  return (
    unVisibility &&
    !['SVG', 'lottie', 'text', 'module'].includes(type) &&
    !isBackground
  );
};
