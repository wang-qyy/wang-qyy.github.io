import { Button, message } from 'antd';
import classNames from 'classnames';
import {
  newReplaceMGTransfer,
  newAddMGTransfer,
  getCurrentTemplate,
  getCurrentTemplateIndex,
  observer,
} from '@hc/editor-core';
import { useSettingPanelInfo } from '@/store/adapter/useGlobalStatus';

import { clickActionWeblog } from '@/utils/webLog';
import { formatFrameToTime } from '@/utils/single';
import React from 'react';
import { useRequest } from 'ahooks';
import { getOverlayTransitionList } from '@/api/material';
import Lottie from '@/components/Lottie';
import AutoDestroyVideo from '@/components/AutoDestroyVideo';
import styles from './index.modules.less';
import TransitionAction from './TransitionAction';
import useTransition from './hook';

/**
 * 转场遮罩
 */
function OverlayTransition() {
  const { setParams } = useSettingPanelInfo();
  // 当前片段
  const currentTemplate = getCurrentTemplate();

  // 当前片段id
  const templateIndex = getCurrentTemplateIndex();
  const { checkIsChoosed } = useTransition();
  const checkHasActive = (list: any[], index: number) => {
    let hasActive = false;
    // 每行最后一位
    if ((index + 1) % 2 === 0 || index === list.length - 1) {
      const resIndex = list.findIndex(t => checkIsChoosed(t));
      // 该list没有被选中
      if (resIndex === -1) return hasActive;
      // 在同一行
      if (Math.floor(resIndex / 2) === Math.floor(index / 2)) {
        hasActive = true;
      }
    }
    return hasActive;
  };
  // 获取起始页面展示数据
  const { data, loading } = useRequest(getOverlayTransitionList, {
    onError: err => {
      console.log('出错啦！！列表加载失败', err);
    },
  });
  return (
    <>
      <div className={styles.transitionTitle}>遮罩转场</div>
      <div className={styles.transitionDown}>
        {(data?.items || []).map((item, index) => {
          const choosed = checkIsChoosed(item);
          return (
            <React.Fragment key={`transition-${item.id}`}>
              <div className={styles.transitionItem}>
                <div
                  className={classNames(styles.item, {
                    [styles.active]: choosed,
                  })}
                  onClick={() => {
                    let params = null;
                    setParams({
                      templateIndex,
                      transitionId: currentTemplate?.endTransfer?.meta.id,
                      resId: item.id,
                    });
                    clickActionWeblog('transition_item_add', {
                      action_label: '遮罩',
                      asset_id: item?.id || item.key,
                    });
                    if (item.id) {
                      params = {
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
                    } else {
                      params = {
                        totalTime: formatFrameToTime(item.total_frame),
                        transition: item.transition,
                      };
                    }
                    if (currentTemplate?.endTransfer) {
                      newReplaceMGTransfer(templateIndex, {
                        ...item,
                        assetInfo: {
                          attribute: params,
                          meta: {
                            type: item.asset_type,
                          },
                        },
                      });
                      message.success('替换成功');
                    } else {
                      newAddMGTransfer(templateIndex, {
                        ...item,
                        assetInfo: {
                          attribute: params,
                          meta: {
                            type: item.asset_type,
                          },
                        },
                      });
                      message.success('添加成功');
                    }
                  }}
                >
                  {item?.play_url ? (
                    <AutoDestroyVideo
                      poster={item.preview}
                      src={item.play_url}
                    />
                  ) : (
                    <Lottie path={item.sample} preview={item.preview} />
                  )}
                </div>
                {item.title}
              </div>
              {checkHasActive(data?.items || [], index) && <TransitionAction />}
            </React.Fragment>
          );
        })}
      </div>
    </>
  );
}
export default observer(OverlayTransition);
