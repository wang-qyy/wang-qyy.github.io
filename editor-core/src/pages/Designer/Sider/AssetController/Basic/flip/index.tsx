import { XiuIcon } from '@/components';
import classNames from 'classnames';
import {
  useImageClipByObserver,
  useHorizontalFlipByObserver,
  useVerticalFlipByObserver,
  observer,
} from '@hc/editor-core';
import styles from '../index.modules.less';

const FlipItem = (props: {
  name: string;
  icon: string;
  active: boolean;
  onchange: () => void;
}) => {
  const { name, icon, active, onchange } = props;

  return (
    <div
      className={classNames(styles.flipItem, {
        [styles.flipItemSelectd]: active,
      })}
      onClick={onchange}
    >
      <XiuIcon type={icon} style={{ marginRight: 14, fontSize: 20 }} />

      {name}
    </div>
  );
};

const OperationBasicFlip = () => {
  const [horizontalFlip, updateHorizontalFlip] = useHorizontalFlipByObserver();
  const [verticalFlip, updateVerticalFlip] = useVerticalFlipByObserver();
  const { endClip } = useImageClipByObserver();
  const onchange = (type: string) => {
    endClip();
    if (type === 'horizontal') {
      updateHorizontalFlip(!horizontalFlip);
    } else {
      updateVerticalFlip(!verticalFlip);
    }
  };
  return (
    <div className={styles.basicRow}>
      <div className={styles.basicRowName}>翻转</div>
      <div className={styles.basicRowContent}>
        <FlipItem
          name="水平翻转"
          icon="iconshuipingfanzhuan"
          active={horizontalFlip}
          onchange={() => {
            onchange('horizontal');
          }}
        />
        <FlipItem
          name="垂直翻转"
          icon="iconchuizhifanzhuan"
          active={verticalFlip}
          onchange={() => {
            onchange('vertical');
          }}
        />
      </div>
    </div>
  );
};
export default observer(OperationBasicFlip);
