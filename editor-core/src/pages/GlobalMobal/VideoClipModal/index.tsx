import { Modal, ModalProps } from 'antd';
import Content, { ClipModalContentProps } from './Content';

interface ClipProps extends ModalProps {
  contentProps: ClipModalContentProps;
}

export default function Clip(props: ClipProps) {
  const { onCancel, contentProps } = props;

  return (
    <Modal
      title="裁剪视频"
      width={850}
      maskClosable={false}
      footer={false}
      bodyStyle={{ padding: '0  0 20px 0' }}
      centered
      destroyOnClose
      onCancel={onCancel}
      {...props}
    >
      <Content onCancel={onCancel} {...contentProps} />
    </Modal>
  );
}
