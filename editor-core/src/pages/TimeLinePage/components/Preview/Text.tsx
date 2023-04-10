import { observer } from 'mobx-react';
import { XiuIcon } from '@/components';
import styles from './index.less';

const Text = ({ text }: { text: string[] }) => {
  return (
    <div className={styles.textWrapper}>
      <XiuIcon type="iconwenzi1" className={styles.icon} />
      <div className={styles.text}>{text}</div>
    </div>
  );
};

export default observer(Text);
