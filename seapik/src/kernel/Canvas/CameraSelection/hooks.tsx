import {
  getCanvasInfo,
  getCurrentCamera,
  getCurrentTemplate,
  useGetVideoStatus,
} from '@/kernel/store';
import CameraState from '@/kernel/store/assetHandler/template/camera';
import { CSSProperties, useMemo, useRef } from 'react';

import { AssetBaseSize, Position, RectLimit } from '@kernel/typing';
import { BaseSize } from '@kernel/utils/mouseHandler';

import { useGetCanvasInfo } from '@kernel/store';
import { reportChange } from '@/kernel/utils/config';
import { ChangeType } from '@/kernel/Components/Transformer/typing';
import { calcMaxStyle, calcRectOverBorderMax } from '../MaskClipper/utils';

export const useCameraStyle = (currentCamera: CameraState) => {
  const { scale } = getCanvasInfo();
  const {
    width,
    height,
    posX,
    posY,
    scale: cameraScale,
  } = currentCamera.camera;
  const buildStyle: CSSProperties = useMemo(() => {
    return {
      width: width * scale,
      height: height * scale,
      left: posX * scale,
      top: posY * scale,
    };
  }, [width, height, posX, posY, scale]);
  const buildStyleScale: CSSProperties = useMemo(() => {
    return {
      width: width * scale * cameraScale,
      height: height * scale * cameraScale,
      left: posX * scale,
      top: posY * scale,
      transform: `scale(${1 / cameraScale})`,
      transformOrigin: 'left top',
    };
  }, [width, height, posX, posY, scale]);
  return { style: buildStyle, styleScale: buildStyleScale };
};
export const useCamera = (currentCamera: CameraState) => {
  const { cameras } = getCurrentTemplate();
  const { currentTime, playStatus } = useGetVideoStatus();
  const { style, styleScale } = useCameraStyle(currentCamera);
  const editCamera = getCurrentCamera();
  // 是否在手动播放状态下处于选中状态
  const isTimeChoosed = useMemo(() => {
    let sign = false;
    if (playStatus !== 1) {
      const currentIndex = cameras.findIndex(
        (item: CameraState) => item.id === currentCamera.id,
      );
      if (editCamera) {
        const editIndex = cameras.findIndex(
          (item: CameraState) => item.id === editCamera.id,
        );
        if (currentIndex === editIndex + 1) {
          sign = true;
        }
      } else if (currentIndex !== -1) {
        if (
          currentTime >= currentCamera.camera.startTime &&
          cameras[currentIndex + 1] &&
          currentTime <= cameras[currentIndex + 1].camera.startTime
        ) {
          sign = true;
        } else if (
          currentTime <= currentCamera.camera.startTime &&
          currentTime >= cameras[currentIndex - 1]?.camera.endTime
        ) {
          sign = true;
        } else if (
          currentTime <= currentCamera.camera.endTime &&
          currentTime >= currentCamera.camera.startTime
        ) {
          sign = true;
        }
      }
    }
    return sign;
  }, [currentTime, playStatus, editCamera]);
  return { isTimeChoosed, style, styleScale };
};
export function useCameraUpdateSize(currentCamera: CameraState) {
  const {
    scale,
    width: canvasWidth,
    height: canvasHeight,
  } = useGetCanvasInfo();

  const maxPoint = useRef<Partial<RectLimit>>({});
  function updater(
    size: AssetBaseSize,
    position: Position,
    isSizeScale: boolean,
    type: ChangeType,
  ) {
    if (isSizeScale) {
      // todo 旋转后缩放限制计算，会对元素整体产生规律性位移。
      const result = calcMaxStyle(
        {
          width: canvasWidth,
          height: canvasHeight,
          left: 0,
          top: 0,
        },
        {
          width: size.width,
          height: size.height,
          left: position.left,
          top: position.top,
        },
        type,
        maxPoint.current,
      );
      const sizeScale = canvasWidth / result.width;
      // 限制镜头缩放的
      if (sizeScale > 11.6) {
        return;
      }
      currentCamera.update({
        ...currentCamera.camera,
        width: result.width,
        height: result.height,
        posX: result.left,
        posY: result.top,
        scale: sizeScale,
      });
    }
  }

  function onUpdater(style: BaseSize, isSizeScale: boolean, type: ChangeType) {
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
      isSizeScale,
      type,
    );
  }

  function onStop(type: ChangeType) {
    reportChange('changeCameraTransform', true);
    maxPoint.current = {};
  }

  function onStart(type: ChangeType) {
    const max = calcRectOverBorderMax(
      {
        width: canvasWidth,
        height: canvasHeight,
        left: 0,
        top: 0,
      },
      {
        width: currentCamera.camera.width,
        height: currentCamera.camera.height,
        left: currentCamera.camera.posX,
        top: currentCamera.camera.posY,
      },
      type,
    );
    maxPoint.current = max;
  }

  return {
    onUpdater,
    onStop,
    onStart,
  };
}
