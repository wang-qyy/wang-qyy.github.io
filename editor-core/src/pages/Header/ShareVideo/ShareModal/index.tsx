/* eslint-disable no-restricted-syntax */
import React, { useEffect, useRef, useState } from 'react';
import NoTitleModal from '@/components/NoTitleModal';
import { Input, Button, Progress } from 'antd';
import { ExclamationCircleFilled } from '@ant-design/icons';
import QRCode from 'qrcode.react';
import { useUpdateTitle } from '@/store/adapter/useTemplateInfo';
import { checkDownloads } from '@/api/pub';
import { useRequest } from 'ahooks';
import { dataActiontype } from '@/utils/webLog';

import copy from 'copy-to-clipboard';

import styles from './index.less';

function ShareModal(props: {
  id: string;
  startSynthesis: () => void;
  setId: (bol: string) => void;
}) {
  const { id, setId, startSynthesis } = props;
  const [progress, setProgress] = useState(0);
  const [url, setUrl] = useState('');
  const [failVisible, setFailVisible] = useState(false);
  const [buttonValue, setButtonValue] = useState('复制链接分享');
  const { value } = useUpdateTitle();

  const inputRef = useRef(null);

  const { run, cancel } = useRequest(checkDownloads, {
    manual: true,
    pollingInterval: 1000,
    pollingWhenHidden: true,
    onSuccess: (result, params) => {
      const res = result[params[0][0]];
      if (res) {
        if (res.status === 'success' || res.progress === 100) {
          if (res.type === 'share') {
            cancel();
            setId('');
            setUrl(`${res.url}`);
            dataActiontype('ShareVideo', 'pupOpen');
          }
        }
        if (res.status === 'fail' || res.status === 'recombined') {
          setId('');
          setFailVisible(true);
        }
        setProgress(res?.progress);
      }
    },
  });

  const bindShare = () => {
    dataActiontype('ShareVideo', 'clickCopy');
    const inputElement = inputRef.current;
    inputElement.select(); // 选中input框的内容

    copy(`${url}${value}`);

    setButtonValue('链接已复制成功');
  };

  useEffect(() => {
    if (id) {
      run([id]);
    }
  }, [id]);

  return (
    <div>
      <NoTitleModal
        visible={id !== ''}
        footer={false}
        width={611}
        centered
        closable={false}
        zIndex={99999999999}
      >
        <div className={styles.synthesisModal}>
          <div className={styles.synthesisModalTitle}>
            分享视频正在努力加载中
          </div>
          <Progress
            percent={progress}
            className={styles.synthesisModalProgress}
          />
          <div className={styles.synthesisModalFooter}>
            视频资源组件整合中,预计大约1分钟
          </div>
        </div>
      </NoTitleModal>
      <NoTitleModal
        visible={url !== ''}
        onCancel={() => {
          setUrl('');
        }}
        footer={false}
        width={717}
        centered
        zIndex={99999999999}
      >
        <div className={styles.successModal}>
          <div className={styles.successModalTitle}>分享视频预览</div>
          <div className={styles.successModalQRcode}>
            <QRCode className="QRCode" value={url} size={116} />
          </div>
          <div className={styles.successModalText}>手机扫码分享</div>
          <div className={styles.successModalFooter}>
            <div className={styles.footerTitle}>分享视频链接</div>
            <Input.Group compact>
              <Input
                ref={inputRef}
                className={styles.footerInput}
                style={{ width: 'calc(100% - 130px)' }}
                defaultValue={`${url}${value}`}
                value={`${url}${value}`}
              />
              <Button
                className={styles.footerButton}
                type="primary"
                onClick={bindShare}
              >
                {buttonValue}
              </Button>
            </Input.Group>
          </div>
        </div>
      </NoTitleModal>
      <NoTitleModal
        visible={failVisible}
        onCancel={() => {}}
        footer={false}
        width={511}
        centered
        zIndex={99999999999}
      >
        <div className={styles.fillModal}>
          <ExclamationCircleFilled className={styles.fillModalIcon} />
          <div className={styles.fillModalText}>
            哎呀,视频资源丢失,可能需要您再重新生成一下哦!
          </div>
          <Button
            type="primary"
            className={styles.fillModalButton}
            onClick={() => {
              setFailVisible(false);
              startSynthesis();
            }}
          >
            重新生成
          </Button>
        </div>
      </NoTitleModal>
    </div>
  );
}

export default ShareModal;
