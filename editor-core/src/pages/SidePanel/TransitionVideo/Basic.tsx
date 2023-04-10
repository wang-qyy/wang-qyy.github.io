import { Button, message } from 'antd';
import classNames from 'classnames';
import {
  newReplaceMGTransfer,
  newAddMGTransfer,
  getCurrentTemplate,
  getCurrentTemplateIndex,
  observer,
} from '@hc/editor-core';

import AutoDestroyVideo from '@/components/AutoDestroyVideo';
import { useSettingPanelInfo } from '@/store/adapter/useGlobalStatus';

import { clickActionWeblog } from '@/utils/webLog';
import { formatFrameToTime } from '@/utils/single';
import React from 'react';
import styles from './index.modules.less';
import { TRANSTION_ANIMATION_LIST } from './varible';
import useTransition from './hook';

/**
 * 基础转场
 */
function BasicTransition() {
  const { checkIsChoosed } = useTransition();
  const { setParams } = useSettingPanelInfo();
  // 当前片段
  const currentTemplate = getCurrentTemplate();

  // 当前片段id
  const templateIndex = getCurrentTemplateIndex();

  return (
    <>
      <div className={styles.transitionTitle}>基础转场</div>
      <div className={styles.transitionDown}>
        {TRANSTION_ANIMATION_LIST.map((data, index) => {
          const choosed = checkIsChoosed(data);
          return (
            <React.Fragment key={`transition-${data.name}`}>
              <div className={styles.transitionItem}>
                <div
                  className={classNames(styles.item, {
                    [styles.active]: choosed,
                  })}
                  style={{ background: 'pink' }}
                  onClick={() => {
                    let params = null;
                    setParams({
                      templateIndex,
                      transitionId: currentTemplate?.endTransfer?.meta.id,
                      resId: data.id,
                    });
                    clickActionWeblog('transition_item_add', {
                      action_label: '基础',
                      asset_id: data?.id || data.key,
                    });
                    if (data.id) {
                      params = {
                        resId: data.id,
                        rt_url: data.sample,
                        rt_preview_url: data.preview,
                        height: data.height,
                        width: data.width,
                        picUrl: data.sample,
                        rt_total_time: formatFrameToTime(data.total_frame),
                        rt_total_frame: data.total_frame,
                        totalTime: formatFrameToTime(data.total_frame),
                      };
                    } else {
                      params = {
                        totalTime: formatFrameToTime(data.total_frame),
                        transition: data.transition,
                      };
                    }
                    if (currentTemplate?.endTransfer) {
                      newReplaceMGTransfer(templateIndex, {
                        ...data,
                        assetInfo: {
                          attribute: params,
                          meta: {
                            type: data.asset_type,
                          },
                        },
                      });
                      message.success('替换成功');
                    } else {
                      newAddMGTransfer(templateIndex, {
                        ...data,
                        assetInfo: {
                          attribute: params,
                          meta: {
                            type: data.asset_type,
                          },
                        },
                      });
                      message.success('添加成功');
                    }
                  }}
                >
                  <AutoDestroyVideo
                    poster={data.imageUrl}
                    src={data.videoUrl}
                  />
                </div>
                {data.name}
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </>
  );
}
export default observer(BasicTransition);
