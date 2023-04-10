import { memo, useRef, useMemo, PropsWithChildren } from 'react';
import { PreviewCanvas, togglePreviewVideoPlay } from '@hc/editor-core';
import classNames from 'classnames';
import { useKeyPress, useSize } from 'ahooks';

import VipWatermark from '@/pages/Content/Main/Canvas/VipWatermark';

import { useUpdateCanvasInfo } from '@/store/adapter/useTemplateInfo';
import { stopPropagation } from '@/utils/single';

import { clickActionWeblog } from '@/utils/webLog';
import VideoControls from './VideoControls';

declare const SceneTypes: ['default', 'douyin', 'shipinhao', 'kuaishou'];
export declare type PreviewVideoSceneType = typeof SceneTypes[number];

declare const SizeTypes: ['default', 'small', 'large'];
export declare type PreviewVideoSize = typeof SizeTypes[number];

// 缩放比例基数
const scaleBase = 0;
const maxWidthPercent = 1;
interface SizeType {
  width: number;
  height: number;
}
function getScale(templateSize: SizeType, mainSize: SizeType) {
  // 根据基础缩放比例计算出实际展示的高
  const height = mainSize.height - scaleBase;
  // 根据实际高度计算出缩放比值
  const scale = height / templateSize.height;
  // 如果此缩放值下的宽度大于宽度限制
  const width = templateSize.width * scale;
  // 则比例以当前视口下的最大宽度为准
  const maxWidth = mainSize.width * maxWidthPercent;
  if (width > maxWidth) {
    return maxWidth / templateSize.width;
  }
  return (Math.floor(scale * 100) / 100).toFixed(2);
}

interface PreviewVideoProps {
  className?: string;
  previewWhole?: boolean;
  scene?: PreviewVideoSceneType;
  controls?: boolean;
  spaceControl?: boolean;
  watermark?: boolean;
}

const PreviewVideo = ({
  className,
  previewWhole,
  scene,
  controls,
  spaceControl = true,
  watermark = false,
}: PropsWithChildren<PreviewVideoProps>) => {
  const { value: canvas } = useUpdateCanvasInfo();

  const previewVideoRef = useRef<HTMLDivElement>(null);
  const size = useSize(previewVideoRef);

  useKeyPress(['space'], e => {
    e.stopPropagation();
    clickActionWeblog('keyPress_playPreviewVideo');
    if (spaceControl) {
      togglePreviewVideoPlay();
    }
  });

  const canvasScale = useMemo(() => {
    const { height: h, width: w } = canvas as {
      width: number;
      height: number;
    };

    let scale = 1;

    if (size.width && h && w) {
      scale = getScale({ height: h, width: w }, size as SizeType);
    }

    return { scale };
  }, [canvas, size]);

  return (
    <div
      className={classNames('preview-video-wrap', className, scene, {
        'preview-scene': scene,
      })}
      ref={previewVideoRef}
      onKeyDown={e => stopPropagation(e)}
    >
      <div className="preview-video">
        {/* <VipWatermark showDesc={false} /> */}
        <div
          hidden={!watermark}
          className="preview-watermark"
          style={{ ...canvas, transform: `scale(${canvasScale.scale})` }}
        />

        <PreviewCanvas
          canvasInfo={{ ...canvasScale, ...canvas }}
          previewWhole={previewWhole}
        />
        {controls && (
          <div
            style={{
              position: 'absolute',
              width: '100%',
              zIndex: 90000,
              bottom: 0,
              padding: '25px 0 10px',
              background:
                'linear-gradient(to top,rgba(0,0,0,0.2),rgba(0,0,0,0))',
            }}
          >
            <VideoControls />
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * @description 使用组件需在不展示时卸载此组件
 * @props watermark 是否显示水印
 * */
export default memo(PreviewVideo);
