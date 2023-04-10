import { Button, message } from 'antd';
import classNames from 'classnames';
import {
  replaceMGTransfer,
  addMGTransfer,
  getCurrentTemplate,
  getCurrentTemplateIndex,
  observer,
} from '@hc/editor-core';

import { getVideoETransition } from '@/api/videoE';

import AutoDestroyVideo from '@/components/AutoDestroyVideo';
import { useSettingPanelInfo } from '@/store/adapter/useGlobalStatus';

import { clickActionWeblog } from '@/utils/webLog';
import { useRequest } from 'ahooks';
import styles from './index.modules.less';

/**
 * 转场视频
 */
function TransitionVideo() {
  const { setParams } = useSettingPanelInfo();
  // 当前片段
  const currentTemplate = getCurrentTemplate();

  // 当前片段id
  const templateIndex = getCurrentTemplateIndex();
  // 获取起始页面展示数据
  const { data, loading } = useRequest(getVideoETransition, {
    onError: err => {
      console.log('出错啦！！列表加载失败', err);
    },
  });
  return (
    <>
      <div className={styles.transitionTitle}>特效转场</div>
      <div
        className={styles.transitionDown}
        onMouseDown={e => e.preventDefault()}
      >
        {(data?.items || []).map(item => (
          <div
            key={`transition-${item.id}`}
            className={classNames(styles.item, {
              [styles.active]:
                Number(item.id) ===
                Number(currentTemplate?.endTransfer?.attribute.resId),
            })}
            onClick={() => {
              clickActionWeblog('transition_item_add', {
                action_label: '特效',
                asset_id: item?.id,
              });
              setParams({
                templateIndex,
                transitionId: currentTemplate?.endTransfer?.meta.id,
                resId: item.id,
              });

              const params = {
                resId: item.id,
                rt_url: item.sample,
                rt_preview_url: item.preview,
                rt_frame_url: item.preview,
                rt_total_frame: item.total_frame,
                rt_frame_file: item.frame_file,
                height: item.height,
                width: item.width,
              };

              if (currentTemplate?.endTransfer?.attribute.resId) {
                replaceMGTransfer(templateIndex, {
                  attribute: params,
                });
                message.success('替换成功');
              } else {
                addMGTransfer(templateIndex, { attribute: params });
                message.success('添加成功');
              }
            }}
          >
            <AutoDestroyVideo poster={item.preview} src={item.sample} />
          </div>
        ))}
      </div>
    </>
  );
}
export default observer(TransitionVideo);
