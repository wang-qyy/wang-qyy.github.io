import { ResizePoint } from '@kernel/Components/TransformPoints/handler';
import { CSSProperties, SyntheticEvent } from 'react';
import {
  AssetSizeAndPosition,
  Coordinate,
  PanelBorder,
  Position,
  RectLimit,
} from '@/kernel';
import { AuxiliaryLineStyle } from '@kernel/Canvas/AuxiliaryLine/hooks';
import { AssetClass } from '@/kernel/typing';

export interface Compensate {
  axlePoint: Coordinate;
  symmetryPoint: Coordinate;
}

export interface Size {
  width: number;
  height: number;
  compensate?: Compensate;
}

export interface TransformerHandlerParams {
  rotate: number;
  aspectRatio: boolean;
  style: TransformerProps['style'];
  onChange: (
    style: TransformerProps['style'],
    distance: { x: number; y: number },
  ) => void;
  onChangeEnd?: (style: TransformerProps['style']) => void;
  type: ResizePoint;
  rectLimit: {
    minRect?: RectLimit;
    maxRect?: RectLimit;
  };
  rotateCenter?: Coordinate;
  getRect: () => DOMRect;
}

export interface RotateHandlerParams {
  rotate: number;
  centerPoint: Coordinate;
  onChange: (style: { rotate: number }) => void;
  onChangeEnd?: (style: { rotate: number }) => void;
}

export interface MoveHandlerCallbackParams {
  styles: AuxiliaryLineStyle;
  position: Position;
  increment: Position;
  targetIndex?: number[];
}

export type SizeCalculator = (compensate: Compensate) => Size;

export interface Rotate {
  rotate: number;
}

export interface OriginCoordinate {
  x: number;
  y: number;
  width: number;
  height: number;
  left: number;
  top: number;
  fontSize?: number;
  container: AssetSizeAndPosition;
  asset: AssetSizeAndPosition;
  rectInfo: RectInfo;
}

export interface BaseSize {
  width: number;
  height: number;
  left: number;
  top: number;
  rotate?: number;
}

export interface RectInfo {
  rotate?: number;
  // 轴心坐标，也就是拖拽时的对称坐标
  axleX: number;
  axleY: number;
  // 原始的对称点坐标
  symmetryY: number;
  symmetryX: number;
  originCenterPoint: Coordinate;
  container: AssetSizeAndPosition;
  asset: AssetSizeAndPosition;
}

export interface ElementStyle {
  top: CSSProperties['top'];
  left: CSSProperties['left'];
  width: CSSProperties['width'];
  height: CSSProperties['height'];
  rotate?: number;
}

export type ElementStyleNumeral = Record<keyof ElementStyle, number>;

export type ListenerItem = () => void;

export interface Listeners {
  mouseMove?: ListenerItem;
  dragStart?: ListenerItem;
  mouseUp?: ListenerItem;
}

export interface Options {
  panelBorder?: PanelBorder;
}

export type GetElementStyle = () => ElementStyle;

export interface Hooks<T> {
  beforeMove?: (e: MouseEvent) => void;
  onMoving: (e: MouseEvent, position: T) => void;
  stopMove?: (e: MouseEvent) => void;
}

export interface TransformerChangerParams {
  style?: BaseSize;
  rotate?: number;
}

export type ChangeType = 'rotate' | ResizePoint;

export interface TransformerProps {
  className?: string;
  style: {
    width: number;
    height: number;
    left: number;
    top: number;
  };
  aspectRatio?: boolean;
  showPoints?: boolean;
  minRect?: RectLimit;
  maxRect?: RectLimit;
  rotate: number;
  nodes: ResizePoint[];
  rotateCenter?: Coordinate;
  getRect: () => DOMRect;
  locked?: boolean;
  rotatePoint?: boolean;
  onChange: (
    type: ChangeType,
    style: TransformerChangerParams,
    distance: { x: number; y: number },
  ) => void;
  onChangeEnd?: (type: ChangeType, style: TransformerChangerParams) => void;
  onChangeStart?: (type: ChangeType) => void;
  onClick?: (e: SyntheticEvent) => void;
  onMouseDown?: (e: SyntheticEvent) => void;
  onDoubleClick?: (e: SyntheticEvent) => void;
}
