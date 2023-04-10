import { message } from 'antd';
import {
  addMGTransfer,
  getCurrentTemplateIndex,
  useCurrentTemplate,
  observer,
} from '@hc/editor-core';

import { useRequest } from 'ahooks';
import { getVideoETransition } from '@/api/videoE';
import { checkIsSelectedTransfer } from '@/pages/SidePanel/TransitionVideo/handler';
import TransitionItem from '../TransitionItem';
import '../index.less';

const TransitionList = observer(() => {
  const { template } = useCurrentTemplate();

  function setMGTransfer(transition: any) {
    const params = {
      resId: transition.id,
      rt_url: transition.sample,
      rt_preview_url: transition.preview,
      rt_frame_url: transition.preview,
      rt_total_frame: transition.total_frame,
      rt_frame_file: transition.frame_file,
      height: transition.height,
      width: transition.width,
    };

    addMGTransfer(getCurrentTemplateIndex(), { attribute: params });
    message.success('转场设置成功');
  }
  // 获取起始页面展示数据
  const { data, loading } = useRequest(getVideoETransition, {
    onError: err => {
      console.log('出错啦！！列表加载失败', err);
    },
  });
  return (
    <>
      <div className="designer-transition-label">特效转场</div>
      <div className="designer-transition-list">
        {(data?.items || []).map((transition: any) => (
          <TransitionItem
            key={transition.id}
            transition={{
              poster: transition.preview,
              src: transition.sample,
            }}
            onClick={() => setMGTransfer(transition)}
            active={checkIsSelectedTransfer(transition, template)}
          />
        ))}
      </div>
    </>
  );
});

export default TransitionList;
