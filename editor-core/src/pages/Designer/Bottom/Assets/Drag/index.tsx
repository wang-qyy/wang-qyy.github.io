import {
  forwardRef,
  PropsWithoutRef,
  Ref,
  useRef,
  useEffect,
  CSSProperties,
  MouseEvent,
} from 'react';
import { useDrag, useDragDropManager } from 'react-dnd';
import classNames from 'classnames';
import { getEmptyImage } from 'react-dnd-html5-backend';

import { ItemData } from '../Item';

interface ItemDragProps {
  data: ItemData;
  style?: CSSProperties;
  className?: string;
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
  children: any;
  canDrag?: boolean;
}

const ItemDrag = forwardRef(
  (props: PropsWithoutRef<ItemDragProps>, ref?: Ref<HTMLDivElement>) => {
    const { children, data, className, style, canDrag, ...others } = props;
    const dragItemRef = useRef<HTMLDivElement>(null);

    const [{ opacity, id }, drag, dragPreview] = useDrag({
      canDrag,
      type: data.asset.meta.type,
      item: {
        ...data,
        preview: children, // 必须有高度
      },
      collect: monitor => ({
        opacity: monitor.isDragging() ? 0 : 1,
        id: monitor.getHandlerId(),
      }),
    });

    useEffect(() => {
      dragPreview(getEmptyImage(), { captureDraggingState: true });
    }, []);

    drag(ref ?? dragItemRef);
    // console.log(id);

    return (
      <div
        tabIndex={data.asset.meta.id}
        className={classNames('asset-drag', className)}
        style={{ ...style, opacity }}
        ref={ref ?? dragItemRef}
        {...others}
      >
        {children}
      </div>
    );
  },
);

export default ItemDrag;
