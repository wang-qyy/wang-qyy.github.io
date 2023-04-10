import { getVideoE } from '@/api/videoE';
import InfiniteLoader from '@/components/InfiniteLoader';
import Item from './Item';
import styles from './index.modules.less';

export default function Collection() {
  return (
    <div className={styles['video-list']}>
      <InfiniteLoader
        request={getVideoE}
        beforeLoadData={params => params}
        params={{}}
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
