import { memo } from 'react';
import { getRoleImage } from '@/api/role';
import { useRequest } from 'ahooks';

import Skeleton from '@/components/Skeleton';
import styles from './index.less';
import SimpleShow from './common/SimpleShow';

const RoleMore = ({
  goBack,
  title,
  id: class_id,
}: {
  title: string;
  goBack: () => void;
  id: string;
}) => {
  // 获取起始页面展示数据
  const { data: imageArr = [], loading } = useRequest(
    () => class_id && getRoleImage({ class_id }),
    {
      refreshDeps: [class_id],
      onError: err => {
        console.log('出错啦！！列表加载失败', err);
      },
    },
  );

  return (
    <Skeleton
      loading={loading}
      rows={5}
      style={{
        overflow: 'hidden',
        paddingTop: 16,
        paddingRight: 0,
      }}
    >
      <div className={styles.RolePageWarp} style={{ overflowY: 'hidden' }}>
        <SimpleShow
          title={title}
          bindClickMore={goBack}
          data={imageArr}
          buttonShow
          isMore
        />
      </div>
    </Skeleton>
  );
};

export default memo(RoleMore);
