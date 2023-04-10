import { XiuIcon } from '@/components';
import InfiniteLoader from '@/components/InfiniteLoader';
import { getUploadMusicList } from '@/api/music';

import styles from './index.modules.less';

import ItemWrap from '../ItemWrap';

export default function MusicList() {
  return (
    <InfiniteLoader
      request={getUploadMusicList}
      beforeLoadData={params => params.page}
      wrapStyle={{ paddingLeft: 18, paddingBottom: 18 }}
    >
      {({ list }) => {
        return (
          <>
            {list.map(item => (
              <ItemWrap
                key={item.id}
                title={item.title}
                duration={item.total_time}
              >
                <div style={{ width: '100%', paddingLeft: 18 }}>
                  <div className={styles.icon}>
                    <XiuIcon type="iconyinle1" />
                  </div>
                </div>
              </ItemWrap>
            ))}
          </>
        );
      }}
    </InfiniteLoader>
  );
}
