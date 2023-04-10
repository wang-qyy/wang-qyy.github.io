import {
  Asset,
  RawTemplateData,
  AssetClass,
  TemplateClass,
} from '@kernel/typing';
import { DEFAULT_SVG_STRING } from '@kernel/utils/assetHelper/const';
import {
  getRectCenter,
  rotatePoint,
} from '@kernel/utils/mouseHandler/reactHelper';
import { runInAction, toJS } from 'mobx';
import { assetHandler, getSvg } from '@/kernel/store';
import AssetItemState from '@/kernel/store/assetHandler/asset';
import { Size } from '../../mouseHandler';
import { replaceSvgModelPic } from '../../single';
import { isMaskType } from '../../assetChecker';
import { MaskChildAssetType } from '../../const';

export function buildPureAsset(assetClass: AssetClass): Asset {
  return assetClass.getAssetCloned();
}

export function buildPureAssets(assets: AssetClass[]) {
  return assets.map(buildPureAsset);
}

export function buildPureTemplates(templates: TemplateClass[]) {
  return templates.map((item) => {
    return item.getTemplateCloned();
  });
}

export function buildPureTemplatesWithRender(templates: TemplateClass[]) {
  return templates.map((item) => {
    return item.getTemplateClonedWithRender();
  });
}

export function formatRawTemplateData(data: RawTemplateData): RawTemplateData {
  const { pageAttr } = data;
  const { pageInfo } = pageAttr;
  const { pageTime = 0, baseTime } = pageInfo;

  return {
    ...data,
    pageAttr: {
      ...data.pageAttr,
      pageInfo: {
        ...pageInfo,
        gifInfo: undefined,
        pageTime,
        baseTime: baseTime || pageTime,
      },
      sound: {
        list: [],
      },
    },
    templateId: data.templateId,
    BGMIndex: 0,
  };
}

export function newMask(child: Asset): Asset {
  const { meta, transform, attribute } = child;
  const {
    width,
    height,
    container,
    startTime,
    endTime,
    aeA,
    kw,
    animation,
    stayEffect,
    dropShadow,
  } = attribute;
  const size = width > height ? height : width;
  const maskData = {
    meta: {
      locked: false,
      index: meta.index,
      name: '',
      group: '',
      type: 'mask',
      isQuickEditor: child.meta.isQuickEditor ?? false,
      isClip: false,
    },
    attribute: {
      width,
      height,
      startTime,
      endTime,
      aeA,
      kw,
      animation,
      stayEffect,
      dropShadow,
      assetHeight: 0,
      assetWidth: 0,
      opacity: 100,
      resId: '25653871',
      SVGUrl: '',
      source_key:
        'https://xiudodo.com/api/asset/25653871/923FCA8AC21565C9243124',
      rt_svgString: DEFAULT_SVG_STRING,
    },
    transform: {
      ...transform,
      horizontalFlip: false,
      verticalFlip: false,
    },
    assets: [],
  };
  if (container) {
    if (container.rt_svgString) {
      maskData.attribute.rt_svgString = container.rt_svgString;
    } else {
      runInAction(() => {
        let svgString = '';
        getSvg(container.source_key).then((res) => {
          svgString = res;
        });
        svgString = replaceSvgModelPic(svgString);
        maskData.attribute.rt_svgString = svgString;
      });
    }
    maskData.meta.isClip = true;
    maskData.attribute.source_key = container.source_key;
    maskData.attribute.resId = container.id;
    maskData.attribute.width = container.width;
    maskData.attribute.height = container.height;
  }
  /**
   * @description 旋转后需要重新定位裁剪的左上角点位
   */
  if (transform.rotate % 360 > 0) {
    const center = getRectCenter({
      width,
      height,
      left: transform.posX,
      top: transform.posY,
    });
    const maskCenter = getRectCenter({
      width,
      height,
      left: transform.posX,
      top: transform.posY,
    });
    const newAssetPoint = rotatePoint(
      {
        x: transform.posX,
        y: transform.posY,
      },
      center,
      transform.rotate,
    );
    const newCenterPoint = rotatePoint(maskCenter, center, transform.rotate);
    const newPos = rotatePoint(
      newAssetPoint,
      newCenterPoint,
      -transform.rotate,
    );
    maskData.transform.posX = newPos.x;
    maskData.transform.posY = newPos.y;
  }

  // @ts-ignore
  return maskData as Asset;
}

