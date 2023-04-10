import { SyntheticEvent, useRef, useState, MouseEvent } from 'react';

import {
  useAllTemplateVideoTimeByObserver,
  assetBlur,
  observer,
  setCurrentTime,
  pauseVideo,
  useCameraByObeserver,
} from '@hc/editor-core';

import { mouseMoveDistance, stopPropagation } from '@/utils/single';
import { XiuIcon } from '@/components';
import { audioBlur } from '@/store/adapter/useAudioStatus';
import {
  setActiveMenu,
  setActiveOperationMenu,
} from '@/store/adapter/useDesigner';

import { useGetUnitWidth } from '@/pages/Content/Bottom/handler';
import Actions from './Actions';
import { TimeScale } from './TimeHandler';
import CustomDragLayer from './component/CustomDragLayer';
import { Audios } from './Audios';
import { calcPxToTime } from './handler';
import AuxiliaryLine from './AuxiliaryLine';
import CamerasMain from './Cameras/main';

import Assets from './Assets';

import './index.less';

function Bottom() {
  const unitWidth = useGetUnitWidth();
  const { inCamera } = useCameraByObeserver();
  const bottomRef = useRef<HTMLDivElement>(null);

  const [height, setHeight] = useState(250);

  function handleResize(event: SyntheticEvent) {
    stopPropagation(event);
    event.preventDefault();
    event.nativeEvent.preventDefault();
    mouseMoveDistance(event, (distanceX, distanceY) => {
      let newHeight = height - distanceY;

      if (newHeight < 1) {
        newHeight = 1;
      } else if (newHeight > 500) {
        newHeight = 500;
      }

      setHeight(newHeight);
    });
  }
  const [allTemplateVideoTime] = useAllTemplateVideoTimeByObserver();

  function handleSetCurrentTime(e: MouseEvent<HTMLDivElement>) {
    assetBlur();
    audioBlur();
    pauseVideo();
    setActiveOperationMenu('');

    if (allTemplateVideoTime <= 0) {
      return;
    }

    const assetsDom = document.querySelector('.designer-template');

    if (assetsDom) {
      const { x } = assetsDom.getBoundingClientRect();

      const click = e.clientX;

      let time = calcPxToTime(click - x, unitWidth);
      time = Math.max(time, 0);

      if (Number(time) > allTemplateVideoTime) {
        time = allTemplateVideoTime;
      }
      setCurrentTime(Math.round(time / 100) * 100, false);
    }
  }

  return (
    <div
      ref={bottomRef}
      className="xiudodo-designer-bottom"
      onContextMenu={e => e.preventDefault()}
    >
      {/* 调整时间轴高度 */}
      <div className="drag-handle" onMouseDown={handleResize} />
      <Actions />
      <div
        className="designer-bottom-layout"
        style={{ height }}
        onMouseDown={handleSetCurrentTime}
      >
        {/* 镜头列表 */}
        {inCamera && <CamerasMain />}

        {/* 当前时间 */}
        {/* <TimeLine /> */}
        {/* 对齐线 */}
        <AuxiliaryLine />
        <div className="designer-block">
          {inCamera && (
            <div className="designer-timeLine-label">
              <XiuIcon type="jingtou-duijiao" style={{ marginRight: 2 }} /> 镜头
            </div>
          )}
          <div className="designer-background-label">
            <XiuIcon type="iconshipin-copy" /> 背景
          </div>
        </div>
        {/* 刻度尺 */}
        <TimeScale />

        {/* 元素列表 */}
        <Assets />
        <div className="designer-audio-label">
          <div className="designer-audio-label-text">
            <XiuIcon type="iconyinle" /> 音乐
          </div>
        </div>
        <div className="designer-audios">
          <Audios
            contextmenuTheme="dark"
            empty={
              <div
                className="designer-audios-empty"
                onMouseDown={e => {
                  stopPropagation(e);
                  setActiveMenu('music');
                }}
              >
                点击添加音频
              </div>
            }
          />
        </div>
        {/* 拖拽预览 */}
        <CustomDragLayer />
      </div>
    </div>
  );
}

export default observer(Bottom);
