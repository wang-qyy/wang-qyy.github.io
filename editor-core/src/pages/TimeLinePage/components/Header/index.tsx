import { XiuIcon } from '@/components';

import styles from './index.less';

const Header = (props: { onBack: () => void }) => {
  const { onBack } = props;

  return (
    <div className={styles.Header}>
      <span className={styles.title}>时间线模式</span>
      <div className={styles.back} onClick={onBack}>
        <XiuIcon className={styles.icon} type="iconjiantouyou" />
        <div>返回</div>
      </div>
    </div>
  );
};

export default Header;
