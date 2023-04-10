import { CSSProperties, PropsWithChildren, useState } from 'react';
import { useThrottleFn } from 'ahooks';
import classNames from 'classnames';

import {
  useAssetZIndexByObserver,
  updateAssetZIndex,
  observer,
} from '@hc/editor-core';
import OverwritePopover from '@/components/OverwritePopover';
import { clickActionWeblog } from '@/utils/webLog';
import { XiuIcon } from '@/components';
import styles from './index.less';

interface LayerSelectProps {
  className?: string;
  style?: CSSProperties;
}

const LayerSelect = (props: PropsWithChildren<LayerSelectProps>) => {
  const { className, ...others } = props;

  // todo 方法调用异常
  const { zIndex, maxZIndex, minZIndex } = useAssetZIndexByObserver();
  const { run: onChangelayer } = useThrottleFn(
    (val: string) => {
      // todo 方法调用异常
      updateAssetZIndex({ direction: val });
      clickActionWeblog('tool_assetLayerZIndex', { action_label: val });
    },
    { wait: 200 },
  );

  return (
    <div className={styles.toolSelectView}>
      <div
        className={classNames(styles.toolSelectItem, {
          [styles.disabled]: (zIndex || 0) >= maxZIndex,
        })}
        onClick={() => {
          if (zIndex <= maxZIndex) {
            onChangelayer('top');
          }
        }}
      >
        <XiuIcon
          type="iconic_round-flip-to-front"
          style={{ fontSize: 20, marginRight: 4 }}
        />
        置于顶层
      </div>
      <div
        className={classNames(styles.toolSelectItem, {
          [styles.disabled]: (zIndex || 0) >= maxZIndex,
        })}
        onClick={() => {
          if (zIndex <= maxZIndex) {
            onChangelayer('up');
          }
        }}
      >
        <XiuIcon
          type="icongg_move-up"
          style={{ fontSize: 20, marginRight: 4 }}
        />
        向上一层
      </div>
      <div
        className={classNames(styles.toolSelectItem, {
          [styles.disabled]: (zIndex || 0) <= minZIndex,
        })}
        onClick={() => {
          if (zIndex >= minZIndex) {
            onChangelayer('down');
          }
        }}
      >
        <XiuIcon
          type="icongg_move-down"
          style={{ fontSize: 20, marginRight: 4 }}
        />
        向下一层
      </div>
      <div
        className={classNames(styles.toolSelectItem, {
          [styles.disabled]: (zIndex || 0) <= minZIndex,
        })}
        onClick={() => {
          if (zIndex >= minZIndex) {
            onChangelayer('bottom');
          }
        }}
      >
        <XiuIcon
          type="iconic_round-flip-to-back"
          style={{ fontSize: 20, marginRight: 4 }}
        />
        置于底层
      </div>
    </div>
  );
};
export default observer(LayerSelect);
