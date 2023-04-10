import { getLayerAssets, observer } from '@hc/editor-core';

import './index.less';
import LayerTool from './LayTool';
import LayerList from './LayerList';

const LayerPanel = () => {
  const assets = getLayerAssets();
  return (
    <div className="layer-drag">
      <LayerTool />
      {/* 图层列表 */}
      <div className="layer-drag-list">
        <LayerList assets={assets} />
      </div>
    </div>
  );
};
export default observer(LayerPanel);
