import { CloseOutlined, ExclamationOutlined } from '@ant-design/icons';
import styles from '../index.less';

const RecorderWarn = () => {
  return (
    <div className={styles.warn}>
      <div className={styles.warnIcon}>
        <ExclamationOutlined />
      </div>
      <span>未检测到录音设备！</span>
    </div>
  );
};
export default RecorderWarn;
