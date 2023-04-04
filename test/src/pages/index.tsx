import styles from './index.less';

import Test from './test';

export default function IndexPage() {
  return <h1 className={styles.title}>Page index</h1>;

  return (
    <>
      <Test />
      <h1 className={styles.title}>Page index</h1>
    </>
  );
}
