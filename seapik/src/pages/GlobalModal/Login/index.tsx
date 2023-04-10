import { Button } from 'antd';
import Modal from 'antd/lib/modal/Modal';

export default function Login() {
  return (
    <Modal open={false} title="Log in / Register" footer={null}>
      <div></div>
      <Button type="primary" onClick={() => {}}>
        Continue with Google
      </Button>
    </Modal>
  );
}
