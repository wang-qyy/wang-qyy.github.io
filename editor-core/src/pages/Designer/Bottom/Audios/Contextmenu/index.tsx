import classNames from 'classnames';
import { PropsWithChildren } from 'react';
import { Dropdown, Menu } from 'antd';
import { observer } from '@hc/editor-core';
import { XiuIcon } from '@/components';

import {
  useSetActiveAudio,
  setVolumeController,
} from '@/store/adapter/useAudioStatus';

import { useSetMusic } from '@/hooks/useSetMusic';
import { stopPropagation } from '@/utils/single';
import getUrlParams from '@/utils/urlProps';
import { clickActionWeblog } from '@/utils/webLog';

import { copyAndPasteAudio } from '@/CommonModule/Audios/handler';

import './index.less';

function ContextMenu({
  children,
  overlayClassName,
  theme = 'light',
  trigger,
}: PropsWithChildren<{
  overlayClassName?: string;
  theme?: 'light' | 'dark';
  trigger: ['click' | 'hover' | 'contextMenu'];
}>) {
  const { activeAudio, setActiveAudioInCliping } = useSetActiveAudio();
  const { bindRemoveAudio } = useSetMusic();
  function handleMenuClick({ key, domEvent }) {
    stopPropagation(domEvent);
    let actionType;
    switch (key) {
      case 'copy':
        copyAndPasteAudio();
        actionType = 'a_timeline_005';
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
    }

    clickActionWeblog(actionType);
  }

  const menu = (
    <Menu
      onMouseDown={stopPropagation}
      onClick={handleMenuClick}
      className={classNames(
        'audio-context-menu',
        `audio-context-menu-${theme}`,
      )}
    >
      <Menu.Item
        icon={
          <XiuIcon
            type="iconjianji"
            style={{ fontSize: 16, transform: 'rotate(90deg)' }}
          />
        }
        key="cut"
        hidden={getUrlParams().redirect === 'designer'}
        disabled={!activeAudio}
      >
        调整
      </Menu.Item>
      <Menu.Item
        icon={<XiuIcon type="iconbx_bx-volume-full" style={{ fontSize: 16 }} />}
        key="voice"
        hidden={getUrlParams().redirect === 'designer'}
        disabled={!activeAudio}
      >
        音量
      </Menu.Item>

      <Menu.Item
        icon={
          <XiuIcon
            type="iconic_baseline-content-copy"
            style={{ fontSize: 16 }}
          />
        }
        key="copy"
        disabled={!activeAudio}
      >
        复制
      </Menu.Item>

      <Menu.Item
        icon={<XiuIcon type="iconicons8_trash" style={{ fontSize: 18 }} />}
        key="delete"
        hidden={!activeAudio}
      >
        删除
      </Menu.Item>
    </Menu>
  );

  return (
    <Dropdown
      overlayClassName={classNames(
        'audio-context-overlay-dropdown',
        `audio-context-overlay-dropdown-${theme}`,
        overlayClassName,
      )}
      // visible
      overlay={menu}
      trigger={trigger}
      // getPopupContainer={ele => ele}
    >
      {children}
    </Dropdown>
  );
}
export default observer(ContextMenu);
