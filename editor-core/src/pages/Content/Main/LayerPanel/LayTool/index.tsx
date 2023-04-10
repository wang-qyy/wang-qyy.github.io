import { message } from 'antd';
import { observer, useGetCurrentAsset, assetIsEditable } from '@hc/editor-core';
import { XiuIcon } from '@/components';

import { useRemoveAsset } from '@/hooks/useAssetActions';
import { clipBoardPasteAsset, copyAndPaste, pasteAsset } from '@/utils/single';
import classNames from 'classnames';
import { layerWeblog } from '@/utils/webLog';

const ToolItem = (props: any) => {
  const { title, icon, iconstyle, disabled, onClick, ...other } = props;
  const Click = () => {
    if (disabled) {
      message.info('请选中你需要修改的图层!');
      return;
    }
    onClick && onClick();
  };
  return (
    <div
      className={classNames('layer-drag-tool-item', {
        'layer-drag-tool-item-active': !disabled,
      })}
      onClick={Click}
      {...other}
    >
      <XiuIcon type={icon} style={iconstyle} />
      <span>{title}</span>
    </div>
  );
};
const LayerTool = () => {
  const currentAsset = useGetCurrentAsset();
  const { handleRemoveAsset } = useRemoveAsset();

  // 删除元素
  function deleteAssets() {
    if (assetIsEditable(currentAsset)) {
      handleRemoveAsset(currentAsset);
      layerWeblog('LayerModal_01', {
        action_label: currentAsset?.meta.type,
      });
    } else {
      message.info('请先解锁');
    }
  }

  // 复制粘贴图层
  function copyPasteAssets(e) {
    if (currentAsset && assetIsEditable(currentAsset)) {
      pasteAsset({ asset: currentAsset });
      layerWeblog('LayerModal_02', {
        action_label: currentAsset?.meta.type,
      });
    } else {
      message.info('请先解锁');
    }
  }

  return (
    <div className="layer-drag-tool">
      <ToolItem
        title="删除"
        icon="iconshanchu"
        onClick={deleteAssets}
        iconstyle={{ fontSize: 16 }}
        disabled={!currentAsset}
      />
      <ToolItem
        title="拷贝"
        icon="iconfuzhi1"
        onClick={copyPasteAssets}
        iconstyle={{ fontSize: 20 }}
        disabled={!currentAsset}
      />
    </div>
  );
};
export default observer(LayerTool);
