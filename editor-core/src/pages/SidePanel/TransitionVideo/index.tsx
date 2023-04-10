import { Button, message } from 'antd';
import {
  removeMGTransfer,
  batchSetMGTransfer,
  getCurrentTemplate,
  getCurrentTemplateIndex,
  observer,
} from '@hc/editor-core';
import SidePanelWrap from '@/components/SidePanelWrap';
import { useSettingPanelInfo } from '@/store/adapter/useGlobalStatus';

import { clickActionWeblog } from '@/utils/webLog';
import styles from './index.modules.less';
import Basic from './Basic';
import OverlayTransition from './OverlayTransition';
import TransitionVideo from './TransitionVideo';
import { TRANSTION_ANIMATION_LIST } from './varible';
import { checkIsSelectedTransfer } from './handler';

/**
 * 转场视频
 */
function Transition() {
  const { setParams, close: closeSettingPanel } = useSettingPanelInfo();
  // 当前片段
  const currentTemplate = getCurrentTemplate();

  // 当前片段id
  const templateIndex = getCurrentTemplateIndex();
  // 取消转场
  const deleteTransform = () => {
    const transfer = currentTemplate?.endTransfer;
    if (transfer) {
      clickActionWeblog(`transition_delete`);
      removeMGTransfer(templateIndex, transfer?.meta.id);
    }
    closeSettingPanel();
  };
  // 同步到所有页面
  const batch = () => {
    clickActionWeblog('transition_applyall');
    batchSetMGTransfer(templateIndex);
  };
  const TransitionBottom = () => {
    if (!currentTemplate?.endTransfer) {
      return null;
    }
    return (
      <div
        className={styles.transitionBottom}
        onMouseDown={e => e.preventDefault()}
      >
        <Button onClick={batch}>同步到所有页面</Button>
        <Button onClick={deleteTransform}>取消转场</Button>
      </div>
    );
  };

  return (
    <SidePanelWrap
      wrapClassName="side-setting-panel"
      header="转场"
      onCancel={closeSettingPanel}
      bottom={<TransitionBottom />}
    >
      <div className={styles.transitionPanel}>
        {/* 基础动画转场 */}
        <Basic />
        {/* 遮罩转场 */}
        <OverlayTransition />
        {/* 视频MG转场 */}
        <TransitionVideo />
      </div>
    </SidePanelWrap>
  );
}
export default observer(Transition);
