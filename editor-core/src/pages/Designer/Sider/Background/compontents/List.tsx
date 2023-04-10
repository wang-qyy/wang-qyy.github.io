import { CSSProperties, memo } from 'react';

import InfiniteLoader from '@/components/InfiniteLoader';

import Item, { ItemType } from './Item';

export { ItemType };

const List = (Props: {
  param: any;
  type: ItemType;
  req: any;
  style?: CSSProperties;
}) => {
  const { param, req, style, type } = Props;

  return (
    <InfiniteLoader
      request={req}
      params={{ pageSize: 40, ...param }}
      skeleton={{ columns: 4 }}
      wrapStyle={style}
    >
      {({ list }) => (
        <div
          style={{
            display: 'grid',
            gap: 12,
            gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))',
            overflowY: 'auto',
            alignContent: 'flex-start',
          }}
        >
          {list.map(item => (
            <Item key={item.id} item={item} type={type} />
          ))}
        </div>
      )}
    </InfiniteLoader>
  );
};

export default memo(List);
