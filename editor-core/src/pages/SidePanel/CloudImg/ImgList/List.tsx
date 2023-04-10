import { memo, PropsWithChildren } from 'react';

import InfiniteLoader from '@/components/InfiniteLoader';

import Image from './Image';

export interface DataItem {
  id: string;
  height: number;
  width: number;
  path: string;
  owner?: string;
  path_small?: string;
  title?: string;
  cdn?: number;
}

interface ListProps {
  reload?: boolean;
  requests: any;
  param: object;
}

const List = ({ requests, param }: PropsWithChildren<ListProps>) => {
  return (
    <InfiniteLoader
      params={param}
      request={requests}
      formatResult={response => {
        return {
          list: response.data.list,
          pageTotal: Math.ceil(response?.data.total / response?.data.pageSize),
          page: Number(response.data.page),
        };
      }}
      skeleton={{ rows: 5 }}
    >
      {({ list }) => {
        return (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill,148px)',
              gap: 16,
              alignContent: 'start',
            }}
          >
            {list.map(item => (
              <Image key={`user-space-userImg-${item.id}`} data={item} />
            ))}
          </div>
        );
      }}
    </InfiniteLoader>
  );
};

export default memo(List);
