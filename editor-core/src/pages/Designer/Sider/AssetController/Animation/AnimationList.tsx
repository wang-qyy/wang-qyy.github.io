import { Spin } from 'antd';
import { useRequest } from 'ahooks';
import { getAnimationListV3 } from '@/api/text';

import AnimationList from '@/pages/SidePanel/Animation/AnimationOptionV1';
import style from './index.modules.less';

function Animation({ type, active }: any) {
  const { loading, data } = useRequest(getAnimationListV3);

  return (
    <div className={style.animationListBox}>
      <Spin spinning={loading}>
        {data && <AnimationList type={type} data={data} active={active} />}
      </Spin>
    </div>
  );
}

export default Animation;
