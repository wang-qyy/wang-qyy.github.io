import { Modal } from 'antd';
import './index.less';

const PubMessage = ({
  title = '',
  content = '',
  icon = '',
  duration = 3000,
  className = '',
  ...res
}) => {
  const modal = Modal.info({
    title,
    content,
    icon,
    className: `pub-message ${className}`,
    closable: true,
    maskClosable: true,
    centered: true,
    okText: null,
    ...res,
  });

  setTimeout(() => {
    modal.destroy();
  }, duration);

  return '';
};
export default PubMessage;
