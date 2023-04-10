import { CSSProperties, PropsWithChildren, useRef, LegacyRef } from 'react';
import { useDrop, DropTargetMonitor } from 'react-dnd';
import classNames from 'classnames';
import { AssetType } from '@hc/editor-core';
import './index.less';
import { DRAG_ACCEPT_TYPE } from '@/constants/drag';

interface DropDustbinProps {
  acceptType?: AssetType | Array<AssetType>;
  /**
   * @param dragItem 拖拽源
   * @param offsetX 拖动源在X轴的偏移距离
   * @param offsetY 拖动源在Y轴的偏移距离
   * @param dropInfo 放置信息
   *
   */
  onDrop?: (data: { delta: any; dropInfo: any }) => void;
  className?: string;
  style?: CSSProperties;
  hoverStyle?: CSSProperties;
  onHover?: (item: any, monitor: DropTargetMonitor) => void;
  ExtraContent?: any;
}

function DropDustbin(props: PropsWithChildren<DropDustbinProps>) {
  const {
    style = {},
    hoverStyle,
    children,
    onDrop,
    className,
    onHover,
    ExtraContent,
  } = props;
  const defaultStyle = {
    border: '5px solid #5A4CDB',
    background: '#5A4CDB',
    opacity: 0.8,
  };
  const dropRef = useRef<HTMLDivElement>(null);
  const [{ isOver, isOverCurrent, item, itemType }, drop] = useDrop(
    () => ({
      accept: DRAG_ACCEPT_TYPE,
      collect: monitor => {
        return {
          isOver: monitor.isOver(),
          isOverCurrent: monitor.isOver({ shallow: true }),
          item: monitor.getItem(),
          itemType: monitor.getItemType(),
        };
      },
      drop: (item: any, monitor) => {
        const itemType = monitor.getItemType();

        if (itemType === 'TEMPLATE_DRAG') {
          item.replace('canvas');
          return;
        }

        if (monitor.isOver({ shallow: true })) {
          const delta = monitor.getClientOffset();
          onDrop && onDrop({ delta, dropInfo: item });
        }
      },
      hover: (item, monitor) => {
        const itemType = monitor.getItemType();

        if (itemType === 'TEMPLATE_DRAG') return;

        onHover && onHover(item, monitor);
      },
    }),
    [],
  );

  return (
    <div
      id="xiudodo-canvas"
      className={classNames('DropDustbin', className)}
      ref={drop(dropRef) as LegacyRef<HTMLDivElement>}
      style={{
        ...style,
        ...(isOverCurrent ? hoverStyle : {}),
        ...(item &&
          (item.meta?.isBackground ||
            ['TEMPLATE_DRAG', 'part'].includes(itemType))
          ? defaultStyle
          : {}),
      }}
    >
      {ExtraContent && <ExtraContent isOverCurrent={isOverCurrent} />}
      {children}
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
export default DropDustbin;
