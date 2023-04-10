import { CSSProperties, PropsWithChildren, useEffect, MouseEvent } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { AssetClass, toJS } from '@hc/editor-core';
import { getEmptyImage } from 'react-dnd-html5-backend';

interface DraggableComponentProps {
  data: {
    asset: AssetClass;
  };
  style?: CSSProperties;
  onDrop?: (item: any, change: {}) => void;
  type?: string;
  acceptType?: string;
  onClick?: Function;
}
/**
 * @description 拖拽元素
 * @prop data 数据
 * @prop type 可选项 拖拽组件的类型 默认
 * @prop acceptType 可选项 接受的放置类型
 * @prop onDrop 放置时执行的操作
 * */
export default function DraggableComponent({
  data,
  style,
  children,
  onDrop,
  type,
  acceptType,
  ...res
}: PropsWithChildren<DraggableComponentProps>) {
  const [{ opacity }, drag, dragPreview] = useDrag({
    type: type ?? data.asset.meta.type,
    item: data,
    collect: monitor => ({
      opacity: monitor.isDragging() ? 0 : 1,
    }),
  });

  const [{ isOverCurrent, direction }, drop] = useDrop(
    () => ({
      accept: acceptType ?? [
        'videoE',
        'image',
        'background',
        'pic',
        'SVG',
        'group',
        'container',
        'chart',
        'table',
        'lottie',
        'video',
        'text',
        'module',
        'mask',
      ],
      collect: monitor => {
        const dragItem: AssetClass = monitor.getItem();
        const overCurrent = monitor.isOver({ shallow: true });
        let moveDirection = '';

        if (overCurrent && dragItem.meta?.id !== data.asset.meta?.id) {
          if (dragItem.transform?.zindex > data.asset.transform?.zindex) {
            moveDirection = 'down';
          } else {
            moveDirection = 'up';
          }
        }

        return {
          direction: moveDirection,
          isOverCurrent: overCurrent,
        };
      },
      drop: (dragItem: any, monitor) => {
        if (monitor.isOver({ shallow: true })) {
          const delta = monitor.getDifferenceFromInitialOffset();

          const params = {
            offsetX: delta.x,
            offsetY: delta.y,
            dropInfo: data,
          };

          if (dragItem.meta?.id !== data.meta?.id) {
            params.zIndex = data.asset.transform?.zindex;
          }

          onDrop && onDrop(dragItem, params);
        }
      },
    }),
    [data, { ...data.asset.attribute }, data.asset.transform?.zindex],
  );

  useEffect(() => {
    dragPreview(getEmptyImage(), { captureDraggingState: true });
  }, []);

  return (
    <>
      <div
        ref={node => drag(drop(node))}
        style={{
          position: 'absolute',
          ...style,
          opacity,
        }}
        {...res}
      >
        {children}
      </div>
      <div
        style={{
          position: 'absolute',
          width: '100%',
          borderTop: '1px solid #5A4CDB',
          display: isOverCurrent ? 'block' : 'none',
          ...(direction === 'up' ? { top: -6 } : { bottom: -6 }),
        }}
      />
    </>
  );
}
