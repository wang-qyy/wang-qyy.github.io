import { useState, PropsWithChildren } from 'react';
import { Popover, Dropdown } from 'antd';
import { TemplateClass, useCameraByObeserver } from '@/kernel';
import CameraState from '@/kernel/store/assetHandler/template/camera';
import { clickActionWeblog } from '@/utils/webLog';
import styles from '../index.less';

const Action = (
  props: PropsWithChildren<{
    data: CameraState;
    index: number;
    template: TemplateClass;
  }>,
) => {
  const { data, index, children, template } = props;
  const { removeCamera, removeAll } = useCameraByObeserver(template);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  return (
    <Dropdown
      onVisibleChange={v => {
        setDropdownVisible(v);
      }}
      overlayClassName={styles.actionPopover}
      visible={dropdownVisible}
      overlay={
        <div className={styles.actionMenu}>
          <div
            className={styles.actionMenuItem}
            onClick={e => {
              removeCamera(index);
              clickActionWeblog('Timeline_camera_delete');
            }}
          >
            删除镜头
          </div>
          <div
            className={styles.actionMenuItem}
            onClick={e => {
              removeAll();
              clickActionWeblog('Timeline_camera_deleteAll');
            }}
          >
            清空所有镜头
          </div>
        </div>
      }
      trigger={['contextMenu']}
    >
      {children}
    </Dropdown>
  );
};
export default Action;
