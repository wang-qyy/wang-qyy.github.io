import { useRequest } from 'ahooks';
import Mold from '@/pages/Designer/Sider/components/Mold';
import Skeleton from '@/components/Skeleton';

import { getRecommendMask } from '@/api/maskPanel';
import { useLeftSideInfo } from '@/store/adapter/useGlobalStatus';
import { clickActionWeblog } from '@/utils/webLog';

import { stopPropagation } from '@/utils/single';
import Item from '../Item';

import styles from './index.modules.less';

export default function Recommend({
  setPreview,
  onAdd,
}: {
  setPreview: (data: any) => void;
  onAdd: (data: any) => void;
}) {
  const { openSidePanel } = useLeftSideInfo();

  const { data = [], loading } = useRequest(getRecommendMask, {});

  return (
    <Skeleton
      loading={loading}
      title
      more
      columns={2}
      rows={5}
      className={styles.module}
    >
      {data.map(({ class_name, id, recommendInfo }: any) => (
        <Mold
          key={`class_name-${id}`}
          title={class_name}
          style={{ fontSize: 14, color: '#262E48' }}
          extraContent={
            <div
              className={styles.more}
              onClick={e => {
                stopPropagation(e);
                openSidePanel({
                  menu: 'module',
                  submenu: `${class_name}-${id}`,
                });
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
            {recommendInfo.map((item: any) => (
              <Item
                key={item.id}
                data={item}
                setPreview={setPreview}
                onAdd={onAdd}
              />
            ))}
          </div>
        </Mold>
      ))}
    </Skeleton>
  );
}
