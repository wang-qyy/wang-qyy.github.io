import { useEffect, useState } from 'react';
import { Tabs } from 'antd';
import classnames from 'classnames';

import {
  useReplaceStatusByObserver,
  useGetCurrentAsset,
} from '@hc/editor-core';

import SidePanelWrap from '@/components/SidePanelWrap';
import LazyLoadComponent from '@/components/LazyLoadComponent';
import { useSettingPanelInfo } from '@/store/adapter/useGlobalStatus';

import UserUpload from '../Upload';
import List from './List';

import './index.less';

const Replace = () => {
  const { close: closeSettingPanel } = useSettingPanelInfo();
  const { endReplace } = useReplaceStatusByObserver();
  const currentAsset = useGetCurrentAsset();

  const [activeTab, setActiveTab] = useState('user-space');

  return (
    <SidePanelWrap
      refresh
      wrapClassName="replace-panel-wrap"
      header={
        <div style={{ display: 'flex', height: 'inherit' }}>
          {[
            { title: '我的空间', key: 'user-space' },
            { title: '云端资源', key: 'common' },
          ].map(item => (
            <div
              key={item.key}
              className={classnames('replace-header-item', {
                'replace-header-active': activeTab === item.key,
              })}
              onClick={() => {
                setActiveTab(item.key);
              }}
            >
              {item.title}
            </div>
          ))}
        </div>
      }
      onCancel={() => {
        closeSettingPanel();
        endReplace();
      }}
    >
      {activeTab === 'user-space' && <UserUpload type="replace" />}

      <LazyLoadComponent visible={activeTab === 'common'}>
        <Tabs className="replace-tabpanel">
          <Tabs.TabPane tab="图片" key="image">
            <List type="image" />
          </Tabs.TabPane>
          <Tabs.TabPane tab="视频" key="videoE">
            <List type="videoE" />
          </Tabs.TabPane>
          {!(
            currentAsset?.meta.type === 'mask' && currentAsset.assets?.length
          ) && (
            <Tabs.TabPane tab="元素" key="element">
              <List type="element" />
            </Tabs.TabPane>
          )}
        </Tabs>
      </LazyLoadComponent>
    </SidePanelWrap>
  );
};

export default Replace;
