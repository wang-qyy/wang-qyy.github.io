import { message } from 'antd';
import {
  newReplaceMGTransfer,
  newAddMGTransfer,
  getCurrentTemplate,
  getCurrentTemplateIndex,
  useCurrentTemplate,
  observer,
} from '@hc/editor-core';
import { formatFrameToTime } from '@/utils/single';

import { TRANSTION_ANIMATION_LIST } from '@/pages/SidePanel/TransitionVideo/varible';
import { checkIsSelectedTransfer } from '@/pages/SidePanel/TransitionVideo/handler';

import '../index.less';
import TransitionItem from '../TransitionItem';

const BasicTransitions = observer(() => {
  const { template } = useCurrentTemplate();

  // 添加基础转场
  function setNewMGTransfer(transition: any) {
    const attribute = {
      resId: transition.key,
      totalTime: formatFrameToTime(transition.total_frame),
      transition: transition.transition,
    };

    const params = {
      ...transition,
      assetInfo: {
        attribute,
        meta: {
          type: transition.asset_type,
        },
      },
    };
    const index = getCurrentTemplateIndex();
    if (getCurrentTemplate().endTransfer) {
      newReplaceMGTransfer(index, params);
    } else {
      newAddMGTransfer(index, params);
    }
    message.success('转场设置成功');
  }

  return (
    <>
      <div className="designer-transition-label">基础转场</div>
      <div className="designer-transition-list">
        {TRANSTION_ANIMATION_LIST.map(transition => (
          <TransitionItem
            key={transition.name}
            transition={{
              poster: transition.imageUrl,
              src: transition.videoUrl,
              name: transition.name,
            }}
            onClick={() => setNewMGTransfer(transition)}
            active={checkIsSelectedTransfer(transition, template)}
          />
        ))}
      </div>
    </>
  );
});
export default BasicTransitions;
