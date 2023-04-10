import { PropsWithChildren } from 'react';

import { Tabs } from 'antd';

import More from './More';
import styles from './index.modules.less';

interface MoreProps {
  keyword?: string;
  ratio?: string;
}

export default function Search({
  keyword,
  ratio,
}: PropsWithChildren<MoreProps>) {
  return (
    <>
      <Tabs className={styles['xiudd-videoE-search-list']}>
        <Tabs.TabPane tab="全部" key="0">
          <More hasTitle={false} class_id="" keyword={keyword} ratio={ratio} />
        </Tabs.TabPane>
        <Tabs.TabPane tab="视频背景" key="2001">
          <More
            hasTitle={false}
            class_id={2001}
            keyword={keyword}
            ratio={ratio}
          />
        </Tabs.TabPane>
        <Tabs.TabPane tab="实拍视频" key="2002">
          <More
            hasTitle={false}
            class_id={2002}
            keyword={keyword}
            ratio={ratio}
          />
        </Tabs.TabPane>
        {/* <Tabs.TabPane tab="视频特效" key="2003">
          <More
            hasTitle={false}
            class_id={2003}
            keyword={keyword}
            ratio={ratio}
          />
        </Tabs.TabPane> */}
      </Tabs>
    </>
  );
}
