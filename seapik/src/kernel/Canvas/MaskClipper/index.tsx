import React, {
  CSSProperties,
  useRef,
  useEffect,
  useState,
  SyntheticEvent,
} from 'react';
import { observer } from 'mobx-react';
import {
  Asset,
  AssetClass,
  Coordinate,
  Position,
  RectLimit,
} from '@kernel/typing';
import Image from '@kernel/Components/Image';
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
  getRectCenter,
  getRectLimitCoordinate,
  rotatePoint,
} from '@kernel/utils/mouseHandler/reactHelper';
import { useGetClipInfo } from './hooks';
import MaskTransformHelper from './MaskTransform';
import './index.less';
import { useSetState } from 'ahooks';

type MaskType = 'origin' | 'preview';
const ImgDom = (props: {
  asset: AssetClass;
  style?: CSSProperties;
  src: string | undefined;
}) => {
  const { style, src, asset } = props;
  const { assets } = asset;
  // 翻转属性
  let transformCss = '';
  if (assets) {
    const { transform } = assets[0];
    transformCss = `scaleX(${transform.horizontalFlip ? -1 : 1}) scaleY(${
      transform.verticalFlip ? -1 : 1
    })`;
  }
  if (!style) {
    return (
      <Image
        draggable={false}
        src={src}
        style={{ transform: transformCss }}
        alt="裁剪"
      />
    );
  }
  return (
    <div
      style={{
        ...style,
        transform: transformCss,
      }}
    >
      <Image draggable={false} src={src} alt="裁剪" />
    </div>
  );
};
ImgDom.defaultProps = {
  style: undefined,
};
const MaskClipper = observer((props: { editAsset: AssetClass }) => {
  const { scale } = getCanvasInfo();
  const { editAsset } = props;
  const childAsset = editAsset.assets[0];
  // const { vSize, vScale, MaskContainer, clipPath } = useMaskHandler(editAsset);
  const { MaskContainer, originImageSrc, clipPath } = useGetClipInfo(editAsset);
  const style = buildGeneralStyleInHandler(editAsset);
  const originStyle = buildGeneralStyleInHandler(editAsset.assets[0]);
  const [childAbsolute, setChildAbsolute] = useState<Position>({
    left: 0,
    top: 0,
  });
  // 元素缩放状态
  const [state, setState] = useState({
    origin: false,
    preview: false,
  });

  function getChildAbsolute() {
    const { posY, posX } = calcChildAbsoluteByMask(editAsset, childAsset);
    return { left: posX * scale, top: posY * scale };
  }

  function autoSetter() {
    setChildAbsolute(getChildAbsolute());
  }

  const childAbsolutePos = getChildAbsolute();

  function moveImage(e: SyntheticEvent) {
    e.stopPropagation();
    const { left, top } = childAsset.assetPositionScale;
    const limit = getMaskAssetLimit(style, originStyle);

    let coordinate = {
      x: left,
      y: top,
    };
    const { rotate } = editAsset.transform;
    const childCenter = getAssetCenterScale(childAsset);
    if (hasRotate(editAsset)) {
      coordinate = rotatePoint(coordinate, childCenter, rotate);
    }
    mouseMoveDistance(
      (x: number, y: number) => {
        let pos = {
          x: coordinate.x + x,
          y: coordinate.y + y,
        };
        if (hasRotate(editAsset)) {
          pos = rotatePoint(pos, childCenter, -rotate);
        }
        const result = checkMaskAssetCrossBorder(pos, limit);
        childAsset.update({
          transform: {
            posY: result.y / scale,
            posX: result.x / scale,
          },
        });
      },
      () => {
        childAsset.setRtRelativeByParent();
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
      {clipPath && (
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
                <ImgDom
                  asset={editAsset}
                  src={originImageSrc}
                  style={{
                    ...originStyle,
                    position: 'absolute',
                  }}
                />
              </div>
            </div>
            {/* 原图部分 */}
            <div
              style={{
                ...originStyle,
                ...childAbsolutePos,
                zIndex: 2,
                position: 'absolute',
                transform: style.transform,
                cursor: 'move',
              }}
              onMouseDown={moveImage}
            >
              <div
                className="hc-AIC-origin-image"
                style={{
                  zIndex: 1,
                }}
              >
                <ImgDom src={originImageSrc} asset={editAsset} />
              </div>
            </div>
          </div>
          <MaskTransformHelper
            scaleStatus={state}
            childAsset={editAsset.assets[0]}
            maskAsset={editAsset}
            maskType="origin"
            onChangeStart={() => onChangeStart('origin')}
            onChangeEnd={() => onChangeEnd('origin')}
            childPositionCache={childAbsolute}
            childPosition={childAbsolutePos}
            getRect={getCanvasClientRect}
          />
          <MaskTransformHelper
            scaleStatus={state}
            childAsset={editAsset.assets[0]}
            maskAsset={editAsset}
            maskType="preview"
            onChangeStart={() => onChangeStart('preview')}
            onChangeEnd={() => onChangeEnd('preview')}
            childPositionCache={childAbsolute}
            childPosition={childAbsolutePos}
            getRect={getCanvasClientRect}
          />
        </>
      )}
    </>
  );
});

function MaskClipperWrapper() {
  const editAsset = getEditAsset();
  const { inMask } = getAssetStatus();

  return editAsset?.meta.type === 'mask' && inMask && editAsset.assets[0] ? (
    <MaskClipper editAsset={editAsset} />
  ) : (
    <></>
  );
}

export default observer(MaskClipperWrapper);
