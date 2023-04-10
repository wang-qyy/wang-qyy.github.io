import { Drawer } from 'antd';
import Header from '@/pages/MusicHeader';
import { useAudioSetModal } from '@/store/adapter/useGlobalStatus';
import BottomTrack from '@/pages/SetupSound/BottomTrack';
import PreviewVideo from '@/pages/Preview/PreviewVideo';

import styles from './index.less';

export default function SetupSound() {
  const { close, visible } = useAudioSetModal();

  return (
    <Drawer
      className={styles.setupSoundDrawer}
      closable={false}
      placement="top"
      height="100%"
      bodyStyle={{ padding: '0px' }}
      onClose={close}
      visible={visible}
      getContainer={false}
    >
      {visible && (
        <div className={styles.SetupSound}>
          <div className={styles.Header}>
            <Header onClose={close} />
          </div>
          <div className={styles.Content}>
            <div className={styles.warp}>
              <div className={styles.top}>
                <div className={styles.content}>
                  <PreviewVideo />
                </div>
              </div>
              <div className={styles.buttom}>
                <BottomTrack />
              </div>
            </div>
          </div>
        </div>
      )}
    </Drawer>
  );
}
