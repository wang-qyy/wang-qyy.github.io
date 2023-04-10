import { observer } from 'mobx-react';
import { Modal, Spin, Button } from 'antd';
import { getPollingStatus, setPollingStatus } from '@/pages/store/download';

export default observer(() => {
  return (
    <Modal
      open={getPollingStatus()}
      maskClosable={false}
      closable={false}
      footer={null}
      centered
      focusTriggerAfterClose
    >
      <div style={{ textAlign: 'center' }}>
        <h2>
          <Spin spinning style={{ marginRight: 8 }} />
          Downloading
        </h2>
        <p style={{ margin: '24px 0' }}>We are preparing your file.</p>

        <Button type="primary" ghost onClick={() => setPollingStatus(false)}>
          Continue working
        </Button>
      </div>
    </Modal>
  );
});
