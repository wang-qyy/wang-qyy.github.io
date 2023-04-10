import styles from './index.modules.less';

export default function Progress({ percent }) {
  return (
    <div className={styles['progress-rail']}>
      <div
        className={styles['progress-track']}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
