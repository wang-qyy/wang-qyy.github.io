import { Position } from '../types';

export interface DragItemHandlerInfo {
  distanceX: number;
  distanceY: number;
  event: MouseEvent;
}

export type DragItemHandlerFC = (info: DragItemHandlerInfo) => void;

export class DragItemHandler {
  // 鼠标按下时的位置
  originalPosition: Position;

  position = {
    left: 0,
    top: 0,
  };

  hooks: {
    onMouseMove: DragItemHandlerFC;
    onMouseUp: DragItemHandlerFC;
  };

  /**
   * @param originalPosition 鼠标按下时的位置
   * @param hooks 钩子回调函数
   */
  constructor(
    originalPosition: Position,
    hooks: {
      onMouseMove: DragItemHandlerFC;
      onMouseUp: DragItemHandlerFC;
    },
  ) {
    this.originalPosition = originalPosition;
    this.hooks = hooks;
  }

  calcMoveDistance = ({ left, top }: Position) => {
    return {
      left: left - this.originalPosition.left,
      top: top - this.originalPosition.top,
    };
  };

  onMouseUp = (event: MouseEvent) => {
    const { pageX: left, pageY: top } = event;
    this.position = this.calcMoveDistance({ left, top });

    this.hooks.onMouseUp({
      distanceX: this.position.left,
      distanceY: this.position.top,
      event,
    });
    window.removeEventListener('mouseup', this.onMouseUp);
    window.removeEventListener('mousemove', this.onMouseMove);
  };

  onMouseMove = (event: MouseEvent) => {
    const { pageX: left, pageY: top } = event;
    this.position = this.calcMoveDistance({ left, top });

    this.hooks.onMouseMove({
      distanceX: this.position.left,
      distanceY: this.position.top,
      event,
    });
  };

  onMouseDown = () => {
    window.addEventListener('mouseup', this.onMouseUp);
    window.addEventListener('mousemove', this.onMouseMove);
  };
}
