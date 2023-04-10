import { FC } from 'react';
import XiuIcon from '@/components/XiuIcon';
import { Upload, UploadProps } from 'antd';

import styles from './index.less';

const { Dragger } = Upload;

const NotUpload: FC<UploadProps> = Props => {
  return (
    <div className={styles.notuploadWarpper}>
      <Dragger {...Props}>
        <div className={styles.notuploadWarp}>
          <XiuIcon type="iconshangchuan1" className={styles.icon} />
          <div className={styles.text}>可将图片直接拖拽到此</div>
          <div className={styles.text1}>或</div>
          <div className={styles.button}>上传图片</div>
          <div className={styles.text2}>
            支持图片格式：JPG、PNG 、GIF 图片大小：10M
          </div>
        </div>
      </Dragger>
    </div>
  );
};

export default NotUpload;
