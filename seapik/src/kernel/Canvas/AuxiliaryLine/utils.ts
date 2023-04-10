import { Auxiliary, AuxiliaryItem, Position } from '@/kernel';
import {
  AuxiliaryLineBase,
  AuxiliaryLineStyle,
  AuxiliaryPoints,
} from '@kernel/Canvas/AuxiliaryLine/hooks';
import { auxiliaryPointsMatching } from '@kernel/utils/auxiliaryLineHandler';

const directionKeys: Array<keyof Auxiliary> = ['horizontal', 'vertical'];
export function calcAuxiliaryLine(
  auxiliaryPoints: AuxiliaryPoints,
  auxiliaryPointsKeys: Array<keyof AuxiliaryPoints>,
  current: Auxiliary,
  position: Position,
) {
  const styles: AuxiliaryLineStyle = {
    vertical: undefined,
    horizontal: undefined,
  };
  // 辅助线数据
  const auxiliaryInfo: AuxiliaryLineBase<{
    index: number;
    position: Position;
  }> = {
    vertical: undefined,
    horizontal: undefined,
  };
  auxiliaryPointsKeys.forEach(index => {
    const itemPoint = auxiliaryPoints[index];
    directionKeys.forEach(key => {
      const result = auxiliaryPointsMatching(key, itemPoint, current);

      if (result) {
        // 设置命中线条的样式
        styles[key] = {
          [result.currentKey]: result.style,
        };

        // 设置辅助线信息，为命中元素添加边框
        // 当辅助线为画布时，不需要选中状态
        auxiliaryInfo[key] = {
          position: result.position,
          index: index === 'canvas' ? -1 : Number(index),
        };
      }
    });
  });

  const newPosition = {
    ...position,
  };
  const targetIndex: number[] = [];
  // 命中数据中存在横轴数据
  if (auxiliaryInfo.horizontal) {
    const { position, index } = auxiliaryInfo.horizontal;
    newPosition.left = position.left;
    targetIndex.push(index);
  }
  // 命中数据中存在纵轴数据
  if (auxiliaryInfo.vertical) {
    const { position, index } = auxiliaryInfo.vertical;
    newPosition.top = position.top;
    targetIndex.push(index);
  }
  return {
    styles,
    targetIndex,
    position: newPosition,
  };
}
