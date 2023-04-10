import { DRAG_ACCEPT_TYPE } from '@/constants/drag';
import { Attribute, getCanvasInfo } from '@/kernel';
import { getCanvasClientRect } from '@/kernel/utils/single';
import { RGBAToString } from '@/utils/single';
import { CSSProperties, useEffect, useMemo, useRef, useState } from 'react';
import { useDragLayer, XYCoord } from 'react-dnd';
import { observer } from '@hc/editor-core';
import { getCurrentHoverMask } from '@/kernel/store';
import { cdnHost } from '@/config/urls';

function Image({ src }: { src: string }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: `#e3e7eb url(${src}) center center / contain no-repeat`,
      }}
    />
  );
}
function Text({ attribute }: { attribute: Attribute }) {
  const canvasInfo = getCanvasInfo();
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: 'pink',
        textAlign: 'center',
        color: attribute?.color && RGBAToString(attribute?.color),
        fontSize: attribute?.fontSize * canvasInfo.scale || 50,
        lineHeight: attribute.lineHeight,
        fontWeight: attribute.fontWeight,
        backgroundColor:
          attribute?.textBackground?.color &&
          RGBAToString(attribute?.textBackground?.color),
      }}
    >
      {attribute.text ?? '双击编辑文字'}
    </div>
  );
}
const layerStyles: CSSProperties = {
  position: 'fixed',
  pointerEvents: 'none',
  zIndex: 100,
  left: 0,
  top: 0,
  width: '100%',
  height: '100%',
};

const defaultPreviewImage = `${cdnHost}/xiudodo-editor/image/logo/logo.png`;

const DragLayerWrap = observer(() => {
  const canvasInfo = getCanvasInfo();
  const canvasRect = useRef(null);
  const dragDistance = useRef(0);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const defaultSize = {
    width: 152,
    height: 86,
  };
  const { itemType, isDragging, item, initialOffset, currentOffset } =
    useDragLayer(monitor => ({
      item: monitor.getItem(),
      itemType: monitor.getItemType(),
      initialOffset: monitor.getInitialSourceClientOffset(),
      currentOffset: monitor.getSourceClientOffset(),
      isDragging: monitor.isDragging(),
    }));
  function renderItem() {
    if (item) {
      let src = '';
      switch (itemType) {
        case 'pic':
          src = item?.attribute.picUrl;
          break;
        case 'text':
          {
            if (!(item?.attribute?.effect || item?.attribute?.effectColorful)) {
              return <Text attribute={item.attribute} />;
            }
            src = item?.attribute.rt_preview_url;
          }
          break;
        default:
          src = item?.attribute?.rt_preview_url || defaultPreviewImage;
          break;
      }
      return <Image src={src} />;
    }
  }
  const getItemStyles: CSSProperties = useMemo(() => {
    // 获取是否hover在蒙版元素上
    const maskAsset = getCurrentHoverMask();
    if (!initialOffset || !currentOffset || !item || !size) {
      return {
        display: 'block',
      };
    }
    let setWidth;
    let setHeight;
    const { x, y } = currentOffset;
    if (itemType != 'text') {
      setWidth =
        ((x - initialOffset.x) / dragDistance.current) * Number(size.width);
      setHeight =
        ((x - initialOffset.x) / dragDistance.current) * Number(size.height);
      setWidth = Math.max(defaultSize.width, setWidth);
      setWidth = Math.min(size.width, setWidth);

      setHeight = Math.max(defaultSize.height, setHeight);
      setHeight = Math.min(size.height, setHeight);
    } else {
      if (!(item?.attribute?.effect || item?.attribute?.effectColorful)) {
        setWidth = item.attribute.width * canvasInfo.scale;
        setHeight = item.attribute.height * canvasInfo.scale;
      } else {
        setWidth = defaultSize.width;
        setHeight = defaultSize.height;
      }
    }
    // 鼠标的位置
    const mousePosition = {
      x: x + item.offset.offsetLeft,
      y: y + item.offset.offsetTop,
    };
    // 反算真实图片的位置
    const position = {
      x: mousePosition.x - setWidth * item.offset.offsetLeftPercent,
      y: mousePosition.y - setHeight * item.offset.offsetTopPercent,
    };
    const transform = `translate(${position.x}px,${position.y}px)`;
    let opacity = item.attribute?.textBackground?.opacity / 100 || 0.8;
    if (maskAsset.length > 0) {
      opacity = 0.3;
    }
    return {
      width: setWidth,
      height: setHeight,
      transform,
      WebkitTransform: transform,
      opacity,
    };
  }, [currentOffset]);
  useEffect(() => {
    if (isDragging && initialOffset) {
      const rect = getCanvasClientRect();
      canvasRect.current = rect;
      dragDistance.current = rect.left - initialOffset?.x;
      if (itemType !== 'module') {
        setSize({
          width: item.attribute.width * canvasInfo.scale,
          height: item.attribute.height * canvasInfo.scale,
        });
      } else {
        setSize(defaultSize);
      }
    }
  }, [isDragging, initialOffset]);
  return (
    <>
      {isDragging ? (
        <div style={{ ...layerStyles }}>
          <div style={getItemStyles}>{renderItem()}</div>
        </div>
      ) : null}
    </>
  );
});

export function DragLayer() {
  const { itemType, item } = useDragLayer(monitor => ({
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
  }));
  if (!(DRAG_ACCEPT_TYPE.includes(itemType) && item?.offset)) {
    return null;
  }
  return <DragLayerWrap />;
}
