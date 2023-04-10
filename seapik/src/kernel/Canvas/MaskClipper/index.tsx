import { CSSProperties, useEffect, useState, SyntheticEvent } from 'react';
import { observer } from 'mobx-react';
import { AssetClass, Position } from '@kernel/typing';
import Image from '@kernel/Components/Image';
import MaskTransformHelper from './MaskTransform';

import { getAssetStatus, getCanvasInfo, getEditAsset } from '@/kernel/store';
import { buildGeneralStyleInHandler } from '@kernel/utils/assetHelper/pub';
import { getCanvasClientRect } from '@kernel/utils/single';
import {
  calcChildAbsoluteByMask,
  checkMaskAssetCrossBorder,
  getMaskAssetLimit,
} from '@kernel/Canvas/MaskClipper/utils';
import { hasRotate } from '@/kernel/utils/assetChecker';
import { mouseMoveDistance } from '@kernel/Canvas/AssetOnMove/utils';
import {
  getAssetCenterScale,
  rotatePoint,
} from '@kernel/utils/mouseHandler/reactHelper';

import {
  coordinateToPosition,
  positionToCoordinate,
} from '@kernel/utils/mouseHandler/mouseHandlerHelper';

import { useGetClipInfo } from './hooks';
import './index.less';

type MaskType = 'origin' | 'preview';

