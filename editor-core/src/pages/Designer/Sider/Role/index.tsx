import { useEffect, useMemo } from 'react';
import { useSetState, useRequest } from 'ahooks';

import { getMixrole } from '@/api/role';
import { useAsideWidth } from '@/store/adapter/useDesigner';
import SimpleShow from './common/SimpleShow';
import styles from './index.less';

interface State {
  roleArr: Array<object>;
}
const RolePage = (Props: { getMore: (title: string) => void }) => {
  const { getMore } = Props;
  const [state, setState] = useSetState<State>({
    roleArr: [],
  });

  const { width } = useAsideWidth();

  const col = useMemo(() => {
    if (width > 860) return 7;
    if (width > 760) return 6;
    if (width > 650) return 5;
    return 4;
  }, [width]);

  // 获取起始页面展示数据
  const { run } = useRequest(getMixrole, {
    manual: true,
    onSuccess: res => {
      const arr = res;
      setState({
        roleArr: arr,
      });
    },
    onError: err => {
      console.log('出错啦！！列表加载失败', err);
    },
  });
  useEffect(() => {
    run();
  }, []);

  return (
    <div className={styles.RolePageWarp}>
      {state.roleArr.map((item: any) => {
        return (
          <SimpleShow
            key={item.id}
            title={item.class_name}
            bindClickMore={getMore}
            id={item.id}
            data={item?.sub_list.slice(0, col)}
            isMore={false}
            buttonShow={item?.sub_list.length > col}
          />
        );
      })}
    </div>
  );
};

export default RolePage;
