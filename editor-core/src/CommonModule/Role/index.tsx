import { useRequest } from 'ahooks';
import { getMixrole } from '@/api/role';

import Skeleton from '@/components/Skeleton';

import { PropsWithChildren, useState } from 'react';
import SimpleShow from './common/SimpleShow';
import styles from './index.less';
import RoleMore from './RoleMore';

type RolePageTheme = 'dark' | 'light';

interface RolePageProps {
  theme?: RolePageTheme;
}

const RolePage = ({ theme = 'light' }: PropsWithChildren<RolePageProps>) => {
  const [more, setMore] = useState<{ class_name: string; id: string }>();

  // 获取起始页面展示数据
  const { data = [], loading } = useRequest(getMixrole, {
    onError: err => {
      console.log('出错啦！！列表加载失败', err);
    },
  });

  return (
    <>
      {more ? (
        <RoleMore
          id={more.id}
          title={more.class_name}
          goBack={() => setMore(undefined)}
        />
      ) : (
        <Skeleton
          loading={loading}
          rows={5}
          title
          more
          style={{
            paddingTop: 16,
            paddingRight: 0,
            overflow: 'hidden',
          }}
        >
          <div className={styles.RolePageWarp}>
            {data.map((item: any) => {
              return (
                <SimpleShow
                  key={item.id}
                  title={item.class_name}
                  bindClickMore={() => {
                    setMore({ class_name: item.class_name, id: item.id });
                    // openSidePanel('role', `${item.class_name}-${item.id}`);
                  }}
                  data={item?.sub_list.slice(0, 3)}
                  id={item.id}
                  isMore={false}
                  buttonShow={item?.sub_list.length > 3}
                />
              );
            })}
          </div>
        </Skeleton>
      )}
    </>
  );
};

export default RolePage;
