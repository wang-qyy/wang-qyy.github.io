import React, { CSSProperties, useMemo, useRef } from 'react';
import { observer } from 'mobx-react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import {
  getAssetStatus,
  getEditAsset,
  getMoveAsset,
  getCanvasInfo,
} from '@kernel/store';
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
import {
  useUpdateRotate,
  useUpdateSize,
} from '@kernel/Canvas/AssetOnTransform/hooks';
import { getCanvasClientRect } from '@kernel/utils/single';
import { isTempModuleType, isNonEditable } from '@/kernel';

const { unLRTB, whole, TB, LR } = ResizePointStatic;

const TransformHelper = observer(({ asset }: { asset: AssetClass }) => {
  const {
    attribute,
    meta,
    assetTransform,
    assetPositionScale,
    containerSizeScale,
    tempData,
  } = asset;
  const { rotate = 0 } = assetTransform;
  const moveAsset = getMoveAsset();
  const RotateUpdater = useUpdateRotate(asset);
  const SizeUpdater = useUpdateSize(asset);
  const { scale } = getCanvasInfo();

  function calcStyle(): CSSProperties {
    const { rt_style } = tempData;
    const size: CSSProperties = {};
    const transform: CSSProperties = {};
    if (rt_style) {
      const { width, height, posX, posY } = rt_style;
      size.width = width * scale;
      size.height = height * scale;
      transform.left = posX * scale;
      transform.top = posY * scale;
    }
    return {
      ...containerSizeScale,
      ...assetPositionScale,
      ...size,
      ...transform,
      opacity: 1,
    };
  }
  const style = calcStyle();

  // 初始数据缓存
  const originAsset = useRef<Asset>();

  const resizeItem = useMemo<ResizePoint[]>(() => {
    let nodes = unLRTB;
    switch (meta.type) {
      case 'background':
      case 'pic':
      case 'image':
      case 'mask':
      case 'SVG':
      case 'svgPath':
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
      // 恢复文字自动矫正尺寸
      asset.setTempData({
        rt_stopAutoCalc: false,
      });
    }
  }

  function onChangeStart(type: ChangeType) {
    if (type !== 'rotate') {
      const isScale = ResizePointStatic.unLRTB.includes(type);
      if (isScale) {
        // 停止文字自动矫正尺寸
        asset.setTempData({
          rt_stopAutoCalc: true,
        });
      }
      SizeUpdater.onStartMove();
    }
    // 记下当前图层信息
    originAsset.current = asset.getAssetCloned();
  }

  const loadingSize = useMemo(() => {
    let size = 12;
    if (style.width > style.height) {
      size = style.height * 0.6;
    } else {
      size = style.width * 0.6;
    }
    if (size > 60) {
      size = 60;
    }
    if (size < 12) {
      size = 12;
    }
    return Math.round(size);
  }, [style.width, style.height]);

  return asset.tempData.rt_loading ? (
    <div className="hc-asset-edit-loading" style={style}>
      <Spin
        spinning
        size="large"
        indicator={
          <LoadingOutlined
            style={{ fontSize: loadingSize, color: '#fff' }}
            spin
          />
        }
      >
        <div
          style={{
            width: style.width,
            height: style.height,
          }}
        />
      </Spin>
    </div>
  ) : (
    <Transformer
      nodes={resizeItem}
      style={style}
      rotate={tempData.rt_style?.rotate ?? rotate}
      getRect={getCanvasClientRect}
      locked={meta.locked}
      onChange={onChange}
      showPoints={!moveAsset}
      onChangeEnd={onChangeEnd}
      onChangeStart={onChangeStart}
    />
  );
});

function AssetOnTransform() {
  const editAsset = getEditAsset();
  const { inMask, inAniPath } = getAssetStatus();
  let show =
    editAsset &&
    !editAsset.tempData.rt_hideInCanvas &&
    !inMask &&
    !editAsset.attribute.rt_previewAeA &&
    inAniPath === -1 &&
    !isNonEditable(editAsset);
  if (editAsset && isTempModuleType(editAsset)) {
    show = !!editAsset?.assets.length;
  }
  return <>{show && <TransformHelper asset={editAsset!} />}</>;
}

export default observer(AssetOnTransform);
