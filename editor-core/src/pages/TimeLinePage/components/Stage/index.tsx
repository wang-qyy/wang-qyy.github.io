import { useRef } from 'react';
import { observer } from 'mobx-react';
import { useSize } from 'ahooks';

import { getCanvasInfo } from '@/store/adapter/useTemplateInfo';
import ContextMenu from '@/pages/Content/Main/Canvas/ContextMenu';
import {
  Canvas,
  getCurrentAsset,
  getCurrentCamera,
  recordHistory,
} from '@hc/editor-core';
import { handleSave } from '@/utils/userSave';
import { useEditorLog } from '@/utils/webLog';

import styles from './index.less';
import CameraQuickAction from './CameraQuickAction';
// import { recordHistory } from '../../utils';

const padding = 40;

const TimeLinePage = () => {
  const wrapper = useRef(null);
  const size = useSize(wrapper);

  const stageSize = getCanvasInfo();

  const scale = Math.min(
    ((size?.width || stageSize.width) - padding * 2) / stageSize.width,
    ((size?.height || stageSize.height) - padding * 2) / stageSize.height,
  );

  const buried = useEditorLog();
  const currentCamera = getCurrentCamera();

  return (
    <div ref={wrapper} className={styles.canvas} style={{ padding }}>
      <div
        className={styles.stage}
        style={{
          width: stageSize.width * scale,
          height: stageSize.height * scale,
        }}
      >
        {/* 镜头的快捷操作 */}
        {currentCamera?.camera && (
          <CameraQuickAction currentCamera={currentCamera} />
        )}
        <ContextMenu classNameWrapper={styles.ContextMenu}>
          <Canvas
            onChange={(value, needSave) => {
              recordHistory();
              needSave && handleSave({ autoSave: true });
              const currentAsset = getCurrentAsset();
              buried(currentAsset, value);

              // recordLastAction.set({
              //   actionType: value,
              //   assetType: currentAsset?.meta.type,
              //   assetId: currentAsset?.meta.id,
              // });

              // recordHistory();
            }}
            canvasInfo={{
              width: stageSize.width,
              height: stageSize.height,
              scale,
            }}
          />
        </ContextMenu>
      </div>
    </div>
  );
};

export default observer(TimeLinePage);
