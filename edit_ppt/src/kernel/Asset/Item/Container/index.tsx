import React, { useRef, useLayoutEffect, useEffect } from 'react';
import { observer } from 'mobx-react';
import type { AssetItemProps } from '@kernel/typing';
import { useContainerAdapter } from '@kernel/store/AssetAdapter';
import { useContainerStyle, ContainerHandler, useSvgHelper } from './utils';

// todo 逻辑待完善
export default observer(({ asset, index, canvasInfo }: AssetItemProps) => {
  const { assetElementStyle, tipContentStyle, tipAreaStyle } =
    useContainerStyle(asset, canvasInfo);
  const { hasSvg } = useSvgHelper({ asset, index });
  const SVGContent = useRef<HTMLDivElement>(null);
  const containerHandler = useRef<ContainerHandler>(null);
  const containerHandlerIns = containerHandler.current;
  const { contentInfo = [], picUrl = '', resId } = asset.attribute;

  function doubleClickEvent() {
    console.log('doubleClickEvent');
  }

  useLayoutEffect(() => {
    if (SVGContent.current) {
      // @ts-ignore
      containerHandler.current = new ContainerHandler(SVGContent.current);
    }
  }, []);

  useEffect(() => {
    if (containerHandlerIns && hasSvg()) {
      containerHandlerIns.replaceSvg(picUrl, `${resId}`, index);
      // containerHandlerIns.setSvgAttribute(
      //   contentInfo,
      //   containerAddedAsset,
      //   index
      // );
    }
  }, [picUrl]);

  return (
    <div
      className="assetElement"
      onDoubleClick={doubleClickEvent}
      style={assetElementStyle}
    >
      {!contentInfo?.[0].resId && (
        <div className="tipArea" style={tipAreaStyle}>
          <div className="tipContent" style={tipContentStyle}>
            <i
              className="iconfont icon-tihuantupian"
              style={{ marginRight: '5px' }}
            />
            拖入一张图片以替换当前图片
          </div>
        </div>
      )}

      <div>
        <div ref={SVGContent} />
        {(picUrl === '' || picUrl === 'loading') && (
          <i className="iconfont icon-xuanzhuan assetImgLoad" />
        )}
      </div>
    </div>
  );
});
