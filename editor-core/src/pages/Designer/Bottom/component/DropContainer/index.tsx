import {
  CSSProperties,
  PropsWithChildren,
  useRef,
  forwardRef,
  useEffect,
} from 'react';
import { useDrop, DropTargetMonitor } from 'react-dnd';
import { AssetType } from '@hc/editor-core';
import classNames from 'classnames';
import './index.less';

const acceptTypes = [
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
];

interface DropContainerProps {
  acceptType?: AssetType | AssetType[];
  /**
   * @param dragItem 拖拽源
   * @param offsetX 拖动源在X轴的偏移距离
   * @param offsetY 拖动源在Y轴的偏移距离
   * @param dropInfo 放置信息
   *
   */
  onDrop?: (
    dragItem: any,
    change?: {
      offsetX: number;
      offsetY: Number;
      zIndex: number;
      dropInfo: any;
    },
  ) => void;
  className?: string;
  style?: CSSProperties;
  data?: any;
  hoverStyle?: CSSProperties;
  onHover?: (item: any, monitor: DropTargetMonitor) => void;
}

function DropContainer(props: PropsWithChildren<DropContainerProps>, ref: any) {
  const {
    acceptType = acceptTypes,
    style = {},
    hoverStyle = {},
    children,
    onDrop,
    data,
    className,
    onHover,
  } = props;

  const dropRef = useRef<HTMLDivElement>(ref);
  const [{ isOver, isOverCurrent }, drop] = useDrop(
    () => ({
      accept: acceptType,
      collect: monitor => {
        // console.log("collect monitor.getItem", monitor.getItem());

        return {
          isOver: monitor.isOver(),
          isOverCurrent: monitor.isOver({ shallow: true }),
        };
      },
      drop: (item, monitor) => {
        // console.log('useDrop drop data', data);
        // console.log('useDrop drop', monitor.isOver({ shallow: true }));
        if (monitor.isOver({ shallow: true })) {
          const delta = monitor.getDifferenceFromInitialOffset();
          // console.log('useDrop drop monitor', delta, onDrop);
          onDrop &&
            onDrop(item, {
              offsetX: delta.x,
              offsetY: delta.y,
              zIndex: data?.maxZIndex,
              dropInfo: data,
            });
        }
      },
      hover: (item, monitor) => {
        onHover && onHover(item, monitor);
      },
    }),
    [data],
  );

  const containerHeight =
    dropRef.current?.children?.[0]?.getBoundingClientRect().height;
  drop(dropRef);

  return (
    <div
      className={classNames('dropContainer', className)}
      ref={dropRef}
      style={{
        backgroundColor: isOverCurrent ? '#34363f' : '',
        height: containerHeight ?? 0,
        ...style,
        ...(isOverCurrent ? hoverStyle : {}),
      }}
    >
      {children}

      {/* {isOver && (
          <div style={{ background: 'red', width: 50, height: 30 }}>isOver</div>
        )} */}
    </div>
  );
}

/**
 * @prop acceptType 接受类型
 * @prop onDrop 放置时执行的操作
 * @prop data 数据
 * @prop hoverStyle
 * @prop onHover
 */
export default forwardRef(DropContainer);
