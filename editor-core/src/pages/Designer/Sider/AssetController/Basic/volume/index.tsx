import { useVideoEVolumeByObserver, observer } from '@hc/editor-core';
import OperationSlider from '@/pages/Designer/Sider/Text/TextTabs/Basic/components/SliderText';
import styles from '../index.modules.less';

const volume = () => {
  const [volume, setVolume] = useVideoEVolumeByObserver();
  return (
    <div className={styles.basicRow}>
      <div className={styles.basicRowName}>音量</div>
      <div className={styles.basicRowContent}>
        <OperationSlider
          defaultValue={volume ?? 0}
          onChange={val => {
            setVolume(val);
          }}
        />
      </div>
    </div>
  );
};
export default observer(volume);
