import { useState } from 'react';
import SidePanelWrap from '@/components/SidePanelWrap';
import Filter from '@/components/Search';

import { Tabs } from 'antd';
import { clickActionWeblog } from '@/utils/webLog';
import { useLeftSideInfo } from '@/store/adapter/useGlobalStatus';
import styles from './index.modules.less';
import EffectVideoMain from './Main';
import Recently from './Recently';
import Collection from './Collection';

export default function EffectVideoPanel() {
  const [keyword, setKeyword] = useState<string>(''); // 搜索词
  const [active, setActive] = useState<string>('all'); // 选中
  const {
    leftSideInfo: { submenu },
  } = useLeftSideInfo();
  return (
    <SidePanelWrap
      search={
        <Filter
          defaultValue={1}
          searchKey="keyword"
          placeholder="搜特效"
          onChange={value => {
            setKeyword(value?.keyword);
            // 搜索特效埋点
            clickActionWeblog('videoEffect_search', {
              action_label: value?.keyword,
            });
          }}
        />
      }
    >
      {!submenu && (
        <Tabs
          className={styles.indexTabs}
          defaultActiveKey={active}
          style={{ display: keyword ? 'none' : 'block' }}
          onChange={(val: string) => {
            setActive(val);
            if (val === 'recently') {
              clickActionWeblog('videoEffect_recently');
            }
          }}
        >
          <Tabs.TabPane key="all" tab="全部" />
          <Tabs.TabPane key="recently" tab="最近使用" />
          {/* <Tabs.TabPane key="collection" tab="收藏" /> */}
        </Tabs>
      )}
      {/* 全部 */}
      {active === 'all' && (
        <EffectVideoMain keyword={keyword} visible={active === 'all'} />
      )}
      {/* 最近使用 */}
      {active === 'recently' && <Recently />}
      {/* 收藏 */}
      {/* {active === 'collection' && <Collection />} */}
    </SidePanelWrap>
  );
}
