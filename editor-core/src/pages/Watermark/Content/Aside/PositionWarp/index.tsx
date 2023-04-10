import { ArrowUpOutlined } from '@ant-design/icons';
import {
  useSetWatermarkPositionByObserver,
  observer,
  toJS,
} from '@hc/editor-core';
import classNames from 'classnames';
import { dataWatermark } from '@/utils/webLog';

import {
  calcWatermarkPositionForEditor,
  WatermarkPosition,
  editorPositionForView,
} from '../../../handler';

import styles from './index.less';

const PositionWarp = () => {
  const options = [
    { rotate: 325, position: 'topLeft' },
    { rotate: 0, position: 'top' },
    { rotate: 45, position: 'topRight' },
    { rotate: 270, position: 'left' },
    { rotate: -1, position: 'center' },
    { rotate: 90, position: 'right' },
    { rotate: 225, position: 'leftBottom' },
    { rotate: 180, position: 'bottom' },
    { rotate: 135, position: 'bottomRight' },
  ];

  const [value, setWatermarkPosition] = useSetWatermarkPositionByObserver();
  const position = editorPositionForView(value);

  return (
    <div className={styles.positionWarp}>
      {options.map(item => (
        <div
          key={item.rotate}
          className={classNames(styles.positionWarpItem, {
            [styles.positionWarpItemActive]: item.position === position,
          })}
          onClick={() => {
            dataWatermark('VideoWmEdit', 'location');
            setWatermarkPosition(
              calcWatermarkPositionForEditor(
                item.position as WatermarkPosition,
              ),
            );
          }}
        >
          {item.rotate !== -1 ? (
            <ArrowUpOutlined rotate={item.rotate} />
          ) : (
            <div className={styles.dot} />
          )}
        </div>
      ))}
    </div>
  );
};

export default observer(PositionWarp);
