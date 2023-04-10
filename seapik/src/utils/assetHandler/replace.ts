import {
  Asset,
  replaceWholeAsset,
  getCurrentAsset,
  getCanvasInfo,
  isMaskType,
  AssetClass,
  setMaskAssetChildren,
} from '@/kernel';

import { MaskChildAssetType } from '@/kernel/utils/const';

import {
  assetToMask,
  formatChildSizeByMask,
} from '@/kernel/utils/assetHelper/formater/dataBuilder';

import {
  formatReplaceSize,
  getBackgroundAssetSize,
} from './handler/assetUtils';
import {
  getNewAssetTemplate,
  getNewAssetDuration,
  getNewAssetPosition,
  getNewAssetSize,
} from './handler/init';

/**
 * @description 把元素添加进蒙版的数据处理
 * @param currentAsset
 * @param asset
 */
function addAssetInMask(currentAsset: AssetClass, asset: Asset) {
  const { attribute, meta, transform } = asset;
  const size = formatChildSizeByMask(currentAsset, {
    width: attribute.width,
    height: attribute.height,
  });
  asset.attribute = {
    ...attribute,
    width: size.width,
    height: size.height,
  };
  // 修正蒙版子图层的位置
  const position = {
    posX: (currentAsset.attribute.width - size.width) / 2,
    posY: (currentAsset.attribute.height - size.height) / 2,
  };
  asset.transform = {
    ...transform,
    ...position,
  };
  setMaskAssetChildren(currentAsset, asset);
}

// 替换元素所需要继承的属性
const replaceInheritAttribute = (oldAsset: Asset) => {
  const { attribute } = oldAsset;

  const {
    resId,
    ufsId,
    SVGUrl,
    rt_url,
    cst,
    cet,
    source_key,
    rt_svgString,
    isUser,
    ...others
  } = attribute;

  return { ...others, colors: {} };
};

/**
 * @description 替换元素
 * */
export async function handleReplaceAsset(opts: {
  params: any;
  asset?: any;
  save?: boolean;
}) {
  const { params, asset, save = true } = opts;
  let currentAsset = getCurrentAsset();
  const canvasInfo = getCanvasInfo();
  let newAsset = asset ?? currentAsset;

  // 替换时，如果图片或视频没有裁剪，先自动裁剪一下  过滤掉背景以及组内元素
  if (
    newAsset &&
    MaskChildAssetType.includes(newAsset?.meta.type) &&
    !newAsset?.meta.isBackground &&
    !newAsset?.parent
  ) {
    newAsset = assetToMask(newAsset);
    currentAsset = newAsset;
  }

  // TODO 测试性代码，不确定是否可行，待讨论
  params.meta.replaced = true;
  params.attribute.originResId =
    newAsset?.attribute.originResId || newAsset?.attribute.resId;

  if (newAsset) {
    if (newAsset.meta.type === 'mask') {
      if (newAsset.assets?.length) {
        [newAsset] = newAsset.assets;
      } else {
        const assetParams = getNewAssetTemplate(params.meta.type) as Asset;
        Object.assign(assetParams.attribute, {
          ...params.attribute,
          assetWidth: params.attribute.width,
          assetHeight: params.attribute.height,
        });
        const size = getNewAssetSize(assetParams.attribute, assetParams.meta);
        Object.assign(assetParams.attribute, size);
        Object.assign(assetParams.meta, params.meta);
        Object.assign(assetParams.transform, params.attribute);

        // 往蒙版里面添加元素
        addAssetInMask(newAsset, assetParams);
        return;
      }
    }

    const { meta, attribute, transform } = newAsset;

    let { container } = attribute;

    // 需要继承的属性
    const inheritAttribute = replaceInheritAttribute(newAsset);
    let newSize = {};
    let newPosition = {};
    if (currentAsset) {
      // 如果存在裁剪，以裁剪尺寸为主
      newSize = formatReplaceSize(
        attribute?.container ?? attribute,
        params.attribute,
        canvasInfo,
        currentAsset,
      );
      // 修正蒙版子图层的方案
      if (isMaskType(currentAsset)) {
        newPosition.posX = (currentAsset.attribute.width - newSize.width) / 2;
        newPosition.posY = (currentAsset.attribute.height - newSize.height) / 2;
      }
    }
    // 如果newAsset为蒙版的子元素  需要调整尺寸以及位置信息----针对批量替换的处理
    if (newAsset.parent && isMaskType(newAsset.parent)) {
      newSize = formatReplaceSize(
        attribute,
        params.attribute,
        canvasInfo,
        newAsset.parent,
      );
      newPosition.posX = (newAsset.parent.attribute.width - newSize.width) / 2;
      newPosition.posY =
        (newAsset.parent.attribute.height - newSize.height) / 2;
    }

    // 如果存在裁剪，清空裁剪的位置信息，保证铺满整个裁剪框
    if (container) {
      container = { ...container, posX: 0, posY: 0 };
    }
    if (meta.isBackground) {
      newSize = getBackgroundAssetSize(params.attribute);
      newPosition = getNewAssetPosition(newSize);

      if (['video', 'videoE'].includes(params.meta.type)) {
        inheritAttribute.bgAnimation = undefined;
      }
    }
    const temp = {
      meta: { ...meta, ...params.meta, isUserAdd: true },
      attribute: {
        ...inheritAttribute,
        ...params.attribute,
        ...newSize,
        mattingInfo: undefined,
        container,
        cropXFrom: 0,
        cropXTo: 1,
        cropYFrom: 0,
        cropYTo: 1,
      },
      transform: {
        ...transform,
        ...params.transform,
        ...newPosition,
      },
    };
    const result = await replaceWholeAsset({
      data: temp,
      asset: newAsset,
      save,
    });

    return result;
  }
}
