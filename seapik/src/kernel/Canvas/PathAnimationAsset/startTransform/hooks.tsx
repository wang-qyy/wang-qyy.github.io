import { Asset, AssetBaseSize, AssetClass, Position } from '@kernel/typing';
import { BaseSize } from '@kernel/utils/mouseHandler';
import {
  assetUpdater,
  getAssetStatus,
  getCanvasInfo,
  inTransforming,
  TransformUpdater,
} from '@kernel/store';
import { reportChange } from '@kernel/utils/config';
import { buildAttribute } from '@/kernel/store/assetHandler/utils';
import { deepCloneJson } from '@/kernel/utils/single';
import { getAssetCenterPoint } from '@/kernel/utils/mouseHandler/mouseHandlerHelper';

// 处理元素旋转
export function useUpdateRotate(editAsset: AssetClass) {
  function onMoving(rotate: number) {
    TransformUpdater.updateRotate(editAsset, rotate);
  }
  function onStopMove() {
    inTransforming(editAsset, false);
    reportChange('stopRotate', true);
  }

  return {
    onMoving,
    onStopMove,
  };
}
export function useUpdateSize(editAsset: AssetClass, calcSvgSize: any) {
  const { scale } = getCanvasInfo();
  const { inClipping } = getAssetStatus();
  function updater(
    size: AssetBaseSize,
    position: Position,
    originAsset: Asset,
    isSizeScale?: boolean,
  ) {
    if (inClipping) {
      if (editAsset) {
        TransformUpdater.fixContainerPosition(editAsset, {
          size,
          position,
          originAsset,
        });
      }
    } else {
      // 如果存在裁剪容器，则在更改元素宽高的同事，改变容器宽高
      if (editAsset?.attribute.container) {
        TransformUpdater.updateAssetContainerSize(editAsset, {
          size,
          position,
          originAsset,
        });
      } else {
        if (isSizeScale) {
          // addTag(true);
          TransformUpdater.updateSizeScale(editAsset, {
            size,
            position,
            originAsset,
          });
        } else {
          TransformUpdater.updateSize(editAsset, {
            size,
            position,
            originAsset,
          });
        }
      }
    }
    // 更新路径动画的svg尺寸信息
    if (originAsset?.attribute?.stayEffect?.graph) {
      const svgSize = calcSvgSize();
      const { points } = originAsset?.attribute?.stayEffect?.graph;

      const list = deepCloneJson(points);
      const oldCenterPoint = getAssetCenterPoint(originAsset);
      const newCenterPoint = {
        x: size.width / 2 + position.left,
        y: size.height / 2 + position.top,
      };
      const distance = {
        x: oldCenterPoint.x - newCenterPoint.x,
        y: oldCenterPoint.y - newCenterPoint.y,
      };

      // 更新其他节点信息
      list.forEach((element: number[], i: number) => {
        if (i !== 0) {
          element.forEach((item, j) => {
            if (j % 2 === 0) {
              // x
              item -= distance.x;
            } else {
              // y
              item -= distance.y;
            }
            element[j] = item;
          });
        }
        list[i] = element;
      });
      const assetCenter = getAssetCenterPoint(editAsset);
      svgSize.x -= assetCenter.x;
      svgSize.y -= assetCenter.y;
      assetUpdater(
        editAsset,
        buildAttribute({
          stayEffect: {
            ...editAsset?.attribute?.stayEffect,
            graph: {
              ...editAsset?.attribute?.stayEffect?.graph,
              ...svgSize,
              points: list,
            },
          },
        }),
      );
    }
  }

  function onMoving(
    style: BaseSize,
    originAsset: Asset,
    isSizeScale?: boolean,
  ) {
    const { width, height, left, top } = style;
    updater(
      {
        height: height / scale,
        width: width / scale,
      },
      {
        top: top / scale,
        left: left / scale,
      },
      originAsset,
      isSizeScale,
    );
  }
  function onStopMove() {
    // 该操作会将rt_itemScale重置为0
    inTransforming(editAsset, false);
    reportChange('stopMove', true);
  }

  function onStartMove() {
    inTransforming(editAsset, true);
  }

  return {
    onMoving,
    onStopMove,
    onStartMove,
  };
}
