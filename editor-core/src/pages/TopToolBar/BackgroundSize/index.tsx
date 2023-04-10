import { useState, useEffect } from 'react';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { assetUpdater } from '@hc/editor-core';
import { message } from 'antd';
import { useBackgroundSet } from '@/hooks/useBackgroundSet';
import OverwriteSlider from '@/components/OverwriteSlider';

import { useBackgroundControl } from '@/store/adapter/useGlobalStatus';
import { useDebounceFn } from 'ahooks';
import { clickActionWeblog } from '@/utils/webLog';
import styles from './index.less';

function BackgroundSize() {
  const {
    bindOk,
    applyAll,
    backgroundModerate,
    backgroundFill,
    updateSize,
    backSize,
    backgroundAsset,
  } = useBackgroundSet();

  const { endCliping } = useBackgroundControl();

  const [oldData, setOldData] = useState<any>();

  useEffect(() => {
    setOldData(backgroundAsset);
  }, []);

  // 确认
  const onOk = () => {
    endCliping();
  };

  // 适中
  const onModerate = () => {
    clickActionWeblog('background_003');
    backgroundModerate();
  };

  // 填充
  const onFill = () => {
    clickActionWeblog('background_004');

    backgroundFill();
  };

  // 背景应用所有场景
  const onAllApplications = () => {
    clickActionWeblog('background_005');
    applyAll(() => {
      // message.config({
      //   top: 100,
      //   duration: 3,
      //   maxCount: 1,
      // });
      // message.success('替换成功');

      message.success({
        content: '替换成功',
        top: 100,
        duration: 3,
        maxCount: 1,
      });
    });
  };

  const { run: logSize } = useDebounceFn(
    () => {
      clickActionWeblog('background_001');
    },
    { wait: 500 },
  );

  return (
    <>
      <div className={styles.left}>
        <OverwriteSlider
          value={backSize}
          onChange={value => {
            logSize();
            updateSize(value / 100);
          }}
          inputNumber
          style={{ width: 216 }}
          tooltipVisible={false}
          min={5}
          max={200}
          step={1}
        />
        <div className={styles.itemTxt} onClick={onModerate}>
          适中
        </div>
        <div className={styles.itemTxt} onClick={onFill}>
          填充
        </div>
        <div className={styles.itemTxt1} onClick={onAllApplications}>
          背景应用所有场景
        </div>
      </div>
      <div className={styles.right}>
        <div className={styles.rightItem} onClick={onOk}>
          <CheckOutlined className={styles.rightItemIcon} />
          确认
        </div>
        {/* <div className={styles.rightItem} onClick={onCancel}>
          <CloseOutlined className={styles.rightItemIcon} />
          取消
        </div> */}
      </div>
    </>
  );
}

export default BackgroundSize;
