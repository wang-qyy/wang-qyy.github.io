import { usePartModal } from '@/store/adapter/useGlobalStatus';
import { Modal } from 'antd';
import { useRef } from 'react';

import Wrapper from './Wrapper';
import styles from './index.modules.less';

const AddPartModal = () => {
  const cancelRef = useRef<Function | null>(null);

  const {
    partModal: { visible },
  } = usePartModal();

  return (
    <Modal
      footer={null}
      destroyOnClose
      className={styles.AddPartModal}
      title={null}
      centered
      // style={{ top: '25%' }}
      visible={visible}
      width="auto"
      onCancel={() => cancelRef.current && cancelRef.current()}
      maskClosable={false}
      getContainer={document.getElementById('xiudodo')}
    >
      <Wrapper
        getCancel={(cancel: Function) => {
          cancelRef.current = cancel;
        }}
      />
    </Modal>
  );
};

export default AddPartModal;
