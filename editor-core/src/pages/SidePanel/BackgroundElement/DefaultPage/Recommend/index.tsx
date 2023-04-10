import { useEffect, useState } from 'react';
import { useRequest } from 'ahooks';
import Mold from '@/pages/Designer/Sider/components/Mold';
import Skeleton from '@/components/Skeleton';

import { getSubFronts } from '@/api/background';
import { useLeftSideInfo } from '@/store/adapter/useGlobalStatus';
import { clickActionWeblog } from '@/utils/webLog';
import List from '../../List';

import './index.less';

export default function Recommend(props: { type: string; shape: string }) {
  const { type, shape } = props;
  const { openSidePanel } = useLeftSideInfo();

  const [data, _data] = useState([]);
  // 视频图片对应版型的接口参数id
  const idObj = {
    VB: {
      h: '1230806',
      w: '1230805',
      c: '1230807',
    },
    GP: {
      h: '1230810',
      w: '1230809',
      c: '1230811 ',
    },
  };
  const { run, loading } = useRequest(getSubFronts, {
    manual: true,
    onSuccess: res => {
      _data(res?.items);
    },
  });

  useEffect(() => {
    run(idObj[type][shape]);
  }, [shape]);
  return (
    <Skeleton
      loading={loading}
      title
      more
      columns={2}
      rows={5}
      style={{
        marginTop: '5px',
        overflowY: 'auto',
        overflowX: 'hidden',
      }}
    >
      {data?.map(({ name, id, list }: any) => (
        <Mold
          key={`class_name-${id}`}
          title={name}
          style={{
            fontSize: 12,
            alignItems: 'start',
            height: 26,
            lineHeight: '12px',
            color: '#262E48',
          }}
          extraContent={
            <div
              onClick={() => {
                openSidePanel({
                  submenu: `${name}-${type}-${id}-${shape}`,
                });
                const action_label = type === 'VB' ? 'video' : 'image';
                clickActionWeblog('bgModule_007', { action_label });
              }}
              style={{
                fontSize: 12,
                fontWeight: 400,
                color: '#7e8aa9',
              }}
            >
              更多{'>'}
            </div>
          }
          contentStyle={{ display: 'block', marginBottom: 18 }}
        >
          <List list={list} type={type} shape={shape} isSearch={false} />
        </Mold>
      ))}
    </Skeleton>
  );
}
