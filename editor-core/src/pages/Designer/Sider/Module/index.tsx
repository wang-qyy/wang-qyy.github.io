import {
  useGetCurrentInfoByObserver,
  isModuleType,
  observer,
} from '@hc/editor-core';
import ModuleEdit from '@/pages/Designer/Sider/Module/ModuleEdit';
import SiderTabPanel from '@/pages/Designer/Sider/components/SiderTabPanel';
import { SiderTabs } from '@/pages/Designer/Sider/components/SiderTabs';
import Animation from '@/pages/Designer/Sider/AssetController/Animation';

const ModuleTab = () => {
  const { currentAsset } = useGetCurrentInfoByObserver();

  return (
    <SiderTabs>
      <SiderTabPanel tab="组合" key="1">
        <ModuleEdit />
      </SiderTabPanel>
      {isModuleType(currentAsset) && (
        <SiderTabPanel tab="动画" key="2">
          <Animation />
        </SiderTabPanel>
      )}
    </SiderTabs>
  );
};
export default observer(ModuleTab);
