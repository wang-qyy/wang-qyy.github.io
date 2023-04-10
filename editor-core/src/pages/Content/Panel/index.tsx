import SidePanel from '@/pages/SidePanel';
import XiuIcon from '@/components/XiuIcon';
import classNames from 'classnames';

import open from '@/assets/image/open_icon.png';
import {
  useLeftSideInfo,
  useSettingPanelInfo,
} from '@/store/adapter/useGlobalStatus';
import { clickActionWeblog } from '@/utils/webLog';

import SettingPanel from '../../SidePanel/SettingPanel';
import '../Aside/index.less';
import './index.less';

export default function Panel() {
  const {
    leftSideInfo: { sidePanelVisible },
    openSidePanel,
    closeSidePanel,
  } = useLeftSideInfo();
  const {
    value: { visible: settingPanelVisible },
  } = useSettingPanelInfo();

  function toggleExpand() {
    sidePanelVisible ? closeSidePanel() : openSidePanel();

    clickActionWeblog('side_controller');
  }
  return (
    <div
      className={classNames('xiudodo-aside-toolPanel', {
        'aside-expand': sidePanelVisible || settingPanelVisible,
      })}
    >
      <div className="panel-content-wrap">
        <SidePanel />
      </div>
      <div className="panel-content-wrap" hidden={!settingPanelVisible}>
        <SettingPanel />
      </div>

      <div
        className="xiudodo-toolPanel-controller"
        onClick={toggleExpand}
        hidden={settingPanelVisible}
      >
        <img src={open} alt="img" />
        <XiuIcon type="iconjiantouyou" style={{ zIndex: 1 }} />
      </div>
    </div>
  );
}
