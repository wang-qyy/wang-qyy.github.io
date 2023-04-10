import { Asset } from '@kernel/typing';
import { newId } from '@kernel/utils/idCreator';

import { getFontEffectId } from '@kernel/utils/StandardizedTools';
import {
  preGetAea,
  preGetFontEffect,
  preGetFontFamily,
  preGetLottie,
  preGetSvg,
} from '@kernel/store';
import { deepCloneJson } from '@kernel/utils/single';

export function asyncCompose(
  middlewares: Array<(params: any, next: any) => void>,
) {
  return function wrapMiddlewares(params: any, next: Function) {
    let index = -1;

    function dispatch(i: number) {
      if (i <= index) {
        return Promise.reject(
          new Error(
            'next() should not be called multiple times in one middleware!',
          ),
        );
      }
      index = i;
      const fn = middlewares[i] || next;
      if (!fn) return Promise.resolve();
      try {
        return Promise.resolve(fn(params, () => dispatch(i + 1)));
      } catch (err) {
        return Promise.reject(err);
      }
    }

    return dispatch(0);
  };
}

export function compose(ctx: any, middlewares: Array<(ctx: any) => void>) {
  middlewares.forEach((mid) => {
    mid(ctx);
  });
  return ctx;
}

interface AssetHelperType {
  asset: Asset;
  isInit: boolean;
  canvasScale: number;
  parentAsset?: Asset;
  pageTime?: number;
}

module AssetHelper {
  // 设置id
  const deepCloneAsset = (ctx: AssetHelperType) => {
    if (ctx.isInit) {
      ctx.asset = deepCloneJson(ctx.asset);
    }
  };
  // 设置id
  const setId = (ctx: AssetHelperType) => {
    if (ctx.isInit) {
      ctx.asset.meta.id = newId();
    }
  };

  const assetBaseDataLoad = (ctx: AssetHelperType) => {
    const { isInit, asset } = ctx;
    if (isInit) {
      const { meta, attribute } = asset;
      switch (meta.type) {
        case 'SVG':
          if (attribute.source_key && !attribute.rt_svgString) {
            preGetSvg(attribute.source_key);
          }
          break;
        case 'lottie':
          if (attribute.rt_url) {
            attribute.rt_lottieLoaded = false;
            preGetLottie(attribute.rt_url);
          }
          break;
        case 'text':
          if (attribute.fontFamily) {
            preGetFontFamily(attribute.fontFamily);
          } else {
            // 默认字体
            preGetFontFamily('fnsyhtRegular');
            attribute.fontFamily = 'fnsyhtRegular';
          }
          break;
        case 'pic':
        case 'background':
      }
    }
  };

  const assetEffectLoad = (ctx: AssetHelperType) => {
    const { isInit, asset } = ctx;
    if (isInit) {
      const { attribute } = asset;
      if (attribute.aeA) {
        Object.keys(attribute.aeA).forEach((key) => {
          // @ts-ignore
          const current = attribute.aeA[key];
          if (current.resId && !current.kw) {
            preGetAea(current.resId);
          }
          if (current.kw && typeof current.kw === 'string') {
            current.kw = JSON.parse(current.kw);
          }
        });
      }

      if (attribute.container?.source_key) {
        preGetSvg(attribute.container.source_key);
      }
      if (attribute.effect) {
        const id = getFontEffectId(attribute.effect);
        preGetFontEffect(id);
      }
    }
  };

  export const middlewares = [
    deepCloneAsset,
    assetBaseDataLoad,
    assetEffectLoad,
  ];
}

export const assetDataFormatMiddlewares = AssetHelper.middlewares;
