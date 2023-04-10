import React, {
  MouseEvent,
  CSSProperties,
  useRef,
  useEffect,
  useState,
} from 'react';
import { observer } from 'mobx-react';
import './index.less';
import { config, reportChange } from '@/kernel/utils/config';
import { stopPropagation, mouseMoveDistance } from '@/kernel/utils/single';
import { getEditAsset } from '@/kernel/storeAPI';
import {
  getCanvasInfo,
  setAssetActiveHandler,
  useAniPathEffect,
  useUpdateAssetStayEffect,
} from '@/kernel/store';
import { getAssetCenterPoint } from '@/kernel/utils/mouseHandler/mouseHandlerHelper';
import classNames from 'classnames';
import { usePathAnimationAsset, usePathAnimationAssetStyle } from './hooks';
import StartEndAsset from './StartEndAsset';
import StartTransformHelper from './startTransform';
import BoundsAsset from './BoundsAsset';
import EditPathNode from './EditPathAnimation/index';

const EditPathAsset = observer(() => {
  const editAsset = getEditAsset();
  const assetCenterPoint = getAssetCenterPoint(editAsset);
  const canvasInfo = getCanvasInfo();
  const { scale } = canvasInfo;
  const { svgStyle, startNodeStyle } = usePathAnimationAssetStyle(
    editAsset,
    canvasInfo,
  );
  const { getSvgPath, buildPathFreePath } = usePathAnimationAsset(
    editAsset,
    canvasInfo,
  );
  const { changStatue } = useAniPathEffect();
  const { updateAnimationPosition, updatePointByIndex } =
    useUpdateAssetStayEffect();
  const originPosition = useRef(null);
  const [flag, setFlag] = useState(false);
  const svgOnDoubleClick = (e: Event) => {
    if (editAsset && !editAsset.meta.locked) {
      e.stopPropagation();
      changStatue(1);
    }
  };
  // 计算svg的尺寸位置信息 减中心点位的
  const calcSvgSize = () => {
    const svgPath = getSvgPath();
    if (svgPath && originPosition.current) {
      const size = svgPath.node.getBoundingClientRect();
      const svgSize = {
        width: size.width / scale,
        height: size.height / scale,
        x:
          (size.left - originPosition?.current?.left) / scale -
          assetCenterPoint.x,
        y:
          (size.top - originPosition?.current?.top) / scale -
          assetCenterPoint.y,
      };
      return svgSize;
    }
  };
  // 计算svg的尺寸位置信息  不减中心点位的
  const calcSvgSize2 = () => {
    const svgPath = getSvgPath();
    if (svgPath && originPosition.current) {
      const size = svgPath.node.getBoundingClientRect();
      const svgSize = {
        width: size.width / scale,
        height: size.height / scale,
        x: (size.left - originPosition?.current?.left) / scale,
        y: (size.top - originPosition?.current?.top) / scale,
      };
      return svgSize;
    }
  };
  // 整体的触发
  const wholeMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    editAsset?.setTempData({ rt_style: undefined });
  };
  // 整体的触发
  const wholeMouseUp = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };
  // 移动触发
  const handleMove = (e: MouseEvent<HTMLDivElement>) => {
    wholeMouseDown(e);
    if (editAsset && !editAsset.meta.locked) {
      const originAsset = editAsset.getAssetCloned();
      mouseMoveDistance(
        e,
        (distanceX: number, distanceY: number) => {
          const diffLeft = distanceX / scale;
          const diffTop = distanceY / scale;
          updateAnimationPosition(diffLeft, diffTop, originAsset);
        },
        () => {
          wholeMouseUp(e);
        },
      );
    }
  };
  const startHandleMove = (e: MouseEvent<HTMLDivElement>) => {
    wholeMouseDown(e);
    if (editAsset && !editAsset.meta.locked) {
      const originAsset = editAsset.getAssetCloned();
      mouseMoveDistance(
        e,
        (distanceX: number, distanceY: number) => {
          const diffLeft = distanceX / scale;
          const diffTop = distanceY / scale;
          const svgSize = calcSvgSize2(originAsset);
          updatePointByIndex(diffLeft, diffTop, originAsset, 0, svgSize);
          setFlag(!flag);
        },
        () => {
          wholeMouseUp(e);
        },
      );
    }
  };
  const assetDoubleClick = () => {
    if (
      editAsset &&
      !editAsset.meta.locked &&
      config.canUseTextEditor.includes(editAsset?.meta.type)
    ) {
      setAssetActiveHandler.setTextEditActive(editAsset);
      reportChange('setTextEditActive', false);
    }
  };
  useEffect(() => {
    const dom = document.getElementById('HC-CORE-EDITOR-CANVAS');
    if (dom) {
      originPosition.current = dom.getBoundingClientRect();
    }
  }, [scale]);
  const [show, setShow] = useState(false);
  const [edit, setEdit] = useState(false);
  return (
    <>
      <StartEndAsset
        asset={editAsset}
        canvasInfo={canvasInfo}
        style={startNodeStyle}
        onMouseDown={startHandleMove}
        onClick={() => {
          setShow(true);
          setEdit(false);
        }}
        onDoubleClick={assetDoubleClick}
        prefix="point-start"
        index={0}
      />
      {show && (
        <StartTransformHelper asset={editAsset} calcSvgSize={calcSvgSize2} />
      )}
      <div
        className={classNames('path-svg', {
          choosed: (svgStyle?.height ?? 0) < 1,
        })}
        style={svgStyle}
        id="path-svg"
        onMouseDown={handleMove}
        onDoubleClick={svgOnDoubleClick}
        onClick={() => {
          setShow(false);
          setEdit(false);
        }}
      />
      <EditPathNode
        editAsset={editAsset}
        canvasInfo={canvasInfo}
        calcSvgSize={calcSvgSize}
        flag={flag}
      />
      {editAsset?.attribute?.stayEffect && (
        <BoundsAsset
          asset={editAsset}
          calcSvgSize={calcSvgSize}
          canEdit={edit}
          onEdit={() => {
            setShow(false);
            setEdit(true);
          }}
        />
      )}
    </>
  );
});
const PathAnimationAsset = () => {
  const editAsset = getEditAsset();
  const { inAniPath } = useAniPathEffect();

  if (!editAsset?.attribute?.stayEffect?.graph || inAniPath !== 2) {
    return null;
  }
  const style: CSSProperties = {
    opacity: editAsset?.tempData?.rt_previewStayEffect === true ? 0 : 1,
  };
  return (
    <div
      className="hc-asset-path-mask"
      style={style}
      // onMouseDown={stopPropagation}
      onClick={stopPropagation}
      onDoubleClick={stopPropagation}
    >
      <EditPathAsset />
    </div>
  );
};
export default observer(PathAnimationAsset);
