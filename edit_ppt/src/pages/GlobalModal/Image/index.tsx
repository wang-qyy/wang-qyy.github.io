import { Modal } from 'antd';
import { observer } from 'mobx-react';
import List from './list';

import { useImgModal } from '@/pages/store/global';

function Images() {
  const { open, openFn } = useImgModal();
  return (
    <Modal
      centered
      open={open}
      title="Select image"
      footer={false}
      width={800}
      onCancel={() => openFn(false)}
    >
      <List />
    </Modal>
  );
}
export default observer(Images);
