import { Menu } from 'antd';
import { useReferenceLine } from '@/store/adapter/useGlobalStatus';
import { useReference } from '@/hooks/useReferenceLine';
import { KEY_PRESS_Tooltip } from '@/config/basicVariable';
import classNames from 'classnames';
import styles from './index.less';

const { SubMenu } = Menu;

function ReferenceLine() {
  const { referenceLineX, referenceLineY, referenceLineShow } =
    useReferenceLine();

  const { showLine, addY, addX, eliminate } = useReference();

  return (
    <div className={styles.referenceLine}>
      <Menu getPopupContainer={() => document.querySelector('#xiudodo')}>
        <Menu.Item
          key="showLine"
          onClick={showLine}
          className={classNames(styles.referenceLineMenuItem, {
            [styles.referenceLineMenuItemActive]: referenceLineShow,
          })}
        >
          <span>显示标尺和参考线</span>
          <span>{KEY_PRESS_Tooltip.referenceLine}</span>
        </Menu.Item>
        <SubMenu
          key="addLine"
          title="新建参考线"
          popupOffset={[-10, -30]}
          popupClassName="referenceLineSubMenu"
        >
          <Menu.Item
            key="xLine"
            className={styles.referenceLineSubMenuItem}
            onClick={addX}
          >
            横向参考线
          </Menu.Item>
          <Menu.Item
            key="yLine"
            className={styles.referenceLineSubMenuItem}
            onClick={addY}
          >
            竖向参考线
          </Menu.Item>
        </SubMenu>
        <Menu.Item
          key="delLine"
          onClick={eliminate}
          disabled={referenceLineX.length == 0 && referenceLineY.length == 0}
        >
          清除参考线
        </Menu.Item>
      </Menu>
    </div>
  );
}

export default ReferenceLine;
