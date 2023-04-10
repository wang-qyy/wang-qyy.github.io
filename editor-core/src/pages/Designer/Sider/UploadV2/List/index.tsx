import { useRef, ReactNode, useEffect } from 'react';
import InfiniteLoader, { InfiniteLoaderRef } from '@/components/InfiniteLoader';

import styles from './index.modules.less';

interface ListProps {
  type: 'lottie' | 'png' | 'bg';
  request: (params: any) => Promise<any>;
  Item: ReactNode;
  reload: boolean;
  setReload: (status: boolean) => void;
}
/**
 * @description 上传列表数据
 * @param
 * */
export default function List({
  type,
  request,
  Item,
  reload,
  setReload,
}: ListProps) {
  const listRef = useRef<InfiniteLoaderRef>();

  useEffect(() => {
    if (reload) {
      listRef.current?.reload();
      setReload(false);
    }
  }, [reload]);

  return (
    <InfiniteLoader
      request={request}
      params={{ scope_type: type, pageSize: 50 }}
      ref={listRef}
    >
      {({ list }) => {
        return (
          <>
            {list.map(item => (
              <Item
                key={item.id}
                data={item}
                className={styles['upload-list-item']}
                reload={listRef.current?.reload}
              />
            ))}
          </>
        );
      }}
    </InfiniteLoader>
  );
}
