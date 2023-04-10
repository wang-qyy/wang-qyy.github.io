import { PropsWithChildren } from 'react';
import { getMask } from '@/api/maskPanel';
import Skeleton from '@/components/Skeleton';

import InfiniteLoader from '@/components/InfiniteLoader';
import { useLeftSideInfo } from '@/store/adapter/useGlobalStatus';
import Item from '../Item';
import styles from './index.less';

interface MoreProps {
  hasTitle?: boolean;
  class_id?: number;
  setPreview: (data: any) => void;
  onAdd: (data: any) => void;
}

export default function More({
  hasTitle = true,
  class_id,
  setPreview,
  onAdd,
}: PropsWithChildren<MoreProps>) {
  const { leftSideInfo, openSidePanel } = useLeftSideInfo();

  const [class_name, moreClass_id] = leftSideInfo.submenu?.split('-') || [];

  return (
    <>
      {hasTitle && (
        <div
          className={styles['class-name']}
          onClick={e => {
            openSidePanel({
              menu: 'module',
              submenu: ``,
            });
          }}
        >
          {'<'}
          {class_name}
        </div>
      )}
      <div className={styles['more-content']}>
        <InfiniteLoader
          request={getMask}
          beforeLoadData={params => params}
          params={{
            class_id: class_id ?? moreClass_id,
            pageSize: 30,
          }}
          skeleton={{ rows: 5 }}
        >
          {({ list }) => {
            return (
              <div
                style={{
                  display: 'grid',
                  gap: 16,
                  gridTemplateColumns: 'repeat(auto-fill, 148px)',
                }}
              >
                {list.map(item => (
                  <Item
                    key={item.id}
                    data={item}
                    setPreview={setPreview}
                    onAdd={onAdd}
                  />
                ))}
              </div>
            );
          }}
        </InfiniteLoader>
      </div>
    </>
  );
}
