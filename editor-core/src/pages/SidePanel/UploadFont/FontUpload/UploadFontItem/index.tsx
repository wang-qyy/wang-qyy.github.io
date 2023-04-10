import React, { useState, useEffect } from 'react';
import { Progress, message } from 'antd';
import {
  CheckCircleFilled,
  CloseCircleFilled,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useFileUpload } from '@/pages/SidePanel/Upload/handler.ts';
import styles from './index.less';

function UploadFontItem(props: any) {
  const { data, successUpload, bindUploadFontState } = props;
  const [percent, setPercent] = useState(0);
  const [uploadState, setUploadState] = useState(0);

  const { uploadStat } = useFileUpload({
    onSucceed: res => {
      if (res.message === 'parseFailed') {
        bindUploadFontState(data.uid, -2);
        setUploadState(-2);
        message.error('文件解析失败');
      } else {
        setPercent(100);
        bindUploadFontState(data.uid, 1);
        setUploadState(1);
        setTimeout(() => {
          successUpload(data.uid);
        }, 1000);
      }
    },

    setProgress({ progress }) {
      if (data.state !== 2) {
        setUploadState(2);
        bindUploadFontState(data.uid, 2);
      }
      setPercent(progress);
    },
    onError(res, { isNotAllow, bindPhone } = {}) {
      bindUploadFontState(data.uid, -1);
      setUploadState(-1);
      message.error(res?.msg);
    },
  });
  useEffect(() => {
    switch (data.state) {
      case 0: // 等待上传
        uploadStat(data);
        break;
    }
  }, [data, data.state, uploadStat]);

  const BindState = (uploadState: number) => {
    switch (uploadState) {
      case 2:
        return (
          <div className={styles.uploadFontItemTopRight}>
            正在上传{percent}%
          </div>
        );
      case 1:
        return (
          <div className={styles.uploadFontItemCheckCircleFilled}>
            <CheckCircleFilled
              className={styles.uploadFontItemCheckCircleFilledIcon}
            />
            上传成功
          </div>
        );
      case -1:
        return (
          <div
            className={styles.uploadFontItemClose}
            onClick={() => {
              setUploadState(0);
              uploadStat(data);
            }}
          >
            <CloseCircleFilled className={styles.uploadFontItemCloseIcon} />
            <span className={styles.uploadFontItemCloseSpan}>重新上传</span>
          </div>
        );
      case -2:
        return (
          <div
            className={styles.uploadFontItemClose}
            onClick={() => {
              setUploadState(0);
              uploadStat(data);
            }}
          >
            <ExclamationCircleOutlined
              className={styles.uploadFontItemCloseIcon1}
            />
            <span className={styles.uploadFontItemCloseSpan}>重新上传</span>
          </div>
        );
      default:
        break;
    }
  };

  return (
    <div className={styles.uploadFontItem}>
      <div className={styles.uploadFontItemTop}>
        <div className={styles.uploadFontItemTopName}>{data.name}</div>
        {BindState(uploadState)}
      </div>
      <Progress
        className={styles.uploadFontItemProgress}
        percent={percent}
        showInfo={false}
      />
    </div>
  );
}

export default UploadFontItem;
