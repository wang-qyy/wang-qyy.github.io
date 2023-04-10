import { useEffect, useRef } from 'react';
import classNames from 'classnames';
import { useUpdateEffect } from 'ahooks';
import { windowBeforeUnload, windowsLoading } from '@/utils/single';

import {
  Canvas,
  useTemplateLoadByObserver,
  getAllTemplates,
  getCurrentAsset,
  useBGMLoadingByObserver,
  recordHistory,
  observer,
  useMaskClipByObserver,
} from '@hc/editor-core';
import {
  useBackgroundControl,
  useAddSvgType,
  useTimelineMode,
} from '@/store/adapter/useGlobalStatus';

import getUrlProps from '@/utils/urlProps';

import { handleSave } from '@/utils/userSave';

import {
  templateFirstLoadTime,
  recordLastAction,
  templateLoadLog,
  useEditorLog,
} from '@/utils/webLog';
import DropDustbin from '@/components/DropDustbin';
import BackgroundController from './BackgroundController';

import Preview from './Poster';
import VipWatermark from './VipWatermark';

import ContextMenu from './ContextMenu';
import ReferenceLine from './ReferenceLine';
import { useCanvasScale, initCanvasScale } from '../CanvasScale/handler';

import { useCanvasDrop } from '../../../../hooks/useCanvasDrop';
import QuickActions from './QuickActions';
import SvgEditor from './SvgEditor';
import './index.less';

const CanvasBody = () => {
  const canvasRef = useRef<HTMLDivElement>(null);

  const { canvasInfo, isScroll, templateSize, scale } = useCanvasScale({
    container: document.querySelector('.xiudodo-main') as HTMLElement,
  });

  const { onDrop, onHover } = useCanvasDrop();
  const { timeLinePartKey } = useTimelineMode();
  const { addSvgType } = useAddSvgType();
  // 裁剪
  const { inMask } = useMaskClipByObserver();
  const { backgroundControl } = useBackgroundControl();
  const urlParams = getUrlProps();

  const { loadComplete } = useTemplateLoadByObserver();
  const { loading: BGMLoading } = useBGMLoadingByObserver();

  useEffect(() => {
    if (getAllTemplates().length && BGMLoading && loadComplete) {
      windowsLoading.closeWindowsLoading();
      const performance = window.__EDITOR_PERFORMANCE__;
      if (!performance.completed) {
        // 资源加载结束
        performance.user_resorce_post_end = new Date().getTime();
        performance.completed = true;
      }
      if (performance.completed && !performance.sended) {
        templateLoadLog(urlParams as any);
      }

      templateFirstLoadTime(urlParams.picId, urlParams.upicId);

      recordLastAction.set({ actionType: ' templateFirstLoad' });
      // updateCanvasScale('fit');
    } else {
      // windowsLoading.openWindowsLoading();
    }
  }, [BGMLoading, loadComplete]);

  useEffect(() => {
    if (loadComplete && getAllTemplates().length) {
      // 模板加载结束后，储存当前状态，以便用户可以回退到最初操作记录
      recordHistory();
      // handleSave({ autoSave: true });
    }
  }, [loadComplete]);

  // 模板尺寸发生变化时重置画布尺寸
  useUpdateEffect(() => {
    if (canvasRef.current) {
      initCanvasScale(canvasRef.current);
    }
  }, [templateSize.width, templateSize.height]);

  const buried = useEditorLog();

  if (timeLinePartKey) return null;

  return (
    <>
      <ReferenceLine canvasInfo={canvasInfo} />

      {
        // todo 由于drag事件冲突，考虑统一将画布替换逻辑转化为dnd
      }
      {/* <div
        ref={canvasRef}
        className={classNames('xiudodo-canvas', {
          // 'xiudd-canvas-horizontal-center': !isScroll.isScrollX,
          // 'xiudd-canvas-vertical-center': !isScroll.isScrollY,
        })}
        // 裁剪中 添加背景颜色
        style={{
          background: inMask ? 'rgba(0, 0, 0, 0.35)' : undefined,
          gridArea: 'canvas',
        }}
      > */}
      <DropDustbin
        className="xiudodo-canvas"
        style={{
          position: 'relative',
          width: '100%',
          zIndex: 1,
          background: inMask ? 'rgba(0, 0, 0, 0.35)' : undefined,
        }}
        onDrop={onDrop}
        onHover={onHover}
      >
        {canvasInfo && (
          <ContextMenu>
            <div>
              <Canvas
                onChange={(value: string, needSave: boolean) => {
                  const currentAsset = getCurrentAsset();
                  windowBeforeUnload.open();

                  recordLastAction.set({
                    actionType: value,
                    assetType: currentAsset?.meta.type,
                    assetId: currentAsset?.meta.id,
                  });

                  buried(currentAsset, value);
                  recordHistory();
                  if (needSave) {
                    handleSave({ autoSave: true });
                  }
                }}
                canvasInfo={{ ...templateSize, scale }}
              />
            </div>
          </ContextMenu>
        )}
        {/* <QuickActions /> */}
        {/* <VipWatermark /> */}
        {/* {addSvgType && <SvgEditor />} */}
        {/* {backgroundControl.inClipping && <BackgroundController />} */}
        {/* <Preview
          style={{
            ...templateSize,
            transform: `translate(-50%,-50%) scale(${scale})`,
            transformOrigin: 'center',
          }}
          className="xiudd-canvas-poster"
        /> */}
      </DropDustbin>

      <div
        className={classNames('xdd-expand-box', {
          'xdd-expand-box-centerX': !isScroll.isScrollX,
          'xdd-expand-box-centerY': !isScroll.isScrollY,
          'xdd-expand-box-center': !isScroll.isScrollX && !isScroll.isScrollY,
        })}
        style={{
          width: templateSize.width * scale,
          height: templateSize.height * scale,
        }}
      >
        <div style={{ pointerEvents: 'auto' }}>
          <QuickActions />
          <VipWatermark />
          {addSvgType && <SvgEditor />}
          {backgroundControl.inClipping && <BackgroundController />}
          <Preview
            style={{
              ...templateSize,
              transform: `scale(${scale})`,
              transformOrigin: 'left top',
            }}
            className="xiudd-canvas-poster"
          />
        </div>
      </div>

      {/* </div> */}
    </>
  );
};

export default observer(CanvasBody);
