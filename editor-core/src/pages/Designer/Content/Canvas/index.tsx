import { useEffect, forwardRef, Ref, useLayoutEffect } from 'react';
import classNames from 'classnames';

import {
  Canvas,
  getAllTemplates,
  useTemplateLoadByObserver,
  observer,
  recordHistory,
  getCurrentCamera,
} from '@hc/editor-core';
import { handleSave } from '@/utils/userSave';

import {
  useUpdateCanvasInfo,
  useCanvasScale,
  useTemplateLoadStatus,
} from '@/store/adapter/useTemplateInfo';
import { useDesignerReferenceLine } from '@/store/adapter/useGlobalStatus';

import DropDustbin from '@/components/DropDustbin';
import { useCanvasDrop } from '@/hooks/useCanvasDrop';
import { initCanvasScale } from '@/pages/Content/Main/CanvasScale/handler';

import ReferenceLine from './ReferenceLine';
import './index.less';
import CameraQuickAction from '../../Bottom/Cameras/CameraQuickAction';

const DesignerContent = (props: any, ref: Ref<HTMLDivElement>) => {
  const { onDrop, onHover } = useCanvasDrop();
  const { show } = useDesignerReferenceLine();

  const isLoaded = useTemplateLoadStatus();

  const { value: scale } = useCanvasScale();

  const { loadComplete } = useTemplateLoadByObserver();

  const { value: canvas } = useUpdateCanvasInfo();

  useEffect(() => {
    if (loadComplete && getAllTemplates().length) {
      // 模板加载结束后，储存当前状态，以便用户可以回退到最初操作记录
      recordHistory();
      // handleSave({ autoSave: true });
    }
  }, [loadComplete]);

  useLayoutEffect(() => {
    if (isLoaded && ref.current) {
      initCanvasScale(ref.current);
    }
  }, [isLoaded]);
  const currentCamera = getCurrentCamera();

  return (
    <div
      ref={ref}
      className={classNames('xiudodo-designer-canvas', {
        'xiudodo-designer-canvas-grid': show,
      })}
    >
      {/* 参考线 */}
      <ReferenceLine canvasInfo={{ ...canvas, scale }} />

      <DropDustbin
        onDrop={onDrop}
        onHover={onHover}
        className="xiudodo-designer-DropDustbin"
      >
        {/* <div
          style={{ width: canvas.width * scale, height: canvas.height * scale }}
        > */}
        {canvas && (
          <Canvas
            canvasInfo={{ ...canvas, scale }}
            onChange={(value: string, needSave: boolean) => {
              recordHistory();
              if (needSave) {
                handleSave({ autoSave: true });
              }
            }}
          />
        )}
        {/* 镜头的快捷操作 */}
        {currentCamera?.camera && (
          <CameraQuickAction currentCamera={currentCamera} />
        )}
        {/* </div> */}
      </DropDustbin>
    </div>
  );
};

export default observer(forwardRef(DesignerContent));
