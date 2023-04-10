import { Modal } from 'antd';

import './index.less';

export default function SubmitModal({
  visible,
  onCancel,
  title,
  Content,
}: any) {
  return (
    <Modal
      title={title}
      centered
      // visible
      visible={visible}
      width="100%"
      onCancel={onCancel}
      footer={false}
      destroyOnClose
      maskClosable={false}
      wrapClassName="designer-submit-modal-wrap"
      getContainer={document.getElementById('xiudodo')}
    >
      <Content onClose={onCancel} />
    </Modal>
  );
}
