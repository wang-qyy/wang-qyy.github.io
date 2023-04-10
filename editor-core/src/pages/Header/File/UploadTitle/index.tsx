import React from 'react';
import { message } from 'antd';
import { handleSave } from '@/utils/userSave';
import ModifyName from '@/components/ModifyName';

import styles from './index.less';

function UploadTitle(props: {
  templateTitle: any;
  updateTitle: (value: string) => void;
}) {
  const { templateTitle, updateTitle } = props;

  const alterName = async (value: string) => {
    const newValue = value || '未命名的设计';
    if (value !== templateTitle) {
      // await updateTitle(newValue);
      await handleSave({
        info: { title: newValue },
        onSuccess: res => {
          if (res.stat === 1) {
            updateTitle(newValue);
            message.success('修改成功');
          }
        },
      });
    }
  };

  return (
    <ModifyName
      templateTitle={templateTitle}
      alterName={alterName}
      styles={styles}
    />
  );
}

export default UploadTitle;
