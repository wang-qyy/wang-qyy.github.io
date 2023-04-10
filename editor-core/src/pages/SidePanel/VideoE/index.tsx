import { useState } from 'react';

import LazyLoadComponent from '@/components/LazyLoadComponent';

import SidePanelWrap from '@/components/SidePanelWrap';

import Filter from '@/components/Search';

import { useLeftSideInfo } from '@/store/adapter/useGlobalStatus';

import Recommend from './Recommend';
import More from './More';
import Search from './Search';

const filters = [
  {
    key: 'ratio',
    label: '视频比例',
    type: 'radio',
    options: [
      { value: 'w', label: '16:9' },
      { value: 'h', label: '9:16' },
      { value: 'c', label: '1:1' },
    ],
  },
];

export default function VideoEPanel() {
  const [keyword, setKeyword] = useState<string>(); // 搜索词
  const [ratio, setRadio] = useState<string>(); // 比例

  const {
    leftSideInfo: { submenu },
  } = useLeftSideInfo();

  return (
    <SidePanelWrap
      search={
        <Filter
          searchKey="keyword"
          placeholder="请输入关键词搜索"
          filters={filters}
          onChange={value => {
            setKeyword(value?.keyword);
          }}
          onFilter={value => {
            setRadio(value?.ratio);
          }}
        />
      }
    >
      {(keyword || ratio) && <Search keyword={keyword} ratio={ratio} />}
      {/* 推荐列表 */}
      <LazyLoadComponent visible={!submenu && !keyword && !ratio}>
        <Recommend />
      </LazyLoadComponent>
      {/* 更多 */}
      <LazyLoadComponent visible={Boolean(submenu && !keyword && !ratio)}>
        <More />
      </LazyLoadComponent>
    </SidePanelWrap>
  );
}
