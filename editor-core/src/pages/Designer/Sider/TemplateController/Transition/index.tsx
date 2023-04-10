import {
  removeMGTransfer,
  batchSetMGTransfer,
  getCurrentTemplateIndex,
  useCurrentTemplate,
  observer,
} from '@hc/editor-core';

import { SiderTabs } from '@/pages/Designer/Sider/components/SiderTabs';
import SiderTabPanel from '@/pages/Designer/Sider/components/SiderTabPanel';

import './index.less';
import TransitionBasic from './TransitionBasic';
import TransitionList from './TransitionVideo';
import TransitionOverlay from './TransitionOverlay';

function Transfer() {
  const { template: currentTemplate } = useCurrentTemplate();
  const hasTransfer = currentTemplate.endTransfer;
  // 取消转场
  const deleteTransform = () => {
    const transfer = currentTemplate?.endTransfer;
    if (transfer) {
      removeMGTransfer(getCurrentTemplateIndex(), transfer?.meta.id);
    }
  };

  // 同步到所有页面
  const applyAll = () => {
    batchSetMGTransfer(getCurrentTemplateIndex());
  };

  return (
    <SiderTabs>
      <SiderTabPanel
        tab="转场"
        key="transition"
        className="designer-transition-panel"
      >
        <div className="designer-transition-Wrap">
          {/* 基础转场 */}
          <TransitionBasic />
          {/* 遮罩转场 */}
          <TransitionOverlay />
          {/* 视频转场 */}
          <TransitionList />
        </div>
        <div className="designer-transition-bottom" hidden={!hasTransfer}>
          <div className="transition-btn" onClick={applyAll}>
            同步到所有页面
          </div>
          <div className="transition-btn" onClick={deleteTransform}>
            取消转场
          </div>
        </div>
      </SiderTabPanel>
    </SiderTabs>
  );
}
export default observer(Transfer);
