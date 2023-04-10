import React, { useMemo, useRef } from 'react';
import {
  ResizePointStatic,
  ResizePoint,
} from '@kernel/Components/TransformPoints/handler';
import Transformer from '@kernel/Components/Transformer';

import { Asset, AssetClass } from '@/kernel/typing';
import {
  ChangeType,
  TransformerChangerParams,
} from '@kernel/Components/Transformer/typing';
import { getCanvasClientRect } from '@kernel/utils/single';
import { useUpdateRotate, useUpdateSize } from './hooks';

const { unLRTB, whole, TB, LR } = ResizePointStatic;

const StartTransformHelper = ({
  asset,
  calcSvgSize,
}: {
  asset: AssetClass;
  calcSvgSize: any;
}) => {
  const { attribute, transform, meta } = asset;
  const { rotate = 0 } = transform;
  const RotateUpdater = useUpdateRotate(asset);
  const SizeUpdater = useUpdateSize(asset, calcSvgSize);
  const resizeItem = useMemo<ResizePoint[]>(() => {
    let nodes = unLRTB;
    switch (meta.type) {
      case 'background':
      case 'pic':
      case 'image':
      case 'mask':
      case 'SVG':
        nodes = whole;
        break;
      case 'text':
        if (attribute?.writingMode === 'vertical-rl') {
          nodes = [...unLRTB, ...TB];
        } else {
          nodes = [...unLRTB, ...LR];
        }
        break;
      case 'video':
      case 'videoE':
      case 'module':
      case '__module':
        nodes = unLRTB;
        break;
    }
    if (meta.locked) {
      nodes = ['lock'];
    }
    return nodes;
  }, [meta.type, attribute.writingMode, meta.locked]);
  const style = {
    ...asset.assetSizeScale,
    ...asset.assetPositionScale,
  };
  // 初始数据缓存
  const originAsset = useRef<Asset>(null);
  function onChange(
    type: ChangeType,
    { style, rotate }: TransformerChangerParams,
  ) {
    if (rotate) {
      // 旋转吸附
      const tempRemainder = rotate % 90;
      if (tempRemainder >= 87 || tempRemainder <= 3) {
        rotate = Math.round(rotate / 90) * 90;
      }
      RotateUpdater.onMoving(rotate % 360);
    }
    if (style && originAsset.current) {
      // @ts-ignore
      const isScale = ResizePointStatic.unLRTB.includes(type);
      SizeUpdater.onMoving(style, originAsset.current, isScale);
    }
  }

  function onChangeEnd(
    type: ChangeType,
    { style, rotate }: TransformerChangerParams,
  ) {
    if (rotate) {
      RotateUpdater.onStopMove();
    }
    if (style) {
      SizeUpdater.onStopMove();
    }
  }

  function onChangeStart(type: ChangeType) {
    if (type !== 'rotate') {
      SizeUpdater.onStartMove();
    }
    asset.setTempData({
      rt_style: undefined,
    });
    originAsset.current = asset.getAssetCloned();
  }

  return (
    <Transformer
      nodes={resizeItem}
      style={style}
      rotate={rotate}
      getRect={getCanvasClientRect}
      locked={meta.locked}
      onChange={onChange}
      asset={asset}
      showPoints
      onChangeEnd={onChangeEnd}
      onChangeStart={onChangeStart}
    />
  );
};
export default StartTransformHelper;
