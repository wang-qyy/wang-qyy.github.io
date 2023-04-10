import { FC } from 'react';
import { Modal, Progress } from 'antd';

import styles from './index.less';

interface Prop {
  progress: number;
  name: string;
  visible: boolean;
}
const UploadMusicProgress: FC<Prop> = Props => {
  const { progress, name, visible } = Props;
  return (
    <Modal
      visible={visible}
      footer={null}
      bodyStyle={{ padding: 0 }}
      width={318}
      closable={false}
      getContainer={document.getElementById('xiudodo')}
    >
      <div className={styles.uploadMusicProgress}>
        <div className={styles.uploadMusicProgressTop}>{name}</div>
        <div className={styles.uploadMusicProgressBottom}>
          <Progress percent={progress} />
        </div>
      </div>
    </Modal>
  );
};

export default UploadMusicProgress;
