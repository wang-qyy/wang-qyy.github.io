import { Dropdown, Menu } from 'antd';
import {
  getCurrentAssetCopy,
  useGetCurrentAsset,
  getAllTemplates,
  observer,
  toJS,
  setAssetVisible,
} from '@hc/editor-core';
import { stopPropagation, copyAndPaste, pasteAsset } from '@/utils/single';
import { useRemoveAsset, deleteTemplateModal } from '@/hooks/useAssetActions';
import { setAssetEditStatus } from '@/utils/assetHandler';

import styles from './index.modules.less';

function ContextMenu({ children }: any) {
  const asset = useGetCurrentAsset();
  const { handleRemoveAsset } = useRemoveAsset();

  function handleMenuClick({ key, domEvent }) {
    stopPropagation(domEvent);

    switch (key) {
      case 'copy':
        copyAndPaste.copy('asset', getCurrentAssetCopy());
        break;
      case 'paste':
        pasteAsset();
        break;
      case 'cut':
        copyAndPaste.copy('asset', getCurrentAssetCopy());

        handleRemoveAsset(asset);
        break;
      case 'lock':
        setAssetEditStatus(asset);
        break;
      case 'delTemplate':
        deleteTemplateModal();
        break;

      case 'hide':
        setAssetVisible(asset);
        break;
    }
  }

  const menu = (
    <Menu
      onMouseDown={stopPropagation}
      onClick={handleMenuClick}
      className={styles.menu}
    >
      <Menu.Item key="copy" disabled={!asset}>
        复制 Ctrl+c
      </Menu.Item>
      <Menu.Item key="paste" disabled={false}>
        粘贴 Ctrl+v
      </Menu.Item>
      <Menu.Item key="cut" hidden={asset?.meta.isBackground} disabled={!asset}>
        剪切 Ctrl+x
      </Menu.Item>
      <Menu.Item key="lock" disabled={!asset}>
        锁定图层
      </Menu.Item>
      <Menu.Item key="hide" disabled={!asset}>
        {asset && asset.meta.hidden ? '显示图层' : '隐藏图层'}
      </Menu.Item>

      <Menu.Item
        key="delTemplate"
        hidden={!asset?.meta.isBackground}
        disabled={getAllTemplates().length < 2}
      >
        删除片段
      </Menu.Item>
    </Menu>
  );
  return (
    <Dropdown
      overlayClassName={styles['overlay-dropdown']}
      // visible
      overlay={menu}
      trigger={['contextMenu']}
      // getPopupContainer={ele => ele}
    >
      {children}
    </Dropdown>
  );
}
export default observer(ContextMenu);
