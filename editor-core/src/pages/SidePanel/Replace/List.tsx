import { useRef } from 'react';
import { useSetState } from 'ahooks';
import classNames from 'classnames';

import Search from '@/components/Search';

import InfiniteLoader, { InfiniteLoaderRef } from '@/components/InfiniteLoader';

import { filters, config } from './config';

import Item from './Item';

export default function List({
  type,
}: {
  type: 'image' | 'videoE' | 'element';
}) {
  const { request, formatResult, defaultFiltered } = config[type];

  const listRef = useRef<InfiniteLoaderRef>();

  const [filter, setFilter] = useSetState(defaultFiltered);

  return (
    <>
      <Search
        searchKey="keyword"
        filters={filters[type]}
        onFilter={setFilter}
        onChange={setFilter}
        placeholder="请输入关键词搜索"
        defaultValue={defaultFiltered}
      />
      <InfiniteLoader
        ref={listRef}
        formatResult={formatResult}
        request={request}
        wrapStyle={{ flex: 1, height: 0 }}
        params={filter}
        skeleton={{
          className: classNames('replace-element-list', {
            'replace-element-list-small': type === 'element',
          }),
        }}
      >
        {({ list }) => {
          return (
            <>
              {list.map(item => (
                <Item key={item.id} data={item} type={type} />
              ))}
            </>
          );
        }}
      </InfiniteLoader>
    </>
  );
}
