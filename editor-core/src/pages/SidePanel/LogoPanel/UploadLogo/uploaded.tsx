import { FC } from 'react';
import { observer, deleteLogo } from '@hc/editor-core';
import { Upload, UploadProps, Spin } from 'antd';
import { clickActionWeblog } from '@/utils/webLog';

import styles from './index.modules.less';

interface Prop extends UploadProps {
  picUrl: string;
  loading: boolean;
}
const Uploaded: FC<Prop> = Props => {
  const { picUrl, loading } = Props;

  // 删除
  const bindDel = () => {
    deleteLogo('image');
  };

  return (
    <div className={styles.uploadedWarp}>
      <div className={styles.imgWarp}>
        <div className={styles.imgShow}>
          {loading ? (
            <Spin spinning={loading} />
          ) : (
            <img src={picUrl} className={styles.img} alt="" />
          )}
        </div>
        <Upload {...Props}>
          <div
            className={styles.replace}
            onClick={() => clickActionWeblog('action_logo_upload')}
          >
            替换
          </div>
        </Upload>

        <div className={styles.del} onClick={bindDel}>
          删除
        </div>
      </div>
    </div>
  );
};

export default observer(Uploaded);
