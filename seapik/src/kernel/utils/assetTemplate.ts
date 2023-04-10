import { RawTemplateData, Meta, Asset, AssetType } from '@kernel/typing';

const getBaseMeta = (other: Partial<Meta> = {}) => {
  const meta = {
    locked: false,
    index: 0,
    name: '',
  };
  return Object.assign(meta, other);
};

const getBaseTransform = (other = {}) => {
  const transform = {
    posX: 0,
    posY: 0,
    flipX: false,
    flipY: false,
    rotate: 0,
  };
  return Object.assign(transform, other);
};

const getBaseAttribute = (other = {}) => {
  const attribute = {
    resId: '',
    picUrl: '',
    width: 0,
    height: 0,
    assetHeight: 0,
    assetWidth: 0,
    opacity: 100,
  };
  return Object.assign(attribute, other);
};

export const assetTemplate: { [key: AssetType]: Asset } = {
  SVG: {
    meta: getBaseMeta({ type: 'SVG' }),
    attribute: getBaseAttribute({ colors: {} }),
    transform: getBaseTransform(),
  },
  image: {
    meta: getBaseMeta({ type: 'image' }),
    attribute: getBaseAttribute(),
    transform: getBaseTransform(),
  },
  text: {
    meta: getBaseMeta({ type: 'text' }),

    attribute: {
      text: ['双击编辑文字'],
      fontSize: 24,
      fontWeight: 'normal',
      textAlign: 'center',
      width: 200,
      height: 50,
      opacity: 100,
      lineHeight: 13,
      letterSpacing: 0,
      writingMode: 'horizontal-tb',
      color: { r: 0, g: 0, b: 0, a: 1 },
    },
    transform: getBaseTransform(),
  },
  lottie: {
    meta: getBaseMeta({
      type: 'lottie',
    }),
    attribute: {
      // 唯一ID
      resId: 1,
      width: 662,
      height: 435,
      // 开始时间（单位ms）
      startTime: 0,
      // 结束时间（单位ms）
      endTime: 1000,
      loopTimes: 1,
      isLoop: true,
    },
    transform: getBaseTransform(),
  },

  module: {
    meta: getBaseMeta({ type: 'module' }),
    attribute: getBaseAttribute(),
    transform: getBaseTransform(),
  },
};

export function newTemplate(pageTime = 10000) {
  pageTime = Number(pageTime);
  const newData: RawTemplateData = {
    // 本地id，作为模板唯一标识使用
    // 模板id，空白模板不存在该数据
    poster: '',
    pageAttr: {
      backgroundColor: { r: 0, g: 0, b: 0, a: 0 },
      pageInfo: {
        gifInfo: undefined,
        pageTime,
        baseTime: pageTime,
        rt_preview_image: '',
        tid: '',
      },
    },
    assets: [],
  };
  return newData;
}

export function newAssetTemplate(type: Meta['type']) {
  return assetTemplate[type];
}
