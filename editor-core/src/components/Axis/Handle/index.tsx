import styles from './index.modules.less';

interface HandleProps {
  position: number;
}

export default function Handle({ position }: HandleProps) {
  return (
    <div
      className={styles.handle}
      style={{
        left: `${position > 0 ? `calc(${position}% - 2px)` : `${position}%`}`,
      }}
    />
  );
}
