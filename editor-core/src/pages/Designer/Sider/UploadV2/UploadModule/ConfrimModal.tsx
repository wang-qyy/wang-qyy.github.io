import { Modal, ModalProps, Button } from 'antd';

interface ConfirmModalProps extends ModalProps {}

export default function ConfirmModal(props: ConfirmModalProps) {
  const { onOk, ...others } = props;

  return (
    <Modal centered footer={null} {...others}>
      <div style={{ textAlign: 'center' }}>
        <p> 严禁上传非原创无版权作品，如造成版权纠纷等严重后果 </p>
        <p> 由设计师本人承担经济赔偿以及法律责任。 </p>

        {/* <p>
        详细文档键
        <a href="https://www.baidu.com" target="_blank" rel="noreferrer">
          《设计师违规处罚规则》
        </a>
      </p> */}
        <Button type="primary" onClick={onOk}>
          我已阅读并承诺遵守上述要求
        </Button>
      </div>
    </Modal>
  );
}
