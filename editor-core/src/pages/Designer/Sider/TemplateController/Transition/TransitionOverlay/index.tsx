import { message } from 'antd';
import {
  newReplaceMGTransfer,
  newAddMGTransfer,
  getCurrentTemplate,
  getCurrentTemplateIndex,
  useCurrentTemplate,
  observer,
} from '@hc/editor-core';
import React, { useRef } from 'react';
import { useRequest } from 'ahooks';
import { getOverlayTransitionList } from '@/api/material';
import { checkIsSelectedTransfer } from '@/pages/SidePanel/TransitionVideo/handler';
import { formatFrameToTime } from '@/utils/single';

import TransitionItem from '../TransitionItem';

import '../index.less';
import TransitionAction from '../TransitionAction';

const TransitionOverlay = observer(() => {
  const listRef = useRef(null);

  const { template } = useCurrentTemplate();

  function setMGTransfer(item: any) {
    const params = {
      resId: item.id,
      rt_url: item.sample,
      rt_preview_url: item.preview,
      height: Number(item.height),
      width: Number(item.width),
      picUrl: item.sample,
      rt_total_time: formatFrameToTime(item.total_frame),
      rt_total_frame: item.total_frame,
      totalTime: formatFrameToTime(item.total_frame),
    };
    const index = getCurrentTemplateIndex();
    const attr = {
      ...item,
      assetInfo: {
        attribute: params,
        meta: {
          type: item.asset_type,
        },
      },
    };
    if (getCurrentTemplate().endTransfer) {
      newReplaceMGTransfer(index, attr);
    } else {
      newAddMGTransfer(index, attr);
    }
    message.success('转场设置成功');
  }
  // 获取起始页面展示数据
  const { data, loading } = useRequest(getOverlayTransitionList, {
    onError: err => {
      console.log('出错啦！！列表加载失败', err);
    },
  });
  return (
    <>
      <div className="designer-transition-label">遮罩转场</div>
      <div className="designer-transition-list" ref={listRef}>
        {(data?.items || []).map((transition: any, index: number) => (
          <React.Fragment key={`transition-${transition.id}`}>
            <TransitionItem
              key={transition.id}
              transition={{
                poster: transition.preview,
                src: transition.play_url,
              }}
              onClick={() => setMGTransfer(transition)}
              active={checkIsSelectedTransfer(transition, template)}
              actionDom={({ itemRef }: { itemRef: any }) => {
                return <TransitionAction itemRef={itemRef} listRef={listRef} />;
              }}
            />
          </React.Fragment>
        ))}
      </div>
    </>
  );
});

export default TransitionOverlay;
