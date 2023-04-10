import { useRequest } from 'ahooks';
import Mold from '@/pages/Designer/Sider/components/Mold';
import Skeleton from '@/components/Skeleton';

import { getVideoEEffect } from '@/api/videoE';
import { useLeftSideInfo } from '@/store/adapter/useGlobalStatus';
import { clickActionWeblog } from '@/utils/webLog';
import { useEffect } from 'react';
import Item from '../Item';

import styles from './index.modules.less';

export default function Recommend({
  onChange,
}: {
  onChange: (val: string) => void;
}) {
  const { openSidePanel } = useLeftSideInfo();

  const { data, loading } = useRequest(getVideoEEffect, {});
  const list = data?.items || [];
  useEffect(() => {
    if (list) {
      let str = '';
      list.forEach((element: any, index: number) => {
        if (index === list.length - 1) {
          str += `${element.id}`;
        } else {
          str += `${element.id},`;
        }
      });
      onChange && onChange(str);
    }
  }, [list]);
  return (
    <Skeleton
      loading={loading}
      title
      more
      columns={2}
      rows={5}
      style={{ overflowY: 'auto', overflowX: 'hidden' }}
    >
      {list.map(({ name, id, list = [] }: any) => (
        <Mold
          key={`class_name-${id}`}
          title={name}
          style={{
            fontSize: 12,
            color: '#262E48',
            fontWeight: 'bold',
          }}
          contentStyle={{
            gridTemplateColumns: 'repeat(auto-fill,152px)',
            gap: 8,
          }}
          extraContent={
            <div
              className={styles.more}
              onClick={() => {
                openSidePanel({ submenu: `${name}-${id}` });
                clickActionWeblog('videoEffect_more', {
                  asset_id: id,
                });
              }}
            >
              更多{'>'}
            </div>
          }
        >
          {list.map(item => (
            <Item
              key={item.gid}
              data={item}
              class_id={id}
              action="videoEffect_add"
            />
          ))}
        </Mold>
      ))}
    </Skeleton>
  );
}
