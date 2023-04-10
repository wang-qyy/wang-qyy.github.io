import {
  PropsWithChildren,
  HTMLAttributes,
  useState,
  useRef,
  useMemo,
} from 'react';
import classNames from 'classnames';
import { AssetClass } from '@hc/editor-core';

import { useAssetDragStatus } from '@/store/adapter/useAssetDrag';

import { useAssetActions } from '../hooks';
import './index.less';

interface DragProps extends HTMLAttributes<HTMLDivElement> {
  data: AssetClass;
  onDrop: () => {};
}

export default function Drag(props: PropsWithChildren<DragProps>) {
  const { children, data, className, style, ...others } = props;

  const [position, setPosition] = useState<{ top: number; left: number }>({
    left: 0,
    top: 0,
  });
  const dragRef = useRef<HTMLDivElement>(null);

  const { isDragging, dragging, offset } = useAssetDragStatus();

  const actions = useAssetActions({
    asset: data,
    onMouseDown(e) {
      const { x = 0, y = 0 } = dragRef.current?.getBoundingClientRect() || {};
      setPosition({ left: x, top: y });
    },
  });

  const inDragging = useMemo(() => {
    return dragging.includes(data.id);
  }, [isDragging, dragging]);

  const { top, left } = position;
  const { x, y } = offset;
  const dragStyle = inDragging
    ? { position: 'fixed', zIndex: 10, left: left + x, top: top + y }
    : {};

  return (
    <div
      ref={dragRef}
      {...others}
      {...actions}
      className={classNames('designer-asset-drag', className)}
      style={{
        ...style,
        ...dragStyle,
      }}
    >
      {children}
    </div>
  );
}
