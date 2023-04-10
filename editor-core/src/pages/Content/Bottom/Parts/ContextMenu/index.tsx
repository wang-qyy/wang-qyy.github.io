import { memo, PropsWithChildren } from 'react';
import { Dropdown, Menu } from 'antd';
import { observer, TemplateClass } from '@hc/editor-core';
import { stopPropagation } from '@/utils/single';
import XiuIcon from '@/components/XiuIcon';
import {
  useDeleteTemplate,
  useAddEmptyTemplate,
  useCopyTemplate,
  setActiveTemplate,
} from '@/utils/templateHandler';
import { useVideoSplit } from '@/pages/Content/Main/Split';
import {
  setBottomMode,
  usePartModal,
  useSettingPanelInfo,
} from '@/store/adapter/useGlobalStatus';
import { clickActionWeblog } from '@/utils/webLog';

import { KEY_PRESS_Tooltip } from '@/config/basicVariable';
import styles from './index.modules.less';

const IMenu = observer(
  (
    props: PropsWithChildren<{
      template: TemplateClass;
      templateIndex: number;
      isLast?: boolean;
    }>,
  ) => {
    const { template, isLast, templateIndex } = props;

    const { disabled: disabledDelete, delete: deleteTemplate } =
      useDeleteTemplate(template);
    const { disabled: disableAddEmpty, addTemplate: addEmptyTemplate } =
      useAddEmptyTemplate();
    const { canSplit, handleSplit } = useVideoSplit();
    const { disabled: disabledCopy, copy: copyTemplate } =
      useCopyTemplate(template);

    const { changePartModal } = usePartModal();
    const { open: openSettingPanel } = useSettingPanelInfo();
    function getTransition() {
      openSettingPanel('video-transition', {
        templateIndex,
        transitionId: template.endTransfer?.meta.id,
        resId: template.endTransfer?.attribute.resId,
      });
      // 选中当前片段
      setActiveTemplate(templateIndex);
    }

    const ContextMenu = [
      {
        key: 'addTemplate',
        name: '添加片段',
        icon: 'icontianjia',
        children: [
          {
            key: 'addEmpty',
            name: '添加空白片段',
            disabled: disableAddEmpty,
          },
          {
            key: 'addPart',
            name: '添加模板片段',
          },
        ],
      },
      {
        key: 'copy',
        name: '复制片段',
        icon: 'icona-Frame6',
        disabled: disabledCopy,
        keyPress: KEY_PRESS_Tooltip.clone,
      },
      {
        key: 'split',
        name: '分割片段',
        icon: 'iconfenge',
        disabled: !canSplit,
        iconStyle: { fontSize: 20 },
        keyPress: 'S',
      },
      {
        key: 'transition',
        name: '添加转场',
        icon: 'iconzhuanchang2',
        hidden: isLast || template.endTransfer,
        iconStyle: { fontSize: 14, color: '#484E5F' },
      },
      {
        key: 'replaceTransition',
        name: '替换转场',
        icon: 'iconzhuanchang2',
        hidden: !template.endTransfer,
        iconStyle: { fontSize: 14, color: '#484E5F' },
      },

      {
        key: 'delete',
        name: '删除片段',
        icon: 'iconicons8_trash',
        // disabled: disabledDelete,
        iconStyle: { fontSize: 20 },
        keyPress: KEY_PRESS_Tooltip.delete,
      },

      // {
      //   key: 'multipleReplace',
      //   name: '批量替换',
      //   icon: 'iconri_find-replace-line',
      // },
    ];

    function handleMenuClick({ key, domEvent }: { key: string }) {
      stopPropagation(domEvent);
      clickActionWeblog(`part_contextMenu_${key}`);
      switch (key) {
        case 'addEmpty':
          addEmptyTemplate(templateIndex + 1);
          break;
        case 'addPart':
          changePartModal({ currentIndex: templateIndex + 1, visible: true });
          break;
        case 'replaceTransition':
        case 'transition':
          getTransition();
          break;
        case 'copy':
          copyTemplate();
          break;
        case 'delete':
          deleteTemplate();
          break;
        case 'split':
          handleSplit();
          break;
        case 'multipleReplace':
          setBottomMode('simple');
          break;
      }
    }

    function renderMenu(menus) {
      return menus.map(menu => {
        if (Array.isArray(menu.children)) {
          return (
            <Menu.SubMenu
              key={menu.key}
              title={menu.name}
              icon={
                <XiuIcon className={styles['icon-size']} type={menu.icon} />
              }
              disabled={menu.disabled}
              popupClassName={styles.hover}
            >
              {renderMenu(menu.children)}
            </Menu.SubMenu>
          );
        }

        return (
          <Menu.Item
            hidden={Boolean(menu.hidden)}
            disabled={Boolean(menu.disabled)}
            key={menu.key}
            icon={
              menu.icon ? (
                <XiuIcon
                  className={styles['icon-size']}
                  style={menu.iconStyle}
                  type={menu.icon}
                />
              ) : (
                ''
              )
            }
          >
            {menu.name}
            <span className="template-contextmenu-keypress">
              {menu.keyPress}
            </span>
          </Menu.Item>
        );
      });
    }

    return (
      <Menu
        className={styles.hover}
        onMouseDown={e => {
          stopPropagation(e);
          // 阻止触发blur事件
          e.preventDefault();
        }}
        onClick={handleMenuClick}
        theme="light"
      >
        {renderMenu(ContextMenu)}
      </Menu>
    );
  },
);

export default memo(function (
  props: PropsWithChildren<{
    template: TemplateClass;
    templateIndex: number;
    isLast?: boolean;
  }>,
) {
  return (
    <Dropdown
      getPopupContainer={() => document.querySelector('#xiudodo')!}
      trigger={['contextMenu']}
      overlayStyle={{ width: 186 }}
      destroyPopupOnHide
      overlay={() => <IMenu {...props} />}
    >
      {props.children}
    </Dropdown>
  );
});
