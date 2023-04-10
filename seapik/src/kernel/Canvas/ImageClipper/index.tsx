import React from 'react';
import { observer } from 'mobx-react';
import { useGetCanvasStatus } from '@kernel/store/GlobalAdpater';
import { stopPropagation } from '@kernel/utils/single';
import Image from '@kernel/Components/Image';
import ImageClipperTool from './ImageClipperTool';
import { useGetClipInfo, useImageClipperTool } from './hooks';

const ImageClipper = observer(() => {
  const { toolStyle, imageStyle, originImageSrc } = useGetClipInfo();
  const props = useImageClipperTool();

  return (
    <div
      className="hc-asset-image-clipper"
      onClick={stopPropagation}
      onMouseDown={stopPropagation}
      onDragStart={stopPropagation}
    >
      <div
        onDragStart={stopPropagation}
        onMouseDown={stopPropagation}
        className="hc-AIC-origin-image"
        style={imageStyle}
      >
        <Image
          draggable={false}
          onMouseDown={stopPropagation}
          onDragStart={stopPropagation}
          src={originImageSrc}
          alt="origin-image"
        />
        {/* <div className='hc-AIC-image-mask' /> */}
      </div>
      {/* <div id='clippeOriginStyle1'/> */}
      {/* <div id='clippeOriginStyle2'/> */}
      <ImageClipperTool style={toolStyle} {...props} />
    </div>
  );
});

function ImageClipperWrapper() {
  const { inClipping } = useGetCanvasStatus();
  return inClipping ? <ImageClipper /> : <></>;
}

export default observer(ImageClipperWrapper);