const MaskClipper = observer((props: { editAsset: AssetClass }) => {
  const { scale } = getCanvasInfo();
  const { editAsset } = props;
  const childAsset = editAsset;

  const { MaskContainer, originImageSrc, clipPath } = useGetClipInfo(editAsset);
  const style = buildGeneralStyleInHandler(editAsset);

  // 原图样式
  const originStyle: CSSProperties = {
    ...editAsset.assetOriginSizeScale, //
    ...coordinateToPosition(editAsset.cropPositionScale), // position
    zIndex: editAsset.assetTransform.zIndex,
    opacity: editAsset.assetTransform.opacity,
    transform: `rotate(${editAsset.assetAbsolutePositionScale.rotate}deg)`,
  };

  const [childAbsolute, setChildAbsolute] = useState<Position>({
    left: 0,
    top: 0,
  });

  // 元素缩放状态
  const [state, setState] = useState({ origin: false, preview: false });

  /**
   * @description 计算原图相对画布尺寸
   */
  function getChildAbsolute() {
    if (editAsset.attribute.crop) {
      const { posY, posX } = calcChildAbsoluteByMask(
        editAsset,
        editAsset.attribute.crop,
      );

      return { left: posX * scale, top: posY * scale };
    }
    return editAsset.assetPositionScale;
  }

  function autoSetter() {
    console.log('autoSetter', { ...editAsset.attribute.crop?.position });

    setChildAbsolute(getChildAbsolute());
  }

  const childAbsolutePos = getChildAbsolute();

  function moveImage(e: SyntheticEvent) {
    e.stopPropagation();

    const limit = getMaskAssetLimit(style, originStyle);
    const { rotate } = editAsset.transform;

    const { left, top } = editAsset.assetPositionScale;

    let coordinate = { x: left, y: top };

    const assetCenter = getAssetCenterScale(
      editAsset.assetPositionScale,
      editAsset.assetSizeScale,
    );

    if (hasRotate(editAsset)) {
      coordinate = rotatePoint(coordinate, assetCenter, rotate);
    }

    mouseMoveDistance(
      (x: number, y: number) => {
        let pos = { x: coordinate.x + x, y: coordinate.y + y };
        if (hasRotate(editAsset)) {
          pos = rotatePoint(pos, assetCenter, -rotate);
        }

        const result = pos || checkMaskAssetCrossBorder(pos, limit);

        editAsset.update({
          // attribute: {
          //   crop: {
          //     position: {
          //       x: (childAbsolute.left - result.x) / scale,
          //       y: (childAbsolute.top - result.y) / scale,
          //     },
          //     size: editAsset.assetOriginSize,
          //   },
          // },
          transform: {
            posX: result.x / scale,
            posY: result.y / scale,
          },
        });
      },
      () => {
        autoSetter();
      },
    );
  }
  function onChangeEnd(type: MaskType) {
    autoSetter();
    setState({
      ...state,
      [type]: false,
    });
  }
  function onChangeStart(type: MaskType) {
    setState({
      ...state,
      [type]: true,
    });
  }
  useEffect(() => {
    autoSetter();
    childAsset.setRtRelativeByParent();
    return () => {
      childAsset.setRtRelativeByParent();
    };
  }, []);

  // 图片翻转属性
  const { transform } = editAsset;
  const transformCss = `scaleX(${transform.flipX ? -1 : 1}) scaleY(${
    transform.flipY ? -1 : 1
  })`;

  return (
    <>
      <div
        ref={MaskContainer}
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          left: 0,
          top: 0,
          zIndex: -1000000000,
        }}
      />
      {
        <>
          <div className="hc-asset-mask-clipper">
            {/* 预览图部分 */}
            <div
              style={{
                ...style,
                position: 'relative',
                zIndex: 3,
                overflow: 'hidden',
              }}
            >
              <div
                className="hc-AIC-preview-image"
                style={{ clipPath: `url(#${clipPath}` }}
                onMouseDown={moveImage}
              >
                <div
                  style={{
                    ...originStyle,
                    position: 'absolute',
                    transform: transformCss,
                  }}
                >
                  <Image draggable={false} src={originImageSrc} alt="裁剪" />
                </div>

                {/* 分割线 */}
                <div
                  className="hc-asset-mask-clipper-divider hc-asset-mask-clipper-divider-v"
                  style={{ left: '33%' }}
                />
                <div
                  className="hc-asset-mask-clipper-divider hc-asset-mask-clipper-divider-v"
                  style={{ left: '66%' }}
                />
                <div
                  className="hc-asset-mask-clipper-divider hc-asset-mask-clipper-divider-h"
                  style={{ top: '33%' }}
                />
                <div
                  className="hc-asset-mask-clipper-divider hc-asset-mask-clipper-divider-h"
                  style={{ top: '66%' }}
                />
              </div>
            </div>
            {/* 原图部分 */}
            <div
              aria-label="origin image"
              style={{
                ...originStyle,
                ...childAbsolutePos,
                zIndex: 2,
                position: 'absolute',
                transform: style.transform,
                cursor: 'move',
                pointerEvents: 'none',
              }}
              // TODO: 暂时只做背景裁剪 原图onMouseDown 阻止冒泡
              // onMouseDown={moveImage}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div className="hc-AIC-origin-image" style={{ zIndex: 1 }}>
                <Image
                  draggable={false}
                  src={originImageSrc}
                  style={{ transform: transformCss }}
                  alt="裁剪"
                />
              </div>
            </div>
          </div>

          {/* 背景元素裁剪不允许改变原图大小 */}
          {!editAsset.meta.isBackground && (
            <MaskTransformHelper
              scaleStatus={state}
              childAsset={childAsset}
              maskAsset={editAsset}
              maskType="origin"
              onChangeStart={() => onChangeStart('origin')}
              onChangeEnd={() => onChangeEnd('origin')}
              childPositionCache={childAbsolute}
              childPosition={childAbsolutePos}
              getRect={getCanvasClientRect}
            />
          )}
          <MaskTransformHelper
            scaleStatus={state}
            childAsset={childAsset}
            maskAsset={editAsset}
            maskType="preview"
            onChangeStart={() => onChangeStart('preview')}
            onChangeEnd={() => onChangeEnd('preview')}
            childPositionCache={childAbsolute}
            childPosition={childAbsolutePos}
            getRect={getCanvasClientRect}
          />
        </>
      }
    </>
  );
});

function MaskClipperWrapper() {
  const editAsset = getEditAsset();
  const { inMask } = getAssetStatus();

  // return editAsset?.meta.type === 'mask' && inMask && editAsset.assets[0] ? (
  //   <MaskClipper editAsset={editAsset} />
  // ) : (
  //   <></>
  // );

  return editAsset?.attribute.crop && inMask && !editAsset.meta.isBackground ? (
    <MaskClipper editAsset={editAsset} />
  ) : (
    <></>
  );
}

export default observer(MaskClipperWrapper);
