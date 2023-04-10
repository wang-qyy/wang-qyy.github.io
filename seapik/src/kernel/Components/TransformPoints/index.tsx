import React, { PropsWithChildren, useMemo, SyntheticEvent } from 'react';
import classnames from 'classnames';
import { rShow, stopPropagation } from '@kernel/utils/single';
import {
  PointNode,
  ResizePointStatic,
  getCursorByRotate,
  ResizePoint,
} from './handler';

const { circleCursorType, unLRTB, whole, TB, LR } = ResizePointStatic;

interface TransformPointsProps {
  pointList: PointNode[];
  triggerPointType: ResizePoint | '';
  rotate: number;
  onMouseDown: (event: SyntheticEvent, pointType: ResizePoint) => void;
  className?: string;
}

interface RotatePointProps {
  rotate: number;
  showRotator: boolean;
  onMouseDown: (event: SyntheticEvent) => void;
}

function useGetKeyRotate(rotate: number) {
  return useMemo(() => {
    return getCursorByRotate(rotate);
  }, [rotate]);
}

function RotatePoint({ rotate, showRotator, onMouseDown }: RotatePointProps) {
  const cursorTypeKeyRotate = useGetKeyRotate(rotate);
  return (
    <i
      className={`rt_rotate rt_rotate_${cursorTypeKeyRotate}`}
      onMouseDown={onMouseDown}
    >
      <span
        className="rt_rotate_shower"
        style={{
          ...rShow(showRotator),
          transform: `rotate(${-(rotate ?? 0)}deg)`,
        }}
      >
        <span className="rt_rotate_count">{rotate ?? 0}°</span>
      </span>
    </i>
  );
}

function TransformPoints(props: PropsWithChildren<TransformPointsProps>) {
  const {
    pointList,
    triggerPointType,
    rotate,
    onMouseDown,
    children,
    className: propsClassName = '',
  } = props;

  const cursorTypeKeyRotate = useGetKeyRotate(rotate);

  function getPointClassName(point: PointNode) {
    const { className, pointType, cursorKey } = point;
    return `${className} ${
      triggerPointType === pointType ? 'element-item-show' : ''
    } ${circleCursorType[(cursorKey + cursorTypeKeyRotate) % 4]} ${
      pointType === 'lock' ? 'pointer' : ''
    }`;
  }
  return (
    <div
      className={classnames({
        [propsClassName]: true,
        'element-transformer': true,
        'element-transformer-hidden': triggerPointType !== '',
      })}
    >
      {pointList.map(item => (
        <i
          editor-aria-label={item.pointType === 'lock' ? '点击解除锁定' : ''}
          key={item.pointType}
          className={getPointClassName(item)}
          onDragStart={stopPropagation}
          onMouseDown={(event: SyntheticEvent) => {
            onMouseDown(event, item.pointType);
          }}
        />
      ))}
      {children}
    </div>
  );
}

TransformPoints.RotatePoint = RotatePoint;
export default TransformPoints;
