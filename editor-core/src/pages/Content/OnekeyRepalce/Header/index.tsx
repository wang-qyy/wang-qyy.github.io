import { Button } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { XiuIcon } from '@/components';
import { useAssetReplaceModal } from '@/store/adapter/useGlobalStatus';
import useCanvasPlayHandler from '@/hooks/useCanvasPlayHandler';
import { useHistoryRecordByObserver, observer } from '@hc/editor-core';

import classNames from 'classnames';
import { clickActionWeblog } from '@/utils/webLog';
import styles from './index.less';
import oneKeyReplaceStore from '../store';

const Header = () => {
  const { value, goNext, goPrev } = useHistoryRecordByObserver();
  const { open } = useAssetReplaceModal();
  const { pauseVideo } = useCanvasPlayHandler();
  const { resAssets } = oneKeyReplaceStore;
  const replacedList = resAssets.filter(t => t.replaced);
  const openReplace = () => {
    open('replace-batch');
    pauseVideo();
    clickActionWeblog('onkeyReplace_002');
  };
  const disabled = replacedList.length === resAssets.length;
  return (
    <div className={styles.Header}>
      <div className={styles.top}>替换素材</div>
      <div className={styles.bottom}>
        <div className={styles.left}>
          <div className={styles.leftText}>
            <span className={styles.replace}>{resAssets.length}</span>
            张图片/视频，已替换
            <span className={styles.replace}>{replacedList.length}</span>张
          </div>
          <Button
            disabled={disabled}
            onClick={openReplace}
            className={styles.replaceButton}
            size="small"
          >
            一键替换
            <div
              className={classNames(
                'animate__animated animate__bounce animate__pulse animate__infinite',
                styles.newFun,
              )}
            />
          </Button>
          {disabled && (
            <div className={styles.leftTip}>
              <ExclamationCircleOutlined className={styles.icon} />
              批量替换图片/视频已达上限,请单击单个图片/视频进行替换
            </div>
          )}
        </div>
        <div className={styles.right}>
          <div
            className={classNames(styles.button, {
              [styles.buttonDisabled]: !value.hasPrev,
            })}
            onClick={() => {
              if (value.hasPrev) {
                goPrev();
              }
              clickActionWeblog('onkeyReplace_003');
            }}
          >
            <XiuIcon type="iconchexiao1" className={styles.icon} />
            上一步
          </div>
          <div
            className={classNames(styles.button, {
              [styles.buttonDisabled]: !value.hasNext,
            })}
            onClick={() => {
              if (value.hasNext) {
                goNext();
              }
              clickActionWeblog('onkeyReplace_004');
            }}
          >
            <XiuIcon type="iconchexiao1" className={styles.iconNext} />
            下一步
          </div>
        </div>
      </div>
    </div>
  );
};

export default observer(Header);
