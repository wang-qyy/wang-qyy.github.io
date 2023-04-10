import { CSSProperties } from 'react';
import { observer } from 'mobx-react';
import {
  getCanvasInfo,
  getEditAsset,
  getHoverAsset,
  getMoveAsset,
} from '@kernel/store';
import { buildGeneralStyleInHandler } from '@kernel/utils/assetHelper/pub';

function AssetOnHover() {
  const hoverAsset = getHoverAsset();
  const moveAsset = getMoveAsset();
  const editAsset = getEditAsset();
  const { scale } = getCanvasInfo();
  function style(): CSSProperties {
    if (hoverAsset && !hoverAsset.meta.locked) {
      const { rt_style } = hoverAsset.tempData;
      const size: CSSProperties = {};
      const transform: CSSProperties = {};
      if (rt_style) {
        const { width, height, posX, posY } = rt_style;
        size.width = width * scale;
        size.height = height * scale;
        transform.left = posX * scale;
        transform.top = posY * scale;
      }
      const result: CSSProperties = {
        ...buildGeneralStyleInHandler(hoverAsset),
        ...size,
        ...transform,
        opacity: 1,
      };

      if (moveAsset || editAsset) {
        result.border = 'none';
      }
      return result;
    }
    return {};
  }

  return (
    <>
      <div className="hc-asset-edit-hover" style={style()} />
    </>
  );
}

export default observer(AssetOnHover);
