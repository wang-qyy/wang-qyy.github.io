import React from 'react';
import { assetBlur } from '@hc/editor-core';
import { clickActionWeblog } from '@/utils/webLog';
import { sideBarItem } from '@/typings/index';
import { getMenuInfo, editorMenuSet } from '@/api/pub';
import {
  useLeftSideInfo,
  useSettingPanelInfo,
  useMoreMenu,
} from '@/store/adapter/useGlobalStatus';
import { useUserInfo } from '@/store/adapter/useUserInfo';

export function useSideBar() {
  const {
    openSidePanel,
    leftSideInfo: { menu, sidePanelVisible },
    closeSidePanel,
  } = useLeftSideInfo();
  const {
    close: closeSettingPanel,
    value: { visible: settingPanelVisible },
  } = useSettingPanelInfo();
  const userInfo = useUserInfo();

  const { moreMenu, updateMoreMenu } = useMoreMenu();

  // 可出现叉的菜单：图片、视频、组件、角色、帮助、logo水印、背景、AI语音、水印、角色
  const menuList = [
    {
      label: 'a',
      id: 'template',
      name: '模板',
      icon: 'moban',
      display: 1,
    },
    { label: 'b', id: 'scene', name: '片段', icon: 'pianduan', display: 1 },
    {
      label: 'c',
      id: 'user-space',
      name: '上传',
      icon: 'shangchuan',
      display: 1,
    },
    { label: 'd', id: 'text', name: '文字', icon: 'wenzi', display: 1 },
    {
      label: 'e',
      id: 'element',
      name: '元素',
      icon: 'yuansu',
      display: 1,
    },
    { label: 'f', id: 'music', name: '音乐', icon: 'yinle', display: 1 },
    {
      label: 'o',
      id: 'EffectVideo',
      name: '特效',
      icon: 'texiao-6hf9cnel',
      display: 1,
      isClose: true,
      newFun: false,
    },
    {
      label: 'g',
      id: 'module',
      name: '组件',
      icon: 'zujian',
      display: 1,
      isClose: true,
    },
    {
      label: 'q',
      id: 'qrcode',
      name: '二维码',
      icon: 'iconerweima',
      display: 1,
      isClose: true,
    },
    {
      label: 'h',
      id: 'background',
      name: '背景',
      icon: 'beijing',
      display: 1,
      isClose: true,
    },
    {
      label: 'i',
      id: 'AI',
      name: 'AI语音',
      icon: 'AIyuyin',
      display: 1,
      isClose: true,
    },
    {
      label: 'j',
      id: 'videoE',
      name: '视频',
      icon: 'shipin',
      display: 1,
      isClose: true,
    },
    {
      label: 'k',
      id: 'img',
      name: '图片',
      icon: 'tupian',
      display: 1,
      isClose: true,
    },
    {
      label: 'l',
      id: 'role',
      name: '角色',
      icon: 'jiaose',
      display: 0,
      isClose: true,
    },
    {
      label: 'm',
      id: 'logo',
      name: 'logo水印',
      icon: 'shuiyin-5khma0nc',
      display: 0,
      isClose: true,
    },
    {
      label: 'n',
      id: 'brandLogo',
      name: '品牌logo',
      icon: 'pinpai-6aen9hm2',
      display: 0,
      isClose: true,
    },
    { id: 'more', name: '更多', icon: 'huaban1', display: 1 },
  ];

  // 是否登录获取显示数据
  const getShowSideMenu = (isLogin: boolean) => {
    if (isLogin) {
      // 如果缓存默认菜单不等于菜单数组 就更新菜单
      getMenuInfo().then(res => {
        const arr = [];
        for (let i = 0; i < res.data.length; i++) {
          const element = res.data[i];
          for (let j = 0; j < menuList.length; j++) {
            const e = menuList[j];
            if (e.label === element.name) {
              const obj = JSON.parse(JSON.stringify(e));
              obj.display = element.display;
              // 团队才显示品牌
              if (e.id === 'brandLogo') {
                if (userInfo?.team_id > 0) {
                  arr.push(obj);
                }
              } else {
                arr.push(obj);
              }
            }
          }
        }
        arr.push({ id: 'more', name: '更多', icon: 'huaban1', display: 1 });
        updateMoreMenu({ menuList: arr });
      });
    } else {
      updateMoreMenu({ menuList });
    }
  };

  // 绑定菜单点击事件
  const bindMouseDown = (menuItem: sideBarItem) => {
    assetBlur();
    // 点击AI语音埋点
    if (menuItem.id === 'AI') {
      clickActionWeblog('ai_audio_003');
    } else if (menuItem.id === 'EffectVideo') {
      // 点击视频特效特效
      clickActionWeblog('videoEffect_panel');
    } else {
      clickActionWeblog(`menu_${menuItem.id}`);
    }

    // 再次点击菜单关闭
    if (menuItem.id === menu && !settingPanelVisible && sidePanelVisible) {
      closeSidePanel();
    } else {
      openSidePanel({ menu: menuItem.id });
    }
    closeSettingPanel();
  };

  // 切换下一个菜单没有就显示第一个菜单
  const checkMenu = (list: any, id: string) => {
    // 获取侧边栏显示菜单数组
    const sideMunuList = list?.filter((item: sideBarItem) => {
      return item.display === 1;
    });
    let index = 0;
    // 获取当前点击菜单的下标
    sideMunuList?.map((item: sideBarItem, i: number) => {
      if (item.id === id) {
        if (i + 1 <= sideMunuList?.length) {
          index = i + 1;
        }
      }
    });

    const item = sideMunuList[index];
    bindMouseDown(item);
  };

  const bindeditorMenuSet = (label: string) => {
    editorMenuSet(label);
  };

  // 删除菜单 type='more'为移入更多 type='side'为移出更多
  const delSideMenu = (item: any, type: number, userId: number | string) => {
    const { id, label } = item;
    const menuList = moreMenu?.menuList;
    const list = menuList?.map((item: sideBarItem) => {
      if (item.id === id) {
        const newItem = JSON.parse(JSON.stringify(item));
        newItem.display = type;
        return newItem;
      }
      return item;
    });
    const newList = JSON.parse(JSON.stringify(list));
    type === 0 && checkMenu(menuList, id);
    userId > 0 && bindeditorMenuSet(label);
    updateMoreMenu({ menuList: newList });
  };

  return {
    delSideMenu,
    bindMouseDown,
    getShowSideMenu,
  };
}
