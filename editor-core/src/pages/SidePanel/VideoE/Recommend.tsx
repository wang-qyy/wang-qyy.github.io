import { useRequest } from 'ahooks';
import Mold from '@/pages/Designer/Sider/components/Mold';
import Skeleton from '@/components/Skeleton';

import { getRecommendVideoE } from '@/api/videoE';
import { useLeftSideInfo } from '@/store/adapter/useGlobalStatus';
import { clickActionWeblog } from '@/utils/webLog';

import Item from './Item';

import styles from './index.modules.less';

export default function Recommend() {
  const { openSidePanel } = useLeftSideInfo();

  const { data = [], loading } = useRequest(getRecommendVideoE, {});

  return (
    <Skeleton
      loading={loading}
      title
      more
      columns={2}
      rows={5}
      className={styles.recommend}
    >
      {data.map(({ class_name, id, videoList }: any) => (
        <Mold
          key={`class_name-${id}`}
          title={class_name}
          style={{ fontSize: 14, color: '#262E48' }}
          extraContent={
            <div
              className={styles.more}
              onClick={() => {
                openSidePanel({ submenu: `${class_name}-${id}` });
                clickActionWeblog('action_more', {
                  action_label: `videoE_${id}`,
                });
              }}
            >
              更多{'>'}
            </div>
          }
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, 148px)',
              gridGap: 16,
            }}
          >
            {videoList.map(item => (
              <Item key={item.id} data={item} />
            ))}
          </div>
        </Mold>
      ))}
    </Skeleton>
  );
}
