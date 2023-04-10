import { cloneDeep } from 'lodash-es';
import {
  getVerticalPosition,
  getHorizontalPosition,
  getNewAssetPosition,
} from '@/utils/assetHandler/init';

import { newAssetTemplate } from '@/kernel/utils/assetTemplate';
import {
  createAssetClass,
  addAssetClassInTemplate,
  AssetClass,
  activeEditableAsset,
  getCanvasInfo,
  Attribute,
  isModuleType,
} from '@/kernel';

import { assetAbsoluteToRelative, getAssetRtInfo } from '@/kernel/store';

import { TextItemInfo, TextPosition } from '@/mock/texts';
import { reportChange } from '@/kernel/utils/config';

function buildAssetSize(attribute: Attribute, sizeRatio?: number) {
  const sRatio = sizeRatio ?? 0.5;
  const canvasSize = getCanvasInfo();
  let { width, height, fontSize = 0 } = attribute;

  const ratio = width / height;

  width = canvasSize.width * sRatio;
  height = width / ratio;

  const maxHeight = canvasSize.height * sRatio;

  if (height > maxHeight) {
    height = maxHeight;
    width = height * ratio;
  }

  fontSize *= width / attribute.width;

  return {
    width,
    height,
    fontSize,
  };
}

function buildAsset(base: TextItemInfo) {
  //因为用了Object.assign 所以要深克隆一下
  const initAsset = cloneDeep(newAssetTemplate(base.meta.type));
  const { attribute, transform } = base;
  Object.assign(initAsset.attribute, attribute);
  Object.assign(initAsset.transform, transform);

  return initAsset;
}
export async function addText(
  info: TextItemInfo[],
  position?: TextPosition,
  sizeRatio?: number,
) {
  let asset;

  const assetClasses: AssetClass[] = [];

  await Promise.all(
    info.map((item, index) =>
      getAssetRtInfo(item, true).then((res) => {
        const assetClass = createAssetClass(buildAsset(item));
        assetClasses[index] = assetClass;
      }),
    ),
  );

  if (info.length > 1) {
    const moduleClass = createAssetClass(newAssetTemplate('module'));

    moduleClass.setChildren(assetClasses, false);
    moduleClass.setModuleStyleByChildren();

    moduleClass.assets.forEach((item) => {
      item.setParent(moduleClass);
      assetAbsoluteToRelative(moduleClass, item);
      item.setRtRelativeByParent();
    });

    asset = moduleClass;
  } else {
    asset = assetClasses[0];
  }

  if (asset) {
    let size = buildAssetSize(asset.attribute, sizeRatio);
    let transform = {};

    if (position) {
      const maxPosY = position.maxPosY
        ? getCanvasInfo().height * position.maxPosY
        : 999999;
      transform = {
        posX: Number(position.posX)
          ? position.posX
          : getHorizontalPosition(position.posX, size.width),
        posY: Number(position.posY)
          ? Math.min(position.posY, maxPosY)
          : getVerticalPosition(position.posY, size.height),
      };
    } else {
      transform = getNewAssetPosition(size);
    }

    asset.update({ transform, attribute: size });

    addAssetClassInTemplate(asset);
    if (isModuleType(asset)) {
      activeEditableAsset(asset.assets[0]);
    } else {
      activeEditableAsset(asset);
    }
  }
  reportChange('addText');
}
