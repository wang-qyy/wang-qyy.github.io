import { Modal } from 'antd';

import PreviewVideo from '@/pages/Preview/PreviewVideo';
import styles from './index.modules.less';

export default function Preview({ visible = true, onCancel }: any) {
  return (
    <Modal
      title="预览视频"
      visible={visible}
      onCancel={onCancel}
      width={947}
      footer={false}
      className={styles['preview-modal']}
      destroyOnClose
      maskClosable={false}
      centered
      getContainer={document.getElementById('xiudodo')}
    >
      <PreviewVideo className={styles['preview-video']} controls />
    </Modal>
  );
}
