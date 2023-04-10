import { Asset, AssetClass } from '@kernel/typing';
import { BaseSize } from '@kernel/utils/mouseHandler';
import { reportChange } from '@kernel/utils/config';
import {
  getAssetCenterPoint,
  getCenterPointFromSize,
} from '@/kernel/utils/mouseHandler/mouseHandlerHelper';
import { deepCloneJson } from '@/kernel/utils/single';
import { assetUpdater, getCanvasInfo } from '@/kernel/store';
import { buildAttribute } from '@/kernel/store/assetHandler/utils';

// 处理元素旋转
export function useUpdateRotate(asset: AssetClass, index: number) {
  const { scale } = getCanvasInfo();
  const { attribute } = asset;
  const { stayEffect } = attribute;
  const { graph } = stayEffect;
  const { toBounds = [] } = graph;
  function onMoving(rotate: number) {
    const bound = deepCloneJson(toBounds[index]);
    bound.rotate = rotate;
    assetUpdater(
      asset,
      buildAttribute({
        stayEffect: {
          ...stayEffect,
          graph: {
            ...graph,
            toBounds: [bound],
          },
        },
      }),
    );
  }
  function onStopMove() {
    reportChange('stopRotate', true);
  }

  return {
    onMoving,
    onStopMove,
  };
}

export function useUpdateSize(
  asset: AssetClass,
  index: number,
  calcSvgSize: any,
) {
  const { attribute } = asset;
  const { stayEffect } = attribute;
  const { graph } = stayEffect;
  const { toBounds = [], points, freePathType } = graph;
  const { scale } = getCanvasInfo();
  // 原点位置
  const origin = getAssetCenterPoint(asset);
  function onMoving(
    style: BaseSize,
    originAsset: Asset,
    isSizeScale?: boolean,
  ) {
    const bound = deepCloneJson(toBounds[index]);

    if (bound) {
      bound.width = style.width / scale;
      bound.height = style.height / scale;
      const centerN = getCenterPointFromSize(
        { left: style.left, top: style.top },
        { width: style.width, height: style.height },
      );
      const center = {
        x: centerN.x / scale - origin.x,
        y: centerN.y / scale - origin.y,
      };
      const list = [...points];
      const target = [...list[points.length - 1]];
      // 改变的是位置节点
      // 位置点修改
      const diff1 = target[2] - target[0];
      const diff2 = target[3] - target[1];
      target[0] = center.x - diff1;
      target[1] = center.y - diff2;

      const diff3 = target[2] - target[4];
      const diff4 = target[3] - target[5];
      target[4] = center.x - diff3;
      target[5] = center.y - diff4;

      target[2] = center.x;
      target[3] = center.y;
      list[points.length - 1] = target;

      const svgSize = calcSvgSize(list, freePathType);
      assetUpdater(
        asset,
        buildAttribute({
          stayEffect: {
            ...stayEffect,
            graph: {
              ...graph,
              toBounds: [bound],
              points: list,
              ...svgSize,
            },
          },
        }),
      );
    }
  }
  function onStopMove() {
    reportChange('stopMove', true);
  }

  function onStartMove() {
    asset.setTempData({
      rt_style: undefined,
    });
  }

  return {
    onMoving,
    onStopMove,
    onStartMove,
  };
}
