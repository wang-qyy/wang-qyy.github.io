import { observer } from 'mobx-react';

import styles from './index.less';

const Image = ({ src }: { src: string }) => {
  return (
    <div className={styles.Image}>
      {/* <div
        className={styles.previewImage}
        style={{ backgroundImage: `url(${src})` }}
      /> */}
      <img className={styles.previewImage} src={src} alt="" />
    </div>
  );
};

export default observer(Image);
