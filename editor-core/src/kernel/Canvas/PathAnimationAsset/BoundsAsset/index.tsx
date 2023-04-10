import React, {
  MouseEvent,
  CSSProperties,
  useEffect,
  useRef,
  useState,
} from 'react';
import { observer } from 'mobx-react';
import { AssetClass, PathBound } from '@/kernel/typing';
import { mouseMoveDistance } from '@/kernel/utils/single';
import { getCanvasInfo, useUpdateAssetStayEffect } from '@/kernel/store';
import ItemTransform from '../ItemTransform';
import StartEndAsset from '../StartEndAsset';
import { usePathAnimationAssetStyle } from '../hooks';

const BoundsAsset = (props: {
  asset: AssetClass;
  calcSvgSize: any;
  buildPathFreePath: any;
  canEdit: boolean;
  onEdit: () => void;
}) => {
  const { asset, calcSvgSize, canEdit, onEdit, buildPathFreePath } = props;
  const canvasInfo = getCanvasInfo();
  const { attribute } = asset;
  const { stayEffect } = attribute;
  const { graph } = stayEffect;
  const { toBounds = [], points = [] } = graph;
  const currentIndex = points.length - 1;
  const { updatePointByIndex } = useUpdateAssetStayEffect();
  const { itemPointAssetStyle, itemPointAssetScale } =
    usePathAnimationAssetStyle(asset, canvasInfo);
  // 整体的触发
  const wholeMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    asset?.setTempData({ rt_style: undefined });
  };
  // 整体的触发
  const wholeMouseUp = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };
  const handleMove = (e: MouseEvent<HTMLDivElement>, index: number) => {
    wholeMouseDown(e);
    if (asset && !asset.meta.locked) {
      const originAsset = asset.getAssetCloned();
      mouseMoveDistance(
        e,
        (distanceX: number, distanceY: number) => {
          const diffLeft = distanceX / canvasInfo.scale;
          const diffTop = distanceY / canvasInfo.scale;
          const svgSize = calcSvgSize();

          updatePointByIndex(
            diffLeft,
            diffTop,
            originAsset,
            currentIndex,
            svgSize,
          );
        },
        () => {
          wholeMouseUp(e);
        },
      );
    }
  };
  return (
    <>
      {toBounds.map((bound: PathBound, index: number) => {
        return (
          <React.Fragment key={index}>
            <StartEndAsset
              asset={asset}
              canvasInfo={canvasInfo}
              style={itemPointAssetStyle(bound)}
              scale={itemPointAssetScale(bound)}
              onMouseDown={e => {
                handleMove(e, index);
                e.stopPropagation();
              }}
              onClick={onEdit}
              prefix="point-end"
            />
            {canEdit && (
              <ItemTransform
                asset={asset}
                index={index}
                calcSvgSize={calcSvgSize}
              />
            )}
          </React.Fragment>
        );
      })}
    </>
  );
};

export default observer(BoundsAsset);
