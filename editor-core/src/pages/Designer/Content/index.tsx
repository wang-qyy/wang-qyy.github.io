import { useEffect, useRef } from 'react';
import { Modal, Tooltip } from 'antd';

import {
  getCurrentTemplate,
  getAllTemplates,
  assetBlur,
  useAllTemplateVideoTimeByObserver,
  initAudios,
  getVideoCurrentTime,
  observer,
  getCurrentAsset,
} from '@hc/editor-core';
import XiuIcon from '@/components/XiuIcon';

import CanvasScale from '@/pages/Content/Main/CanvasScale';

import { formatNumberToTime } from '@/utils/single';
import { clearTemplate, deleteTemplate } from '@/utils/templateHandler';
import useCanvasPlayHandler from '@/hooks/useCanvasPlayHandler';

import { useUpdateCanvasInfo } from '@/store/adapter/useTemplateInfo';

import Entrance from '@/pages/Designer/Content/Canvas/ReferenceLine/Entrance';
import { useInitCanvas } from '@/pages/Designer/hooks';

import Canvas from './Canvas';

import './index.less';

function DesignerContent() {
  const template = getCurrentTemplate();
  const currentAsset = getCurrentAsset();
  const [videoTotalTime] = useAllTemplateVideoTimeByObserver();

  const currentTime = getVideoCurrentTime();
  const { isPlaying, pauseVideo, playVideo } = useCanvasPlayHandler();
  const { value: canvas = { width: 0, height: 0 }, update: updateCanvasInfo } =
    useUpdateCanvasInfo();

  const canvasRef = useRef<HTMLDivElement>(null);

  // 初始化模板数据
  useInitCanvas();

  function toggleFullScreen() {
    if (!canvasRef.current?.fullscreenElement) {
      canvasRef.current?.requestFullscreen();
    } else {
      if (canvasRef.current?.exitFullscreen) {
        canvasRef.current?.exitFullscreen();
      }
    }
  }
  function clearCanvas(close: () => void) {
    if (template.id) {
      if (getAllTemplates().length > 1) {
        deleteTemplate(template);
      } else {
        clearTemplate(template);
        initAudios([]);
      }

      close();
      // setTimeout(() => {
      //   const maxTime = getAllTemplateVideoTime();
      //   if (currentTime > maxTime) {
      //     setCurrentTime(maxTime, false);
      //   }
      // }, 10);
    }
  }

  function clearModal() {
    Modal.confirm({
      title: '确定要清空画布吗',
      content: '清空画布，画布内的元素将全部清除！',
      okText: '确认',
      cancelText: '我再想想',
      onOk: clearCanvas,
    });
  }

  function changeCanvesSize(size: string) {
    switch (size) {
      case 'w':
        updateCanvasInfo({ width: 1920, height: 1080 });
        break;
      case 'h':
        updateCanvasInfo({ width: 1080, height: 1920 });
        break;
      case 'c':
        updateCanvasInfo({ width: 1080, height: 1080 });
        break;
      default:
    }
  }
  useEffect(() => {
    // 当选中元素时 暂停播放
    if (currentAsset) {
      pauseVideo();
    }
  }, [currentAsset]);

  return (
    <div
      className="xiudodo-designer-content"
      onMouseDown={() => {
        assetBlur();
      }}
    >
      <Canvas ref={canvasRef} />

      <div className="xiudodo-designer-canvas-detail">
        <div className="xiudodo-designer-canvas-detail-time">
          {formatNumberToTime(parseInt(`${(currentTime ?? 0) / 1000}`, 10))} |
          &nbsp;
          {formatNumberToTime(parseInt(`${videoTotalTime / 1000}`, 10))}
        </div>
        <div className="xiudodo-designer-canvas-detail-play">
          <XiuIcon
            className="xiudodo-designer-canvas-play-icon"
            type={isPlaying ? 'iconzanting' : 'iconbofang'}
            onClick={isPlaying ? pauseVideo : playVideo}
          />
        </div>
        <div className="xiudodo-designer-canvas-detail-right">
          {canvasRef.current && (
            <CanvasScale
              style={{ marginRight: 16 }}
              container={canvasRef.current}
              className="xdd-designer-scale-handler"
            />
          )}
          <Entrance />
          <Tooltip title="删除当前片段所有元素">
            <span
              className="xiudodo-designer-canvas-clear"
              onClick={clearModal}
            >
              清空画布
            </span>
          </Tooltip>
          <div
            className="xiudodo-designer-canvas-detail-scale"
            // onClick={() => changeCanvesSize('c')}
          >
            {
              {
                '1080*1920': '9:16',
                '1080*1080': '1:1',
                '1920*1080': '16:9',
                '1440*1080': '4:3',
              }[`${canvas.width}*${canvas.height}`]
            }
          </div>
          <XiuIcon
            onClick={toggleFullScreen}
            type="iconquanping"
            className="xiudodo-designer-canvas-detail-full-screen"
          />
        </div>
      </div>
    </div>
  );
}

export default observer(DesignerContent);
