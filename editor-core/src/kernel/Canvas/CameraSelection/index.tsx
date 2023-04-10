import {
  getAssetStatus,
  getCanvasInfo,
  getCurrentCamera,
  getCurrentTemplate,
  getManualPreview,
  useGetVideoStatus,
} from '@/kernel/store';
import { observer } from 'mobx-react';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ResizePointStatic } from '@kernel/Components/TransformPoints/handler';
import Transformer from '@kernel/Components/Transformer';

import { Camera } from '@/kernel/typing';
import {
  ChangeType,
  TransformerChangerParams,
} from '@kernel/Components/Transformer/typing';
import { mouseMoveDistance } from '@kernel/Canvas/AssetOnMove/utils';
import { getCanvasClientRect } from '@kernel/utils/single';
import CameraState from '@/kernel/store/assetHandler/template/camera';
import CameraItem from './CameraItem';
import { useCameraStyle, useCameraUpdateSize } from './hooks';

const { unLRTB } = ResizePointStatic;
const TransformHelper = observer(
  ({ currentCamera }: { currentCamera: CameraState }) => {
    const { style: calcStyle } = useCameraStyle(currentCamera);
    const { onUpdater, onStart, onStop } = useCameraUpdateSize(currentCamera);
    const resizeItem = unLRTB;
    // 初始数据缓存
    const originCamera = useRef<Camera>();

    function onChange(type: ChangeType, { style }: TransformerChangerParams) {
      if (style && originCamera.current) {
        // @ts-ignore
        const isScale = ResizePointStatic.unLRTB.includes(type);
        onUpdater(style, isScale, type);
      }
    }

    function onChangeEnd(type: ChangeType) {
      onStop(type);
      originCamera.current = currentCamera.getCameraCloned();
    }

    function onChangeStart(type: ChangeType) {
      if (currentCamera) {
        // 记下当前图层信息
        originCamera.current = currentCamera.getCameraCloned();
      }
      onStart(type);
    }

    return (
      <Transformer
        nodes={resizeItem}
        style={calcStyle}
        rotate={0}
        getRect={getCanvasClientRect}
        locked={false}
        onChange={onChange}
        showPoints
        rotatePoint={false}
        onChangeEnd={onChangeEnd}
        onChangeStart={onChangeStart}
        className="camera-transform"
      />
    );
  },
);
const MoveHelper = observer(() => {
  const { scale } = getCanvasInfo();
  const data = getCurrentCamera();
  // 初始数据缓存
  const originCamera = useRef<Camera>();
  const { style: calcStyle } = useCameraStyle(data);
  const removeEventListener = useRef<() => void>();
  useEffect(() => {
    if (data) {
      removeEventListener.current = mouseMoveDistance(
        (x: number, y: number) => {
          if (originCamera.current) {
            const { posX, posY } = originCamera.current;
            data.update({
              ...data.camera,
              posX: posX + x / scale,
              posY: posY + y / scale,
            });
            console.log('2==========', { x, y });
          }
        },
        () => {
          console.log('1==========');
        },
      );
    } else {
      removeEventListener.current?.();
    }
  }, [data]);
  useEffect(() => {}, [data]);
  return <div className="hc-asset-edit-move" style={calcStyle} />;
});
const CameraSelection = () => {
  const { inCamera } = getAssetStatus();
  const currentTemplate = getCurrentTemplate() ?? {};
  const videoStatus = useGetVideoStatus();
  const manualPreview = getManualPreview();
  const { cameras = [] } = currentTemplate;
  const currentCamera = getCurrentCamera();
  // 播放状态或者手动播放状态 都不显示
  const isPlaying = videoStatus.playStatus === 1 || manualPreview;
  if (!currentTemplate || isPlaying || !inCamera || cameras.length === 0) {
    return null;
  }
  return (
    <div className="hc-core-camera">
      {/* 展示的4个小角 */}

      <>
        <div className="hc-c-c-r-t" />
        <div className="hc-c-c-l-t" />
        <div className="hc-c-c-r-b" />
        <div className="hc-c-c-l-b" />
      </>

      {cameras.map((camera, index) => {
        return (
          <CameraItem
            key={camera.id}
            data={camera}
            index={index}
            template={currentTemplate}
          />
        );
      })}
      {currentCamera && <TransformHelper currentCamera={currentCamera} />}
    </div>
  );
};
export default observer(CameraSelection);
