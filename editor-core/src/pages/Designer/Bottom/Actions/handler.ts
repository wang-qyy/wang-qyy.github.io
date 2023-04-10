import {
  AssetClass,
  TemplateClass,
  useVideoHandler,
  useGetTimeScale,
  getTemplateIndexById,
  useGetCurrentAsset,
  useCurrentTemplate,
  createAssetClass,
  addAssetClassInTemplate,
  createTemplateClass,
  addTemplateClass,
  isVideoAsset,
  isMaskType,
  calcAeATimeToPbr,
  AeA,
} from '@hc/editor-core';

import {
  TEMPLATE_MIN_DURATION,
  TEMPLATE_MIN_DURATION_TRANSFER,
  MAX_ANIMATION_PBR,
} from '@/config/basicVariable';

import { reportChange } from '@kernel/utils/config';

function getTemplateMinPageTime(transfer: AssetClass | undefined) {
  return transfer ? TEMPLATE_MIN_DURATION_TRANSFER : TEMPLATE_MIN_DURATION;
}

/**
 * @description 分割元素
 * @param time 相对于当前模板的时间
 * */
function assetSplit(asset: AssetClass, time: number) {
  const newAsset = createAssetClass(asset.getAssetCloned());

  const { startTime, endTime } = asset.assetDuration;

  newAsset.setAssetDuration([time - startTime, 0]);
  newAsset.updateAeaItem([{ key: 'i', data: { pbr: 1 } }]);

  asset.setAssetDuration([0, time - endTime]);
  asset.updateAeaItem([{ key: 'o', data: { pbr: 1 } }]);

  addAssetClassInTemplate(newAsset, asset.template);

  reportChange('splitAsset', true);
}

function calcAnimationPbr(
  aeaKey: keyof AeA,
  oldAsset: AssetClass,
  newAsset: AssetClass,
) {
  const animation = oldAsset.attribute.aeA;
  if (!animation) return 1;

  const animationTime = oldAsset.animationItemDuration[aeaKey];
  const oldAssetDuration =
    oldAsset.assetDuration.endTime - oldAsset.assetDuration.startTime;

  const newAssetDuration =
    newAsset.assetDuration.endTime - newAsset.assetDuration.startTime;

  const pbr = calcAeATimeToPbr(
    newAssetDuration * (animationTime / oldAssetDuration),
    animation[aeaKey].kw,
  );

  if (pbr > MAX_ANIMATION_PBR) return MAX_ANIMATION_PBR;

  return pbr;
}

/**
 * @description 分割片段
 * @param time 相对于当前模板的时间
 * @param 分割到元素上则前半段保留入场动画，后半段保留出场动画，驻场动画都保留
 * */
function templateSplit(template: TemplateClass, time: number) {
  const templateIndex = getTemplateIndexById(template.id);

  const { assets } = template;

  const newTemplate = createTemplateClass(template.getTemplateCloned());

  const newAssets: AssetClass[] = [];
  const newTemplateAssets: AssetClass[] = [];

  assets.forEach(item => {
    const { startTime, endTime } = item.assetDuration;

    if (endTime < time) {
      newAssets.push(item);
    } else {
      const i = item.attribute.aeA?.i;
      const o = item.attribute.aeA?.o;

      const newAsset = createAssetClass(item.getAssetCloned());

      const cloneAsset = createAssetClass(item.getAssetCloned());

      const targetAsset = isMaskType(newAsset) ? newAsset.assets[0] : newAsset;

      // 更新视频元素的裁剪参数
      if (isVideoAsset(targetAsset)) {
        const { cst, cet } = newAsset.videoClip;
        targetAsset.update({
          attribute: { cst: cst + (time - startTime), cet },
        });
      }

      newAsset.updateAssetDuration({
        startTime: Math.max(startTime - time, 0),
        endTime: endTime - time,
      });

      if (startTime < time) {
        const newAssetAea = [{ key: 'i', data: { pbr: 1 } }];

        if (o?.resId) {
          newAssetAea.push({
            key: 'o',
            data: { ...o, pbr: calcAnimationPbr('o', item, newAsset) },
          });
        }

        newAsset.updateAeaItem(newAssetAea);

        cloneAsset.setAssetDuration([0, time - endTime]);

        const newAea = [{ key: 'o', data: { pbr: 1 } }];

        if (i?.resId) {
          newAea.push({
            key: 'i',
            data: { ...i, pbr: calcAnimationPbr('i', item, cloneAsset) },
          });
        }

        cloneAsset.updateAeaItem(newAea);

        newAssets.push(cloneAsset);
      }

      newTemplateAssets.push(newAsset);
    }
  });

  newTemplate.replaceAssetClasses(newTemplateAssets);
  newTemplate.updatePageInfo({
    pageTime: template.videoInfo.endTime - time,
  });
  addTemplateClass(newTemplate, templateIndex + 1);

  template.replaceAssetClasses(newAssets);
  template.updatePageInfo({ pageTime: time });

  reportChange('templateSplit', true);
}

// 分割
export function useSplit() {
  const { currentTime } = useVideoHandler();
  const asset = useGetCurrentAsset();
  const timeScale = useGetTimeScale();

  const { template } = useCurrentTemplate();

  const targetTemplate = asset ? asset?.template : template;

  const templateIndex = targetTemplate
    ? getTemplateIndexById(targetTemplate.id)
    : 0;

  const [pageStart, pageEnd] = timeScale[templateIndex] ?? [];

  const relativeCurrentTime = currentTime - pageStart;

  // 禁止元素分割
  let assetDisable = true;
  if (asset && !asset.meta.isBackground && template.id === asset.template?.id) {
    const {
      assetDuration: { startTime, endTime },
      minAssetDuration,
    } = asset;

    assetDisable =
      relativeCurrentTime - startTime < minAssetDuration ||
      endTime - relativeCurrentTime < minAssetDuration;
  }

  // 禁止片段分割
  let templateDisable = false;
  if (asset) {
    if (!asset.meta.isBackground) {
      templateDisable = true;
    }
  } else if (template) {
    const { startTransfer, endTransfer } = template;
    templateDisable =
      relativeCurrentTime < getTemplateMinPageTime(startTransfer) ||
      pageEnd - currentTime < getTemplateMinPageTime(endTransfer);
  }

  function split() {
    if (!assetDisable) {
      if (asset) {
        assetSplit(asset, relativeCurrentTime);
      }
    } else if (!templateDisable) {
      templateSplit(template, relativeCurrentTime);
    }
  }

  return { assetDisable, templateDisable, split };
}
