import { Tooltip } from 'antd';
import { useAddSvgType } from '@/store/adapter/useGlobalStatus';
import classNames from 'classnames';
import { XiuIcon } from '@/components';
import { assetBlur } from '@/kernel';
import { clickActionWeblog } from '@/utils/webLog';
import { shapeList } from './options';
import styles from './index.less';

const FreeformDraw = () => {
  const { setAddSvgType, addSvgType } = useAddSvgType();
  return (
    <div className={styles.FreeformDraw}>
      <div>自由绘制</div>
      <div className={styles.shape}>
        {shapeList.map(item => (
          <Tooltip placement="bottom" key={item.type} title={item.name}>
            <div
              className={classNames(styles.item, {
                [styles.active]: addSvgType === item.type,
              })}
              onClick={() => {
                clickActionWeblog('FreeformDraw1');
                setAddSvgType(item.type);
                assetBlur();
              }}
            >
              <XiuIcon type={item.icon} style={{ fontSize: 34 }} />
            </div>
          </Tooltip>
        ))}
      </div>
    </div>
  );
};

export default FreeformDraw;
