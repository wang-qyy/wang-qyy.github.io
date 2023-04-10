import { Asset, AssetClass, Attribute, Transform } from '@/kernel/typing';
import {
  assetHandler,
  getCanvasInfo,
  getAssetRtInfo,
  getModuleData,
  assetAbsoluteToRelative,
} from '@kernel/store';

import AssetItemState from '@kernel/store/assetHandler/asset';
import { getCurrentTemplate } from '@/kernel/store/assetHandler/adapter';
import { reportChange } from '@/kernel/utils/config';
import { addAssetClassInTemplate } from './AssetHandler';

export function addFontAsset() {}

export function addImageAsset() {}

export function addVideoEAsset() {}

export function addSVGAsset() {}

export function addLottieAsset() {}

export function AddImageParams() {}

function getNewModulePosition(size: { width: number; height: number }) {
  const { width = 0, height = 0 } = getCanvasInfo();

  return {
    posX: (width - size.width) / 2,
    posY: (height - size.height) / 2,
  };
}

interface AddModuleParams {
  assets: Asset[];
  resId: Attribute['resId'];
  width?: Attribute['width'];
  height?: Attribute['height'];
  moduleDuration: number;
  startTime: Attribute['startTime'];
  endTime: Attribute['endTime'];
  posX?: Transform['posX'];
  posY?: Transform['posY'];
}

export async function addModule(params: AddModuleParams) {
  const { assets, resId } = params;
  const { currentTemplate } = assetHandler;
  const assetClasses: AssetClass[] = [];
  await Promise.all(
    assets.map((item, index) =>
      getAssetRtInfo(item, true).then((res) => {
        assetClasses[index] = new AssetItemState(item);
      }),
    ),
  );

  const moduleClass = new AssetItemState(getModuleData());

  moduleClass.setChildren(assetClasses, false);

  moduleClass.setModuleStyleByChildren();

  moduleClass.assets.forEach((item) => {
    item.setParent(moduleClass);
    assetAbsoluteToRelative(moduleClass, item);
    item.setRtRelativeByParent();
  });

  const { width: canvasWidth = 0 } = getCanvasInfo();
  const maxWidth = canvasWidth - 60;

  let resize = {
    width: moduleClass.attribute.width,
    height: moduleClass.attribute.height,
  };

  // 组的原始尺寸大于画布尺寸 则对组进行缩放
  const sign = maxWidth < moduleClass.attribute.width;

  if (sign) {
    const moduleScale = maxWidth / moduleClass.attribute.width;
    resize = {
      width: maxWidth,
      height: moduleClass.attribute.height * moduleScale,
    };
  }

  moduleClass.update({
    transform: {
      zindex: currentTemplate.maxZIndex + 1,
    },
  });
  // 默认新增元素位置居中;
  const newPosition = getNewModulePosition(resize);

  // 更新尺寸
  moduleClass.update({
    attribute: {
      resId,
      ...resize,
    },
    transform: newPosition,
  });

  addAssetClassInTemplate(moduleClass, getCurrentTemplate());

  reportChange('addModule', true);

  return moduleClass;
}

/**
 * @description 创建一个元素实例
 * @param asset
 */
export function createAssetClass(asset: Asset) {
  return new AssetItemState(asset);
}
