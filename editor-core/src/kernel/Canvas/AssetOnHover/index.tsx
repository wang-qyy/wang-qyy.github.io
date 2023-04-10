import React, { CSSProperties, useMemo } from 'react';
import { observer } from 'mobx-react';
import {
  getCanvasInfo,
  getEditAsset,
  getHoverAsset,
  getMoveAsset,
} from '@kernel/store';
import { buildGeneralStyleInHandler } from '@kernel/utils/assetHelper/pub';
import { config } from '@kernel/utils/config';

import { assetIsEditable } from '@kernel/utils/assetChecker';

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

  function reverseRotate() {
    if (hoverAsset?.auxiliary) {
      let { auxiliary } = hoverAsset;

      if (hoverAsset.parent) {
        auxiliary = hoverAsset.parent.auxiliary;
      }

      const { horizontal, vertical } = auxiliary;

      const { center: hc, start: hs } = horizontal;
      const { center: vc, start: vs, end: ve } = vertical;

      let left = hc - 50;
      let top = vs - 40;

      // 保证提示一直在可视区域内
      if (config.container) {
        const container = document.querySelector(
          config.container,
        ) as HTMLDivElement;
        if (container) {
          const { scrollTop, scrollLeft, clientHeight, clientWidth } =
            container;

          if (top - 30 < scrollTop) {
            top = ve;
          }
          if (top + 30 > scrollTop + clientHeight) {
            top = scrollTop;
          }

          if (left < scrollLeft) {
            left = scrollLeft;
          }
          if (left + 100 > scrollLeft + clientWidth) {
            left = scrollLeft + clientWidth - 100;
          }
        }
      }

      return { left, top };
    }

    return {};
  }

  const tooltip = useMemo(() => {
    if (hoverAsset?.meta.type === 'text') {
      return '双击编辑文字';
    }
    if (hoverAsset?.meta.type === 'qrcode') {
      return '双击编辑二维码';
    }
    return '双击替换元素';
  }, [hoverAsset?.meta.type]);

  return (
    <>
      <div className="hc-asset-edit-hover" style={style()} />
      {hoverAsset?.meta.type && tooltip && (
        <div className="hc-asset-tooltip" style={reverseRotate()}>
          <span>{tooltip}</span>
        </div>
      )}
    </>
  );
}

export default observer(AssetOnHover);
