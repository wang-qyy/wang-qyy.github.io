import { CSSProperties, PropsWithChildren, useEffect, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { DRAG_ACCEPT_TYPE } from '@/constants/drag';
import { getNewAssetSize } from '@/utils/assetHandler/init';

interface DraggableComponentProps {
  data: any;
  type: string;
  style?: CSSProperties;
  className?: string;
  onDrop?: (item: any) => void;
  canDrag?: boolean;
  onDrag?: () => void;
  onDragEnd?: () => void;
}
/**
 * @description 拖拽元素
 * @prop data 数据
 * @prop type 可选项 拖拽组件的类型 默认
 * @prop type 可选项 接受的放置类型
 * @prop onDrop 放置时执行的操作
 * */
export default function DragBox({
  data,
  style,
  children,
  onDrop,
  type,
  canDrag = true,
  onDrag,
  onDragEnd,
  ...res
}: PropsWithChildren<DraggableComponentProps>) {
  const [{ opacity, monitor }, drag, dragPreview] = useDrag(
    {
      type: type ?? 'pic',
      item: data,
      canDrag,
      collect: monitor => ({
        opacity: monitor.isDragging() ? 0 : 1,
        monitor,
      }),
      end: (item, monitor) => {
        if (monitor.getDropResult()) {
          onDrop && onDrop(data);
        }
      },
    },
    [data],
  );

  const [{ isOverCurrent }, drop] = useDrop(
    () => ({
      accept: DRAG_ACCEPT_TYPE,
      collect: monitor => {
        const overCurrent = monitor.isOver({ shallow: true });
        return {
          type,
          isOverCurrent: overCurrent,
        };
      },
    }),
    [data],
  );
  useEffect(() => {
    // 隐藏默认的拖拽样式
    dragPreview(getEmptyImage(), { captureDraggingState: true });
  }, []);
  useEffect(() => {
    if (monitor) {
      if (!opacity && monitor.isDragging()) {
        onDrag && onDrag();
      } else {
        onDragEnd && onDragEnd();
      }
    }
  }, [opacity]);
  const nodeD = useRef(null);
  drag(drop(nodeD));
  return (
    <div
      ref={nodeD}
      style={{
        ...style,
        opacity,
      }}
      {...res}
      onMouseDown={e => {
        const mousePosX = e.clientX;
        const mousePosY = e.clientY;
        const nodeOffset = nodeD.current?.getBoundingClientRect();
        const offsetLeft = mousePosX - nodeOffset.left;
        const offsetTop = mousePosY - nodeOffset.top;
        data.offset = {
          offsetLeft,
          offsetTop,
          offsetLeftPercent: offsetLeft / nodeOffset.width,
          offsetTopPercent: offsetTop / nodeOffset.height,
        };
        if (type !== 'text') {
          const targetSize = getNewAssetSize(data?.attribute, {
            isBackground:
              (data.meta.isBackground || data.meta.isOverlay) ?? false,
            type,
          });
          Object.assign(data.attribute, targetSize);
        }
      }}
    >
      {children}
    </div>
  );
}
