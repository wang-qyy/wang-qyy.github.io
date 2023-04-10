import { Modal } from 'antd';
import { useQrCodeEditModal } from '@/store/adapter/useGlobalStatus';
import { clearQrCode } from '@/store/adapter/qrCodeStatus';
import Wrapper from './Wrapper';
import styles from './index.less';

const QrCodeEditModal = () => {
  const [visible, _visible] = useQrCodeEditModal();

  return (
    <Modal
      footer={null}
      destroyOnClose
      className={styles.QrCodeEditModal}
      title={null}
      centered
      visible={visible}
      width="auto"
      onCancel={() => {
        _visible(false);
        clearQrCode();
      }}
      maskClosable={false}
      getContainer={document.getElementById('xiudodo')}
    >
      <Wrapper />
    </Modal>
  );
};

export default QrCodeEditModal;
