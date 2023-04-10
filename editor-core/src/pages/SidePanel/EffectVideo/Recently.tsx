import { getVideoEHistory } from '@/api/videoE';
import InfiniteLoader from '@/components/InfiniteLoader';
import Item from './Item';
import styles from './index.modules.less';

export default function Recently() {
  return (
    <div className={styles['video-list']}>
      <InfiniteLoader
        request={getVideoEHistory}
        beforeLoadData={params => params}
        params={{
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
                  action="videoEffect_recently_add"
                />
              ))}
            </div>
          );
        }}
      </InfiniteLoader>
    </div>
  );
}
