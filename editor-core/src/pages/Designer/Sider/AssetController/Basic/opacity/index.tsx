import OperationSlider from '@/pages/Designer/Sider/Text/TextTabs/Basic/components/SliderText';
import { useOpacityByObserver, observer } from '@hc/editor-core';
import styles from '../index.modules.less';

const OperationBasicOpacity = () => {
  const [opacity, updateOpacity] = useOpacityByObserver();
  return (
    <div className={styles.basicRow}>
      <div className={styles.basicRowName}>不透明度</div>
      <div className={styles.basicRowContent}>
        <OperationSlider
          defaultValue={opacity}
          onChange={val => {
            updateOpacity(val);
          }}
        />
      </div>
    </div>
  );
};
export default observer(OperationBasicOpacity);