export function containerToMask(asset: Asset) {
  const mask = newMask(asset);

  const {
    posX: imageX = 0,
    posY: imageY = 0,
    width: clipW = 0,
    height: clipH = 0,
  } = asset.attribute.container || {};
  const { width: imageW = 0, height: imageH = 0 } = asset.attribute || {};
  const { horizontalFlip = false, verticalFlip = false } =
    asset.transform || {};

  let posX = imageX;
  let posY = imageY;

  if (horizontalFlip) {
    const gap = imageW - clipW - Math.abs(imageX);
    posX = -gap;
  }
  if (verticalFlip) {
    const gap = imageH - clipH - Math.abs(imageY);

    posY = -gap;
  }
  const newAsset = {
    ...asset,
    attribute: {
      ...asset.attribute,
      container: undefined,
      aeA: undefined,
      animation: undefined,
      kw: undefined,
    },
    transform: {
      ...asset.transform,
      posX,
      posY,
      rotate: 0,
    },
  };
  mask.assets = [newAsset];
  return mask;
}

// 根据蒙版图层的大小，计算出子图层的尺寸
export function formatChildSizeByMask(asset: AssetClass, size: Size) {
  const { width, height } = size;
  const { containerSize } = asset;
  const cScale = width / height;
  let setHeight = containerSize.width;
  let setWidth = containerSize.width;
  const setVal =
    containerSize.width > containerSize.height
      ? containerSize.width
      : containerSize.height;
  if (width >= height) {
    setHeight = setVal;
    setWidth = setVal * cScale;
  } else {
    setHeight = setVal / cScale;
    setWidth = setVal;
  }
  return { width: setWidth, height: setHeight };
}

/**
 * 兼容旧版蒙版（子图层相对于画布定位的）转换成新蒙版（子图层相对于蒙版定位）
 */
export function absoluteMaskToRelativeMask(asset: Asset) {
  if (asset && isMaskType(asset)) {
    const { assets = [], transform } = asset;
    if (assets?.length > 0) {
      const { transform: cTransform } = assets[0];
      if (cTransform.posX > 0 && cTransform.posY > 0) {
        Object.assign(assets[0].transform, {
          ...cTransform,
          posX: cTransform.posX - transform.posX,
          posY: cTransform.posY - transform.posY,
        });
      } else {
      }
    }
  }
  return asset;
}

function getMax(style: Size) {
  const { width, height } = style;
  if (width >= height) {
    return {
      type: 'width',
      value: width,
    };
  }
  return {
    type: 'height',
    value: height,
  };
}

/**
 * 根据旧尺寸计算出新尺寸的等比最大值
 * @param newSize
 * @param originSize
 * @param maxWidth
 * @param MaxHeight
 */
export function buildNewSizeByOrigin(
  newSize: Size,
  originSize: Size,
  maxWidth: number,
  MaxHeight: number,
  minWidth = 0,
  minHeight = 0,
) {
  const newMax = getMax(newSize);
  const originMax = getMax(originSize);
  const ratio = newSize.width / newSize.height;

  if (newMax.type === 'width') {
    newSize.width = originMax.value;
    newSize.height = originMax.value / ratio;
  } else {
    newSize.height = originMax.value;
    newSize.width = originMax.value * ratio;
  }
  if (newSize.height > MaxHeight) {
    newSize.height = MaxHeight;
    newSize.width = newSize.height * ratio;
  }
  if (newSize.width > maxWidth) {
    newSize.width = maxWidth;
    newSize.height = newSize.width / ratio;
  }
  if (newSize.height < minHeight) {
    newSize.height = minHeight;
    newSize.width = newSize.height * ratio;
  }
  if (newSize.width < minWidth) {
    newSize.width = minWidth;
    newSize.height = newSize.width / ratio;
  }
  return newSize;
}
/**
 * 图片视频元素转蒙版  过滤掉背景以及组内元素
 */
export function assetToMask(asset: AssetClass) {
  if (
    !MaskChildAssetType.includes(asset.meta.type) ||
    asset?.meta.isBackground ||
    asset?.parent
  ) {
    return asset;
  }
  const mask = newMask(asset.getAssetCloned());
  const maskClass = new AssetItemState({
    ...mask,
    assets: [],
  });
  asset.update({
    attribute: {
      aeA: undefined,
      animation: undefined,
      container: undefined,
    },
    transform: {
      posX: 0,
      posY: 0,
      rotate: 0,
    },
  });
  maskClass.update({
    meta: {
      isClip: true,
    },
  });
  maskClass.setChildren([asset]);
  asset.setRtRelativeByParent();
  asset.template?.removeAsset(asset.meta.id);
  asset.template?.addAssets([maskClass]);
  // assetHandler.currentTemplate.removeAsset(asset.meta.id);
  // assetHandler.currentTemplate.addAssets([maskClass]);
  assetHandler.setEditActive(maskClass);
  return maskClass;
}
