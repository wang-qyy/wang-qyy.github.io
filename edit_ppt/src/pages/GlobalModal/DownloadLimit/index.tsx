import { Button } from 'antd';
import Modal from 'antd/lib/modal/Modal';
import downloadLimit from '@/assets/image/downloadLimit.png';
import { useDownloadStatus } from '@/pages/store/download';

import styles from './index.modules.less';
import { observer } from 'mobx-react';

function DownloadLimit() {
  const { limit, setLimitStatus } = useDownloadStatus();

  return (
    <Modal open={limit} footer={false} onCancel={() => setLimitStatus(false)}>
      <div className={styles['limit-content']}>
        <img src={downloadLimit} width={80} />
        <p className={styles['h1']}>
          Your have reached the editing experiences limit today
        </p>
        <span style={{ fontWeight: 'normal', fontSize: 14 }}>
          (5 free experiences every day)
        </span>
        <p className={styles['h2']}>Please come back tomorrow</p>
        <Button
          type="primary"
          style={{ width: 120 }}
          onClick={() => setLimitStatus(false)}
        >
          I know
        </Button>
      </div>
    </Modal>
  );
}

export default observer(DownloadLimit);
