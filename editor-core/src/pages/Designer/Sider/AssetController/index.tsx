import { useState, useEffect } from 'react';
import {
  isModuleType,
  useGetCurrentAsset,
  observer,
  useMaskClipByObserver,
  isMaskType,
  useAniPathEffect,
  toJS,
  isImageAsset,
} from '@hc/editor-core';

import { IMAGE_TYPES } from '@kernel/utils/assetHelper/const';

import Animation from '@/pages/Designer/Sider/AssetController/Animation';
import { SiderTabs } from '@/pages/Designer/Sider/components/SiderTabs';
import SiderTabPanel from '@/pages/Designer/Sider/components/SiderTabPanel';
import { getRealAsset } from '@/utils/single';
import OperationBasic from './Basic';
import OperationCutting from './Cutting';
import Filters from './Filters';
import ImageController from './ImageController';
import BgAnimation from '../Background/compontents/common/BgAnimation';
import Shadow from './Shadow';

const MaterialDone = () => {
  const { startMask, inMask, endMask } = useMaskClipByObserver();
  const { changStatue } = useAniPathEffect();
  const currentAsset = useGetCurrentAsset();
  const [activeKey, setActiveKey] = useState('basic');

  const realAsset = currentAsset && getRealAsset(currentAsset);

  useEffect(() => {
    if (!inMask) {
      setActiveKey('basic');
    }
  }, [currentAsset]);
  const settings = [
    { key: 'basic', name: '基础', show: true, Component: OperationBasic },
    {
      key: 'Cutting',
      name: '蒙版裁剪',
      show:
        (currentAsset &&
          !currentAsset?.meta.isBackground &&
          !isModuleType(currentAsset.parent) &&
          ['image', 'pic', 'video', 'videoE'].includes(
            currentAsset?.meta.type,
          )) ||
        (isMaskType(currentAsset) && currentAsset?.assets?.length),
      Component: OperationCutting,
    },
    {
      key: 'animation',
      name: '动画',
      show:
        !isModuleType(currentAsset) &&
        !currentAsset?.meta.isBackground &&
        !isModuleType(currentAsset?.parent),
      Component: Animation,
    },
    {
      key: 'bgAnimation',
      name: '背景动画',
      show: currentAsset?.meta.isBackground && isImageAsset(currentAsset),
      Component: BgAnimation,
    },
    {
      key: 'filters',
      name: '滤镜',
      show:
        !currentAsset?.meta.isBackground &&
        realAsset &&
        IMAGE_TYPES.includes(realAsset.meta.type),
      Component: Filters,
    },
    {
      key: 'embellish',
      name: '美化',
      show:
        !currentAsset?.meta.isBackground &&
        realAsset &&
        IMAGE_TYPES.includes(realAsset.meta.type),
      Component: ImageController,
    },
    {
      key: 'shadow',
      name: '投影',
      show:
        !currentAsset?.meta.isBackground &&
        !isModuleType(currentAsset) &&
        !isModuleType(currentAsset?.parent),
      Component: Shadow,
    },
  ];
  return (
    <SiderTabs
      destroyInactiveTabPane
      activeKey={activeKey}
      onChange={(val: string) => {
        setActiveKey(val);
        // 设置路径动画展现状态
        changStatue(-1);
        if (val === 'Cutting') {
          startMask();
        } else {
          endMask();
        }
      }}
    >
      {settings.map(item => {
        const { show, Component } = item;
        return (
          show && (
            <SiderTabPanel tab={item.name} key={item.key}>
              <Component />
            </SiderTabPanel>
          )
        );
      })}
    </SiderTabs>
  );
};
export default observer(MaterialDone);
