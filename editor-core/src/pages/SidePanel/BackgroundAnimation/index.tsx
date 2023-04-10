import SidePanelWrap from '@/components/SidePanelWrap';

import { useSettingPanelInfo } from '@/store/adapter/useGlobalStatus';
import List from './List';

import './index.less';

const BackgroundAnimation = () => {
  const { close } = useSettingPanelInfo();

  return (
    <SidePanelWrap
      header="背景动画"
      onCancel={close}
      wrapClassName="side-setting-panel"
    >
      <List />
    </SidePanelWrap>
  );
};

export default BackgroundAnimation;
