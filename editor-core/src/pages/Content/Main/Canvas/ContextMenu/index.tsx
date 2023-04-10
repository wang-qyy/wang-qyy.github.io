import { Dropdown, Menu } from 'antd';
import {
  PropsWithChildren,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import {
  useGetCurrentAsset,
  getCurrentAssetCopy,
  removeAsset,
  useAssetZIndexByObserver,
  assetBlur,
  splitMaskAsset,
  getCurrentAsset,
  ungroupModule,
  toJS,
  observer,
  isTempModuleType,
  useCameraByObeserver,
} from '@hc/editor-core';

import { stopPropagation, copyAndPaste, pasteAsset } from '@/utils/single';

import XiuIcon from '@/components/XiuIcon';
import { setAssetEditStatus } from '@/utils/assetHandler';
import { useRemoveAsset } from '@/hooks/useAssetActions';
import {
  getCopyAndPaste,
  useAiDubbingModal,
  useDropdownVisible,
  useSettingPanelInfo,
  useTimelineMode,
} from '@/store/adapter/useGlobalStatus';

import { multiSelectToModule } from '@/kernel/store';
import { reportChange } from '@/kernel/utils/config';
import { KEY_PRESS_Tooltip } from '@/config/basicVariable';
import { clickActionWeblog } from '@/utils/webLog';
import useClipboardPaste from '@/hooks/useClipboardPaste';
import timeLinePageStore from '@/pages/TimeLinePage/store';
import styles from './index.modules.less';

const { SubMenu } = Menu;

interface ContextMenuProps {
  className?: string;
  classNameWrapper?: string;
}

function ContextMenu({
  children,
  className,
  classNameWrapper = '',
}: PropsWithChildren<ContextMenuProps>) {
  const currentAsset = useGetCurrentAsset();
  const dropdownWrapper = useRef<HTMLDivElement>(null);
  const type = currentAsset?.meta.type || '';
  // const [dropdownVisible, setDropdownVisible] = useState(false);
  const { dropdownVisible, setDropdownVisible } = useDropdownVisible();
  // console.log(toJS(currentTemplate));
  const splitMaskName = () => {
    if (currentAsset?.assets && currentAsset.assets.length > 0) {
      if (['video', 'videoE'].includes(currentAsset.assets[0].meta.type)) {
        return '分离视频';
      }
    }
    return '分离图像';
  };
  const {
    zIndex,
    maxZIndex,
    minZIndex,
    moveBottom,
    moveTop,
    moveDown,
    moveUp,
  } = useAssetZIndexByObserver();
  const { handleRemoveAsset } = useRemoveAsset();
  const { open: openAiModal } = useAiDubbingModal();
  const { timeLinePartKey } = useTimelineMode();
  const { activePartKey } = timeLinePageStore;

  const { clipboardPaste, analyPaste } = useClipboardPaste();
  const { open: openSettingPanel } = useSettingPanelInfo();
  const { inCamera } = useCameraByObeserver();
  // useEffect(() => {
  //   setDropdownVisible(false);
  // }, [currentAsset]);

  const handleMenuClick = async ({ key, e }) => {
    if (!key.split('-').includes('line')) {
      clickActionWeblog(`QuickActions12_${key}`);
    }
    if (['up', 'down', 'top', 'bottom'].includes('key')) {
      clickActionWeblog(`QuickActions13`);
    }

    switch (key) {
      case 'copy':
        copyAndPaste.copy({ type: 'asset', data: getCurrentAssetCopy() });
        break;
      case 'paste':
        // 解析剪切板里的图片数据
        const blob = await analyPaste(undefined);
        if (!blob) {
          pasteAsset();
        }
        break;
      case 'cut':
        copyAndPaste.copy({ type: 'asset', data: getCurrentAssetCopy() });
        handleRemoveAsset(currentAsset);
        break;
      // 调整图层 层级
      case 'order':
        break;
      case 'up':
        moveUp();
        break;
      case 'down':
        moveDown();
        break;
      case 'top':
        moveTop();
        break;
      case 'bottom':
        moveBottom();
        break;

      case 'AI':
        openAiModal();
        break;
      case 'animation':
        openSettingPanel('tool-animation');
        break;
      case 'group':
        multiSelectToModule();
        reportChange('groupModule', true);
        break;

      case 'lock':
        setAssetEditStatus(getCurrentAsset());
        break;
      case 'delete':
        if (currentAsset) {
          removeAsset(currentAsset);
          assetBlur();
        }
        break;
      case 'splitMask':
        if (currentAsset?.meta.type === 'mask') {
          if (currentAsset && !currentAsset.meta.isClip) {
            splitMaskAsset();
          }
        }

        break;

      case 'ungroup':
        if (currentAsset?.meta.type === 'module') {
          ungroupModule(currentAsset);
        }

        break;
      default:
        break;
    }
    setDropdownVisible(false);
  };

  const contextMenu = [
    {
      key: 'copy',
      name: '复制',
      icon: 'copy',
      disabled: !currentAsset || isTempModuleType(currentAsset),
      shortcut: KEY_PRESS_Tooltip.copy,
    },
    {
      key: 'paste',
      name: '粘贴',
      icon: 'iconic_round-flip-to-front',
      disabled: false,
      shortcut: KEY_PRESS_Tooltip.paste,
    },
    {
      key: 'cut',
      name: '剪切',
      icon: 'iconic_outline-content-paste',
      hidden: ['__module', 'module'].includes(type),
      disabled: !currentAsset,
      shortcut: KEY_PRESS_Tooltip.cut,
    },
    {
      key: 'line-1',
      // name: 'line',
      className: styles.lineItem,
    },
    {
      key: 'order',
      name: '图层顺序',
      icon: 'tucengshunxu',
      disabled: !currentAsset,
      hidden: ['__module'].includes(type),
      children: [
        {
          key: 'top',
          name: '置于顶层',
          icon: 'iconic_round-flip-to-front',
          disabled: currentAsset?.transform.zindex === maxZIndex,
          shortcut: KEY_PRESS_Tooltip.moveToTop,
        },
        {
          key: 'up',
          name: '向上一层',
          icon: 'icongg_move-up',
          disabled: currentAsset?.transform.zindex === maxZIndex,
          shortcut: KEY_PRESS_Tooltip.moveUp,
        },
        {
          key: 'down',
          name: '向下一层',
          icon: 'icongg_move-down',
          disabled: currentAsset?.transform.zindex === minZIndex,
          shortcut: KEY_PRESS_Tooltip.moveDown,
        },
        {
          key: 'bottom',
          name: '置于底层',
          icon: 'iconic_round-flip-to-back',
          disabled: currentAsset?.transform.zindex === minZIndex,
          shortcut: KEY_PRESS_Tooltip.moveToBottom,
        },
      ],
    },
    {
      key: 'AI',
      name: '文本朗读',
      icon: 'acoustic',
      disabled: false,
      hidden:
        !(currentAsset?.meta.type === 'text') ||
        ![-1, null].includes(activePartKey as any),
    },
    {
      key: 'animation',
      name: '动画设置',
      hidden:
        ['__module', 'module'].includes(type || '') || timeLinePartKey !== null,
      icon: 'donghua',
      disabled: !currentAsset,
    },
    {
      key: 'line-2',
      // name: 'line',
      className: styles.lineItem,
    },
    {
      key: 'lock',
      name: '锁定图层',
      icon: 'lock',
      hidden: ['__module'].includes(type),
      disabled: !currentAsset,
    },
    {
      key: 'group',
      name: '组合',
      icon: 'zuhe',
      hidden: !(type === '__module'),
      disabled: !currentAsset,
    },
    {
      key: 'splitMask',
      name: splitMaskName(),
      icon: 'iconxingzhuangjiehe',
      hidden: !(
        currentAsset?.meta.type === 'mask' &&
        !currentAsset.meta.isClip &&
        currentAsset?.assets?.length > 0
      ),
    },
    {
      key: 'ungroup',
      name: '拆分组合',
      icon: 'chaifen',
      hidden: currentAsset?.meta.type !== 'module',

      // disabled: !(
      //   currentAsset &&
      //   currentAsset?.meta.type === 'module' &&
      //   currentAsset.assets &&
      //   currentAsset.assets.length > 0
      // ),
    },
    {
      key: 'delete',
      name: '删除图层',
      icon: 'delete',
      disabled: !currentAsset,
      shortcut: KEY_PRESS_Tooltip.delete,
    },
  ];

  const renderMenu = menuArr => {
    return menuArr.map(menu => {
      if (!menu.hidden && Array.isArray(menu.children)) {
        return (
          <SubMenu
            key={menu.key}
            title={menu.name}
            icon={<XiuIcon className={styles['icon-size']} type={menu.icon} />}
            disabled={menu.disabled}
            popupClassName={styles.hover}
          >
            {renderMenu(menu.children)}
          </SubMenu>
        );
      }

      return (
        <Menu.Item
          hidden={menu.hidden}
          disabled={menu.disabled}
          className={menu.className}
          key={menu.key}
          icon={<XiuIcon className={styles['icon-size']} type={menu.icon} />}
        >
          {menu.name}
          {menu.shortcut && (
            <span className="template-contextmenu-keypress">
              {menu.shortcut}
            </span>
          )}
        </Menu.Item>
      );
    });
  };

  useEffect(() => {
    if (!dropdownWrapper.current) return;
    const closeDropdown = () => {
      setDropdownVisible(false);
    };
    dropdownWrapper.current.addEventListener('mousedown', closeDropdown);
    return () => {
      if (!dropdownWrapper.current) return;
      dropdownWrapper.current.removeEventListener('mousedown', closeDropdown);
    };
  }, [dropdownWrapper.current]);
  useEffect(() => {
    if (inCamera) {
      setDropdownVisible(false);
    }
  }, [inCamera]);

  return (
    <Dropdown
      getPopupContainer={ele => ele}
      onVisibleChange={v => {
        if (v === true) {
          if (!inCamera) {
            setDropdownVisible(v);
          }
        } else {
          setDropdownVisible(v);
        }
        if (v) {
          clickActionWeblog('QuickActions12_show');
        }
      }}
      visible={dropdownVisible}
      overlay={
        <Menu
          className={styles.hover}
          onMouseDown={stopPropagation}
          onClick={handleMenuClick}
          theme="light"
          // style={{ width: 200 }}
          getPopupContainer={ele => ele}
        >
          {renderMenu(contextMenu)}
        </Menu>
      }
      trigger={['contextMenu']}
      // visible
      overlayStyle={{ width: 'max-content' }}
    >
      {children}
    </Dropdown>
  );
}
export default observer(ContextMenu);
