import Animation from '@/pages/Designer/Sider/AssetController/Animation';
import { SiderTabs } from '@/pages/Designer/Sider/components/SiderTabs';
import SiderTabPanel from '@/pages/Designer/Sider/components/SiderTabPanel';
import {
  useGetCurrentInfoByObserver,
  isModuleType,
  observer,
  useAniPathEffect,
} from '@hc/editor-core';
import TextBasic from './Basic';
import TextSignature from './Signature';
import Shadow from '../../AssetController/Shadow';

function TextTabs() {
  const { currentAsset } = useGetCurrentInfoByObserver();
  const { changStatue } = useAniPathEffect();
  return (
    <SiderTabs
      destroyInactiveTabPane
      onChange={(val: string) => {
        if (val !== 'animation') {
          // 设置路径动画展现状态
          changStatue(-1);
        }
      }}
    >
      <SiderTabPanel tab="基础" key="1">
        <TextBasic />
      </SiderTabPanel>
      <SiderTabPanel tab="特效" key="2">
        <TextSignature />
      </SiderTabPanel>
      {!isModuleType(currentAsset) && (
        <SiderTabPanel tab="动画" key="animation">
          <Animation />
        </SiderTabPanel>
      )}
      <SiderTabPanel tab="投影" key="3">
        <Shadow />
      </SiderTabPanel>
    </SiderTabs>
  );
}

export default observer(TextTabs);
