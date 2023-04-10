import { PropsWithChildren } from 'react';
import { observer } from '@hc/editor-core';
import { assetListEle } from '@/api/pictures';

import InfiniteLoader from '@/components/InfiniteLoader';

import { Tabs } from 'antd';

import ElementItem from '@/pages/SidePanel/Replace/Item';

import styles from './index.less';

interface CloudElementListProps {
  goBack: (e: { id: string; class_name: string }) => void;
  bindChangeType: (e: string) => void;
  onAfterAdd?: (e: any) => void;
  state: any;
  keyword: string;
}

const CloudElementList = (props: PropsWithChildren<CloudElementListProps>) => {
  const {
    bindChangeType,
    goBack,
    onAfterAdd,
    keyword,
    state = {
      imgData: [],
      kid: '1',
      moreKey: '10533',
      labelId: '',
      keyword: '',
      shapeList: [],
    },
  } = props;
  const { moreKey } = state;
  return (
    <>
      {keyword && (
        <Tabs
          className={styles.cloundElementTabs}
          onChange={val => {
            bindChangeType(val);
          }}
        >
          <Tabs.TabPane tab="图片" key="asset" />
          <Tabs.TabPane tab="gif动图" key="gif" />
          <Tabs.TabPane tab="动画" key="lottie" />
        </Tabs>
      )}
      <div
        className={styles.title}
        onClick={() => goBack({ id: '', class_name: '', asset_type: '' })}
      >
        {`<${moreKey}`}
      </div>

      <InfiniteLoader
        wrapStyle={{ flex: 1, height: 0 }}
        request={assetListEle}
        params={state}
        skeleton={{ rows: 3, columns: 3 }}
      >
        {({ list }) => {
          return (
            <div className={styles.list}>
              {list.map(item => (
                <ElementItem
                  key={item.id}
                  data={item}
                  type="element"
                  onSuccess={() => onAfterAdd(item)}
                />
              ))}
            </div>
          );
        }}
      </InfiniteLoader>
    </>
  );
};

export default observer(CloudElementList);
