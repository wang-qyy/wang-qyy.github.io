import { getAllTemplates, getLayerAssets } from '@/kernel';
import AssetItemState from '@/kernel/store/assetHandler/asset';
import TemplateState from '@/kernel/store/assetHandler/template';
import { sortBy } from 'lodash-es';
// 是否为可替换元素
export const checkCanReplace = (item: AssetItemState) => {
  const asset = item;
  const { type, isQuickEditor } = asset.meta;

  return (
    !['SVG', 'lottie', 'text'].includes(type) &&
    (isQuickEditor || type === 'module')
  );
};
const loopList = (assets: AssetItemState[]) => {
  const mediaList: AssetItemState[] = [];
  assets.forEach(item => {
    const asset = item;
    const { type } = asset.meta;
    if (!checkCanReplace(asset)) return;
    // 组元素 递归展开元素
    if (type === 'module') {
      const groups = loopList(asset.assets);
      mediaList.push(...groups);
      return;
    }
    mediaList.push(item);
  });

  return mediaList;
};

export const getVisibleAssets = (template?: TemplateState) => {
  const assets = getLayerAssets(template);
  // 根据时间-层级排序
  const assetsList = sortBy(
    [...assets],
    ['assetDuration.startTime', o => -o.transform.zindex],
  );
  return loopList(assetsList);
};
/**
 * 获取所有标记为可替换的元素
 */
export const getAllQuickeAssets = () => {
  const templates = getAllTemplates();
  const templatesAsset: Array<AssetItemState[]> = [];
  templates.forEach(item => {
    const assets = getVisibleAssets(item);
    return templatesAsset.push(assets);
  });
  return templatesAsset;
};
