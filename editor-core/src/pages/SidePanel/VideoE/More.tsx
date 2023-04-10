import { PropsWithChildren } from 'react';
import { getVideoE } from '@/api/videoE';
import Skeleton from '@/components/Skeleton';

import InfiniteLoader from '@/components/InfiniteLoader';
import { useLeftSideInfo } from '@/store/adapter/useGlobalStatus';
import Item from './Item';
import styles from './index.modules.less';

interface MoreProps {
  keyword?: string;
  hasTitle?: boolean;
  ratio?: string; // 视频比例
  class_id?: number;
}

export default function More({
  keyword,
  hasTitle = true,
  ratio,
  class_id,
}: PropsWithChildren<MoreProps>) {
  const { leftSideInfo, openSidePanel } = useLeftSideInfo();

  const [class_name, moreClass_id] = leftSideInfo.submenu?.split('-') || [];

  return (
    <div className={styles['more-list']}>
      {hasTitle && (
        <div
          className={styles['class-name']}
          onClick={() => {
            openSidePanel();
          }}
        >
          {'<'}
          {class_name}
        </div>
      )}
      <InfiniteLoader
        request={getVideoE}
        beforeLoadData={params => params}
        params={{
          class_id: class_id ?? moreClass_id,
          keyword,
          ratio,
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
                <Item key={item.id} data={item} />
              ))}
            </div>
          );
        }}
      </InfiniteLoader>
    </div>
  );
}
