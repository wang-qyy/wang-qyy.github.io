import { PropsWithChildren } from 'react';

import styles from './index.less';

const LabelItem = (
  props: PropsWithChildren<{
    label: string;
  }>,
) => {
  const { label, children } = props;
  return (
    <div className={styles.LabelItem}>
      <div className={styles.label}>{label}:</div>
      <div className={styles.content}>{children}</div>
    </div>
  );
};

export default LabelItem;
