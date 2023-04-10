import { useState, useEffect, memo, useRef } from 'react';
import { useUpdateEffect } from 'ahooks';
import classnames from 'classnames';
import { pauseVideo } from '@hc/editor-core';
import { XiuIcon } from '@/components';
import {
  useLeftSideInfo,
  useSettingPanelInfo,
  useMoreMenu,
} from '@/store/adapter/useGlobalStatus';
import { useSideBar } from '@/hooks/useSideBar';
import { getUserId } from '@/store/adapter/useUserInfo';
import { message } from 'antd';
import { sideBarItem } from '@/typings/index';
import 'animate.css';
import './index.less';
import { stopPropagation } from '@/utils/single';
import { clickActionWeblog } from '@/utils/webLog';

const Aside = () => {
  const { delSideMenu, bindMouseDown, getShowSideMenu } = useSideBar();
  const { moreMenu } = useMoreMenu();
  const { menuList } = moreMenu || { menuList: [] };
  const userId = getUserId();

  const [api, contextHolder] = message.useMessage();

  // 获取侧边栏显示菜单数组
  const sideMunuList = menuList?.filter((item: sideBarItem) => {
    return item.display === 1;
  });
  const {
    leftSideInfo: { menu },
  } = useLeftSideInfo();
  const {
    value: { panelKey: settingPanel },
  } = useSettingPanelInfo();

  const [activeTop, setActiveTop] = useState(0);

  // 信息提醒框的定时函数
  const messageRef = useRef();

  useEffect(() => {
    const activeMenu = document.getElementById(
      `left-menu-${menu}`,
    ) as HTMLDivElement;

    const top = activeMenu?.getBoundingClientRect().top - 40 || 0;
    setActiveTop(top);
  }, [menu]);

  useEffect(() => {
    getShowSideMenu(userId !== -1);
  }, [userId]);

  const renderMenu = () => {
    return sideMunuList.map((menuItem: sideBarItem) => (
      <div
        id={`left-menu-${menuItem.id}`}
        className={classnames('menu-item', {
          'menu-item-active': !settingPanel && menu === menuItem.id,
        })}
        key={menuItem.id}
        onMouseDown={() => {
          bindMouseDown(menuItem);
        }}
      >
        {!settingPanel && menu === menuItem.id && menuItem?.isClose && (
          <XiuIcon
            type="close-small"
            className="menu-item-close"
            onMouseDown={e => {
              messageRef.current && clearTimeout(messageRef.current);
              stopPropagation(e);
              clickActionWeblog(`menu_hide_${menuItem.id}`);
              delSideMenu(menuItem, 0, userId);
              messageRef.current = setTimeout(() => {
                message.destroy('sideBarDel');
              }, 5000);
              api.warning({
                content: (
                  <div className="menu-item-message">
                    <div className="menu-item-message-icon">
                      <XiuIcon type={menuItem.icon} className="message-icon" />
                    </div>
                    <div className="menu-item-message-txt">
                      {menuItem.name}移动到更多
                    </div>
                    <div
                      onClick={() => {
                        bindMouseDown(menuItem);
                        delSideMenu(menuItem, 1, userId);
                        clickActionWeblog(`menu_show_${menuItem.id}`);
                        message.destroy('sideBarDel');
                      }}
                      className="menu-item-message-button"
                    >
                      撤销
                    </div>
                  </div>
                ),
                className: 'menu-item-message-warp',
                duration: 5,
                icon: <div style={{ display: 'none' }} />,
                key: 'sideBarDel',
              });
            }}
          />
        )}

        <div className="menu-item-icon">
          <XiuIcon type={menuItem.icon} />
        </div>
        {/* animate__zoomOut */}
        {menuItem.newFun && (
          <div className="menuItemNewFun animate__animated animate__bounce animate__pulse animate__infinite" />
        )}
        {/* {menuItem.id === 'AI' && <div className="menu-item-tip">限免</div>} */}
        <div className="menu-item-name">{menuItem.name}</div>
      </div>
    ));
  };

  return (
    <div
      className={classnames('xiudodo-aside', {
        // 'aside-expand': sidePanelVisible,
      })}
      onClick={() => {
        pauseVideo();
      }}
    >
      {contextHolder}
      <div className="xiudodo-aside-menu">
        {renderMenu()}

        <div
          className="active-background"
          style={{
            top: activeTop || 10,
            display: !menu || settingPanel ? 'none' : '',
          }}
        />
      </div>
    </div>
  );
};
export default memo(Aside);
