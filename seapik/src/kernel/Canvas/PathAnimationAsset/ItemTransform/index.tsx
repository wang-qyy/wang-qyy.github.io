import React, { useMemo } from 'react';
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
import { getCanvasInfo } from '@/kernel/store';
import { usePathAnimationAssetStyle } from '../hooks';
import { useUpdateRotate, useUpdateSize } from './hooks';

const { unLRTB, whole, TB, LR } = ResizePointStatic;

const ItemTransform = ({
  asset,
  index,
  calcSvgSize,
}: {
  asset: AssetClass;
  index: number;
  calcSvgSize: any;
}) => {
  const { attribute, transform, meta } = asset;
  const canvasInfo = getCanvasInfo();
  const { rotate = 0 } = transform;
  const { stayEffect } = attribute;
  const { graph } = stayEffect;
  const { toBounds = [] } = graph;
  const RotateUpdater = useUpdateRotate(asset, index);
  const SizeUpdater = useUpdateSize(asset, index, calcSvgSize);
  const { itemPointAssetStyle } = usePathAnimationAssetStyle(asset, canvasInfo);
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
  // 初始数据缓存
  const originAsset = useMemo<Asset>(() => asset.getAssetCloned(), [asset]);

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
    if (style) {
      // @ts-ignore
      const isScale = ResizePointStatic.unLRTB.includes(type);
      SizeUpdater.onMoving(style, originAsset, isScale);
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
  }
  return (
    <Transformer
      nodes={resizeItem}
      style={itemPointAssetStyle(toBounds[index])}
      rotate={toBounds[index].rotate ?? rotate}
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
export default ItemTransform;
