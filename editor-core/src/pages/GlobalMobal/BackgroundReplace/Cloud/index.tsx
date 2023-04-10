import React, { useEffect, useState } from 'react';
import { Tabs } from 'antd';
import Search from '@/components/Search';
import { filters, config } from '@/pages/SidePanel/Replace/config';
import { getCurrentAsset } from '@/kernel';
import { useAssetReplaceModal } from '@/store/adapter/useGlobalStatus';
import { clickActionWeblog } from '@/utils/webLog';
import styles from './index.less';
import List from './List';

interface State {
  kid?: string;
  label_id?: string;
  is_portrait?: string;
  keyword: string;
  isPortrait?: number;
  page: number;
  pageSize: number;
  class_id?: string;
  ratio?: string;
  search_type?: string;
}

const typeOpts: Record<
  string,
  {
    label: string;
  }
> = {
  image: {
    label: '图片',
  },
  element: {
    label: '元素',
  },
  videoE: {
    label: '视频',
  },
  audio: {
    label: '音频',
  },
};

function Cloud() {
  const {
    value: { type: replaceModalType },
  } = useAssetReplaceModal();
  const currentAsset = getCurrentAsset();
  const [activeTab, setActiveTab] = useState('image');
  const { defaultFiltered } = config[activeTab];
  const [state, setState] = useState<State>({
    page: 1,
    pageSize: 40,
    keyword: '',
    ...defaultFiltered,
  });

  const isAudio = replaceModalType === 'replace-audio';

  useEffect(() => {
    if (isAudio) {
      setActiveTab('audio');
    } else {
      setActiveTab('image');
    }
  }, [isAudio]);

  const changeActiveTab = (avtive: string) => {
    setActiveTab(avtive);
    setState({
      page: 1,
      pageSize: 40,
      ...config[avtive].defaultFiltered,
    });
  };
  const setStateData = data => {
    setState({
      ...state,
      ...data,
    });
  };
  const operations = (
    <Search
      searchKey="keyword"
      placeholder={`搜索${typeOpts[activeTab].label}`}
      filters={filters[activeTab]}
      onChange={data => {
        clickActionWeblog('concise26');
        setStateData(data);
      }}
      onFilter={data => {
        clickActionWeblog('concise28');
        setStateData(data);
      }}
      onClickFilter={() => {
        clickActionWeblog('concise27');
      }}
      defaultValue={defaultFiltered}
    />
  );

  return (
    <div className={styles.cloudWarp}>
      <Tabs
        activeKey={activeTab}
        destroyInactiveTabPane
        onChange={avtive => {
          changeActiveTab(avtive);
        }}
        tabBarExtraContent={operations}
      >
        {isAudio ? (
          <Tabs.TabPane tab="音频" key="audio">
            <List type="audio" params={state} />
          </Tabs.TabPane>
        ) : (
          <>
            <Tabs.TabPane tab="图片" key="image">
              <List type="image" params={state} />
            </Tabs.TabPane>
            <Tabs.TabPane tab="视频" key="videoE">
              <List type="videoE" params={state} />
            </Tabs.TabPane>
            {replaceModalType === 'modal-replace' &&
              !(
                currentAsset?.meta.type === 'mask' &&
                currentAsset.assets?.length
              ) && (
                <Tabs.TabPane tab="元素" key="element">
                  <List type="element" params={state} />
                </Tabs.TabPane>
              )}
          </>
        )}
      </Tabs>
    </div>
  );
}

export default Cloud;
