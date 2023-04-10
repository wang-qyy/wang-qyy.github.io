import { useEffect, memo } from 'react';
import { getRoleImage } from '@/api/role';
import { useSetState, useRequest } from 'ahooks';
import { useSetRoleMoreName } from '@/store/adapter/useDesigner';
import styles from './index.less';
import SimpleShow from './common/SimpleShow';

interface State {
  imageArr: Array<object>;
}
const RoleMore = (Props: { getMore: (title: string) => void }) => {
  const { getMore } = Props;
  const { roleMoreName } = useSetRoleMoreName();
  const [state, setState] = useSetState<State>({
    imageArr: [],
  });

  // 获取起始页面展示数据
  const { run } = useRequest(getRoleImage, {
    manual: true,
    onSuccess: res => {
      const arr = res;
      setState({
        imageArr: arr,
      });
    },
    onError: err => {
      console.log('出错啦！！列表加载失败', err);
    },
  });

  useEffect(() => {
    setState({
      imageArr: [],
    });
    run({
      class_id: roleMoreName?.id,
    });
  }, [roleMoreName]);
  return (
    <div className={styles.RolePageWarp}>
      <SimpleShow
        title={roleMoreName?.class_name}
        bindClickMore={getMore}
        data={state.imageArr}
        buttonShow
        isMore
      />
    </div>
  );
};

export default memo(RoleMore);
