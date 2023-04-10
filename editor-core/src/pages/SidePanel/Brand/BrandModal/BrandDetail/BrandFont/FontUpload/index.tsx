import React, { useState } from 'react';
import { Upload, Progress, message } from 'antd';
import NoTitleModal from '@/components/NoTitleModal';
import { useUserBindPhoneModal } from '@/store/adapter/useGlobalStatus';
import { useFileUpload } from '@/pages/SidePanel/Upload/handler';
import styles from './index.less';

function FontUpload(props: any) {
  const { children, uploadSucceed } = props;
  const [visible, _visible] = useState(false);
  const [status, _status] = useState('');
  const [progress, _progress] = useState(0);
  const { showBindPhoneModal } = useUserBindPhoneModal();

  const { uploadStat } = useFileUpload({
    onSucceed: res => {
      if (res.message === 'parseFailed') {
        message.error('文件解析失败');
        _status('文件解析失败');
      } else {
        setTimeout(() => {
          _status('上传成功');
          uploadSucceed && uploadSucceed();
          _visible(false);
        }, 1000);
      }
    },

    setProgress({ progress }) {
      _progress(progress);
    },
    onError(res, { isNotAllow, bindPhone } = {}) {
      _status('上传失败');
      message.error(res?.msg);
      if (bindPhone) {
        showBindPhoneModal();
      }
    },
  });

  const beforeUpload = file => {
    uploadStat(file);
    _status('正在上传中…');
    _visible(true);
  };
  const close = () => {
    _visible(false);
  };
  return (
    <>
      <NoTitleModal
        visible={visible}
        width={435}
        onCancel={close}
        footer={null}
      >
        <div className={styles.uploadProgress}>
          <div className={styles.uploadProgressTitle}>{status}</div>
          <Progress
            strokeColor="#5A4CDB"
            trailColor="#EFEFEF"
            percent={progress}
            showInfo={false}
          />
        </div>
      </NoTitleModal>
      <Upload
        openFileDialogOnClick
        showUploadList={false}
        beforeUpload={beforeUpload}
        style={{ height: '100%', cursor: 'auto' }}
        accept=".ttf,.otf"
      >
        <div
          onClick={e => {
            // e.stopPropagation();
            // e.preventDefault();
          }}
        >
          {children}
        </div>
      </Upload>
    </>
  );
}

export default FontUpload;
