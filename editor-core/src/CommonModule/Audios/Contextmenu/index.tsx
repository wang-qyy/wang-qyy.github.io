import classNames from 'classnames';
import { PropsWithChildren, useState } from 'react';
import { Dropdown, Menu } from 'antd';
import { observer } from '@hc/editor-core';
import { XiuIcon } from '@/components';

import {
  useSetActiveAudio,
  setVolumeController,
  setSpeedController,
} from '@/store/adapter/useAudioStatus';
import { KEY_PRESS_Tooltip } from '@/config/basicVariable';

import { useSetMusic } from '@/hooks/useSetMusic';

import getUrlParams from '@/utils/urlProps';
import { clickActionWeblog } from '@/utils/webLog';
import { useSplitAudio } from '@/utils/audioHandler';
import { stopPropagation } from '@/utils/single';

import { copyAndPasteAudio } from '../handler';

import './index.less';

function ContextMenu(
  props: PropsWithChildren<{
    overlayClassName?: string;
    theme?: 'light' | 'dark';
    trigger: ['click' | 'hover' | 'contextMenu'];
    visible?: boolean;
  }>,
) {
  const {
    children,
    overlayClassName,
    theme = 'light',
    trigger,
    visible: propsVisible,
  } = props;

  const [visible, setVisible] = useState(false);

  const { activeAudio, setActiveAudioInCliping } = useSetActiveAudio();
  const { bindRemoveAudio } = useSetMusic();

  const { disabled: disabledSplit, splitAudio } = useSplitAudio();

  function handleMenuClick({ key }) {
    setVisible(false);
    let actionType;
    switch (key) {
      case 'copy':
        copyAndPasteAudio();
        actionType = 'a_timeline_005';
        break;
      case 'split':
        actionType = 'a_timeline_009';
        splitAudio();
        break;
      case 'delete':
        bindRemoveAudio(activeAudio?.rt_id);
        actionType = 'a_timeline_006';
        break;
      case 'cut':
        setActiveAudioInCliping(activeAudio?.trackIndex);
        actionType = 'a_timeline_003';

        break;
      case 'voice':
        setVolumeController(true);
        actionType = 'a_timeline_004';
        break;
      case 'speed':
        setSpeedController(true);
        actionType = 'a_timeline_010';
        break;
    }

    clickActionWeblog(actionType);
  }

  const menuArr = [
    {
      key: 'cut',
      icon: 'iconjianji',
      name: '调整',
      iconStyle: { transform: 'rotate(90deg)' },
      hidden: getUrlParams().redirect === 'designer',
      disable: !activeAudio,
    },
    {
      key: 'split',
      icon: 'iconGroup',
      name: '分割',
      hidden: getUrlParams().redirect === 'designer',
      disable: disabledSplit || !activeAudio,
    },
    {
      key: 'voice',
      icon: 'iconbx_bx-volume-full',
      name: '音量',
      hidden: getUrlParams().redirect === 'designer',
      disable: !activeAudio,
    },
    {
      key: 'speed',
      icon: 'beisu',
      name: '倍速',
      hidden: getUrlParams().redirect === 'designer',
      disable: !activeAudio,
    },
    {
      key: 'copy',
      icon: 'iconic_baseline-content-copy',
      name: '复制音频',
      disable: !activeAudio,
      keyPress: KEY_PRESS_Tooltip.clone,
    },
    {
      key: 'delete',
      icon: 'iconicons8_trash',
      name: '删除',
      iconStyle: { fontSize: 18 },
      hidden: getUrlParams().redirect === 'designer',
      disable: !activeAudio,
      keyPress: KEY_PRESS_Tooltip.delete,
    },
  ];

  const menu = (
    <Menu
      onMouseDown={stopPropagation}
      onClick={handleMenuClick}
      className={classNames(
        'audio-context-menu',
        `audio-context-menu-${theme}`,
      )}
    >
      {menuArr.map(item => (
        <Menu.Item
          icon={
            <XiuIcon
              type={item.icon}
              style={{ fontSize: 16, ...item.iconStyle }}
            />
          }
          key={item.key}
          hidden={item.hidden}
          disabled={item.disable}
        >
          {item.name}
          <span className="audio-contextmenu-keypress">{item.keyPress}</span>
        </Menu.Item>
      ))}
    </Menu>
  );

  return (
    <Dropdown
      overlayClassName={classNames(
        'audio-context-overlay-dropdown',
        `audio-context-overlay-dropdown-${theme}`,
        overlayClassName,
      )}
      visible={propsVisible ?? visible}
      overlay={menu}
      trigger={trigger}
      onVisibleChange={v => {
        setVisible(v);
        if (v) {
          clickActionWeblog('audio_contextMenu');
        }
      }}
      getPopupContainer={() =>
        document.getElementById('xiudodo') as HTMLElement
      }
    >
      {children}
    </Dropdown>
  );
}
export default observer(ContextMenu);
