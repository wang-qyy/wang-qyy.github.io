import { Dropdown, Menu } from 'antd';
import {
  getCurrentAssetCopy,
  useGetCurrentAsset,
  observer,
  TemplateClass,
} from '@hc/editor-core';
import { stopPropagation, copyAndPaste, pasteAsset } from '@/utils/single';
import { useRemoveAsset, deleteTemplateModal } from '@/hooks/useAssetActions';
import { setAssetEditStatus } from '@/utils/assetHandler';
import { setActiveOperationMenu } from '@/store/adapter/useDesigner';

import styles from './index.modules.less';
import { PropsWithChildren } from 'react';

function ContextMenu({
  children,
  isLast,
  template,
}: PropsWithChildren<{
  template: TemplateClass;
  isLast?: boolean;
}>) {
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

      case 'transition':
        setActiveOperationMenu('transition');
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
      <Menu.Item key="lock" hidden={!template.backgroundAsset}>
        锁定图层
      </Menu.Item>

      <Menu.Item key="transition" hidden={isLast}>
        设置转场
      </Menu.Item>
      <Menu.Item key="delTemplate">删除片段</Menu.Item>
    </Menu>
  );
  return (
    <Dropdown
      overlayClassName={styles['overlay-dropdown']}
      // visible
      overlay={menu}
      trigger={['contextMenu']}
    >
      {children}
    </Dropdown>
  );
}
export default observer(ContextMenu);
