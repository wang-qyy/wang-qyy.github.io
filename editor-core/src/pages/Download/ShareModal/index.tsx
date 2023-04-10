import { Modal } from 'antd';
import { useShareModal } from '@/store/adapter/useGlobalStatus';
import Content from './Content';

export default function ShareModal() {
  const { visible, close } = useShareModal();
  return (
    <Modal
      visible={visible}
      onCancel={close}
      width={450}
      destroyOnClose
      footer={false}
      centered
      maskClosable={false}
      getContainer={document.getElementById('xiudodo')}
    >
      <Content />
    </Modal>
  );
}
