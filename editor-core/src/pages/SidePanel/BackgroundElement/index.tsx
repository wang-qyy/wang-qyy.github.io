import { useState } from 'react';
import { observer } from '@hc/editor-core';
import LazyLoadComponent from '@/components/LazyLoadComponent';
import SidePanelWrap from '@/components/SidePanelWrap';
import Search from '@/components/Search';
import { useDebounce } from 'ahooks';
import { useLeftSideInfo } from '@/store/adapter/useGlobalStatus';
import DefaultPage from './DefaultPage';
import MorePage from './MorePage';
import './index.less';

function BackgroundElement() {
  const [keyword, _keyword] = useState('');
  const debouncedValue = useDebounce(keyword, { wait: 500 });
  const {
    leftSideInfo: { submenu },
    openSidePanel,
  } = useLeftSideInfo();

  return (
    <>
      <SidePanelWrap>
        <div
          style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
        >
          <Search
            searchKey="keyword"
            onChange={val => {
              openSidePanel({ submenu: `` });
              _keyword(val.keyword);
            }}
            className="backgroundElementSearch"
            placeholder="输入关键词搜索"
          />
          <div style={{ height: 'calc(100% - 72px)' }}>
            {/* 推荐列表 */}
            <LazyLoadComponent visible={!submenu}>
              <DefaultPage keyword={debouncedValue} />
            </LazyLoadComponent>
            {/* 更多 */}
            <LazyLoadComponent visible={Boolean(submenu && !keyword)}>
              <MorePage />
            </LazyLoadComponent>
          </div>
        </div>
      </SidePanelWrap>
    </>
  );
}

export default observer(BackgroundElement);
