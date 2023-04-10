import { PropsWithChildren, MouseEvent, CSSProperties, ReactNode } from 'react';
import { useSetState } from 'ahooks';
import { ModalProps } from 'antd';
import { CloseOutlined } from '@ant-design/icons';

import ReactDOM from 'react-dom';

import './index.less';
import { mouseMoveDistance, stopPropagation } from '@/utils/single';

interface DraggableModalProps extends ModalProps {
  /** 对话框是否可见 */
  visible?: boolean;
  /** 标题 */
  title?: ReactNode | string;
  defaultPosition?: {
    right: number;
    top: number;
  };
  /** 是否显示右上角的关闭按钮 */
  closable?: boolean;
  /** 点击确定回调 */
  onOk?: (e: MouseEvent<HTMLElement>) => void;
  /** 点击模态框右上角叉、取消按钮、Props.maskClosable 值为 true 时的遮罩层或键盘按下 Esc 时的回调 */
  onCancel?: (e: MouseEvent<HTMLElement>) => void;
  /** 宽度 */
  width?: string | number;
  style?: CSSProperties;
  wrapClassName?: string;
  maskTransitionName?: string;
  transitionName?: string;
  className?: string;
  bodyStyle?: CSSProperties;
}

export default function DraggableModal(
  props: PropsWithChildren<DraggableModalProps>,
) {
  const {
    title,
    children,
    visible,
    onCancel,
    onOk,
    width,
    style,
    className,
    // 初始位置
    defaultPosition = { right: 50, top: 100 },
    ...others
  } = props;
  const [initPosition, setInitPosition] = useSetState(defaultPosition);
  // 默认的尺寸
  const initSize = {
    width: width ?? style?.width ?? 220,
    height: style?.height ?? 615,
  };
  const [position, setPosition] = useSetState(defaultPosition);
  const [size, setSize] = useSetState(initSize);

  const maxTop = window.innerHeight - Number(size.height);
  const maxLeft = window.innerWidth - Number(size?.width);

  function handleMove(e: MouseEvent<HTMLDivElement>) {
    stopPropagation(e);
    e.preventDefault();
    mouseMoveDistance(e, (distanceX, distanceY) => {
      let { right, top } = position;

      right -= distanceX;
      top += distanceY;

      if (top < 0) {
        top = 0;
      } else if (top > maxTop) {
        top = maxTop;
      }

      if (right < 0) {
        right = 0;
      } else if (right > maxLeft) {
        right = maxLeft;
      }

      setPosition({ right, top });
      setInitPosition({ right, top });
    });
  }

  // 拖动设置高度
  function handleResetHeight(e: MouseEvent<HTMLDivElement>) {
    stopPropagation(e);
    e.preventDefault();
    mouseMoveDistance(e, (distanceX, distanceY) => {
      let { height } = size;
      height = distanceY + Number(height);

      if (height < 100) {
        height = 100;
      }
      if (height > 850) {
        height = 850;
      }

      setSize({ height });
    });
  }
  // 拖动设置宽度
  function handleResetWidth(
    e: MouseEvent<HTMLDivElement>,
    type: 'left' | 'right',
  ) {
    e.preventDefault();
    mouseMoveDistance(e, (distanceX, distanceY) => {
      let { width } = size;
      if (distanceX > 80) {
        return;
      }
      if (type === 'right') {
        width = distanceX + Number(width);
        let right = Math.min(initPosition.right, position.right - distanceX);
        if (initPosition.right === right) {
          right -= distanceX;
        }
        if ((width >= 300 && distanceX > 0) || width <= 220) {
          return;
        }
        setPosition({
          right,
        });
      } else {
        width = -distanceX + Number(width);
      }
      if (width < initSize.width) {
        width = initSize.width;
      }
      if (width > 300) {
        width = 300;
      }

      setSize({ width });
    });
  }

  if (!visible) return null;

  return ReactDOM.createPortal(
    <div
      className={`xiudodo-dragable-modal ${className}`}
      style={{
        minHeight: 100,
        width,
        ...style,
        ...size,
        ...position,
        boxShadow: '0px 2px 4px 0px rgba(226, 199, 199, 0.5)',
      }}
      {...others}
    >
      <div className="xiudodo-dragable-modal-header" onMouseDown={handleMove}>
        <div className="xiudodo-dragable-modal-title">{title}</div>
        <div className="xiudodo-dragable-modal-close" onClick={onCancel}>
          <CloseOutlined />
        </div>
      </div>
      {children}

      <div
        className="xiudodo-dragable-modal-resize-bottom"
        onMouseDown={handleResetHeight}
      />
      <div
        className="xiudodo-dragable-modal-resize-left"
        onMouseDown={e => {
          handleResetWidth(e, 'left');
        }}
      />
      <div
        className="xiudodo-dragable-modal-resize-right"
        onMouseDown={e => {
          handleResetWidth(e, 'right');
        }}
      />
    </div>,
    document.getElementById('xiudodo') as Element,
  );
}
