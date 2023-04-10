import { observer } from 'mobx-react';
import { XiuIcon } from '@/components';
import { getAllAudios, getCarmeraStatus } from '@/kernel';

import styles from './index.less';
import timeLinePageStore from '../../store';

export interface MarkProps {
  top: number;
}

const Mark = (props: MarkProps) => {
  const { top } = props;
  const { activePartKey } = timeLinePageStore;
  const audios = getAllAudios();
  const inCamera = getCarmeraStatus();

  return (
    <div className={styles.Mark}>
      <div className={styles.bgMark} style={{ top }}>
        <XiuIcon className={styles.icon} type="iconbackground" />
      </div>
      {inCamera && (
        <div className={styles.cameraMark}>
          <XiuIcon className={styles.icon} type="jingtou-duijiao" />
        </div>
      )}
      {activePartKey === -1 && !!audios.length && (
        <div className={styles.audioMark} style={{ top: top + 40 }}>
          <XiuIcon className={styles.icon} type="icona-luyin" />
        </div>
      )}
    </div>
  );
};

export default observer(Mark);
