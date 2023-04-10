import React, { useState, useEffect } from 'react';
import NoTitleModal from '@/components/NoTitleModal';
import { message, Input, Button } from 'antd';
import { getCopyDraft } from '@/api/template';
import { handleSave } from '@/utils/userSave';
import { stopPropagation } from '@/utils/single';
import { clickActionWeblog } from '@/utils/webLog';
import styles from './index.less';

function CreateCopy(props: { templateTitle: any }) {
  const { templateTitle } = props;
  const [visible, setVisible] = useState(false);
  const [value, setValue] = useState(`${templateTitle}-副本`);

  const bindOk = () => {
    const title =
      value == '' || value == templateTitle ? `${templateTitle}-副本` : value;
    handleSave({
      onSuccess: res => {
        if (res.stat === 1) {
          getCopyDraft({
            id: res?.info?.id,
            title,
          }).then(res => {
            if (res.code === 0) {
              setVisible(false);
              message.success('创建副本成功');
              window.open(res?.data?.editPath, '_blank');
            } else if (
              res.code === 1005 &&
              res.data?.message === 'contentBlock'
            ) {
              message.error('系统检测当前文本存在违规嫌疑');
              setValue(`${templateTitle}-副本`);
            } else {
              message.error(res.msg);
            }
          });
        }
      },
    });
  };

  useEffect(() => {
    setValue(`${templateTitle}-副本`);
  }, [templateTitle]);

  return (
    <>
      <div
        onClick={() => {
          clickActionWeblog('createBackup');
          setVisible(true);
        }}
        className={styles.createCopy}
      >
        创建副本
      </div>
      <NoTitleModal
        visible={visible}
        width={319}
        onCancel={() => {
          setVisible(false);
        }}
        footer={null}
      >
        <div className={styles.fileModal}>
          <div className={styles.fileModalTitle}>另存为</div>
          <Input
            onKeyDown={stopPropagation}
            value={value}
            onChange={e => setValue(e.target.value)}
            bordered={false}
          />
          <div className={styles.fileModalLine} />
          <div className={styles.fileModalFooter}>
            <Button
              className={styles.fileModalFooterButton}
              onClick={() => {
                setVisible(false);
              }}
            >
              取消
            </Button>
            <Button type="primary" onClick={bindOk}>
              确认
            </Button>
          </div>
        </div>
      </NoTitleModal>
    </>
  );
}

export default CreateCopy;
