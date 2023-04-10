import { Modal } from 'antd';
import { useTeamCountModal } from '@/store/adapter/useGlobalStatus';
import Content from './Content';

export default function ShareModal() {
  const { visible, close, type } = useTeamCountModal();

  return (
    <Modal
      visible={visible}
      onCancel={close}
      width={427}
      destroyOnClose
      footer={false}
      centered
      maskClosable={false}
    >
      <Content type={type} close={close} />
    </Modal>
  );
}
