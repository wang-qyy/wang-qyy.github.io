import {
  getAssetList,
  getMoveAsset,
  getCanvasStatus,
  getCanvasInfo,
  useGetVideoStatus,
  useGetCanvasInfoByScale,
} from '@kernel/store';
import { CSSProperties, useMemo } from 'react';
import {
  Asset,
  AuxiliaryItem,
  Auxiliary,
  Position,
  AssetClass,
} from '@kernel/typing';
import { PlayStatus } from '@kernel/utils/const';
import { calculateAssetPoint } from '@kernel/utils/auxiliaryLineHandler';
import { calcAuxiliaryLine } from '@kernel/Canvas/AuxiliaryLine/utils';

export interface AuxiliaryLineStyle {
  vertical?: Partial<Record<keyof AuxiliaryItem, CSSProperties>>;
  horizontal?: Partial<Record<keyof AuxiliaryItem, CSSProperties>>;
}

export interface AuxiliaryLineBase<T> {
  vertical?: T;
  horizontal?: T;
}

export type AuxiliaryPoints = Record<number | string, Auxiliary>;

export type AuxiliaryLinePosition = AuxiliaryLineBase<Position>;

export function useGetCanvasAuxiliary() {
  const { width, height } = useGetCanvasInfoByScale();
  return useMemo<Auxiliary>(() => {
    return calculateAssetPoint({ width, height }, { x: 0, y: 0 }, 0);
  }, [width, height]);
}

export function useGetAuxiliaryPoints(asset?: AssetClass) {
  const { inClipping } = getCanvasStatus();
  const canvasAuxiliary = useGetCanvasAuxiliary();
  const assets = getAssetList();
  const { currentTime, playStatus } = useGetVideoStatus();
  const moveAsset = asset || getMoveAsset();

  return useMemo(() => {
    let result: Record<number | string, Auxiliary> = {};
    // 不生效的情况：播放中，裁剪中
    if (!inClipping && playStatus !== PlayStatus.Playing && moveAsset) {
      result = {
        canvas: canvasAuxiliary,
      };

      assets?.forEach((item, index) => {
        const { attribute, transform, auxiliary } = item;
        const withoutCurrent = item !== moveAsset;
        const inVideo =
          currentTime >= attribute.startTime &&
          currentTime <= attribute.endTime;
        // todo 暂时不支持旋转的对齐
        const noRotate = !transform.rotate;

        if (withoutCurrent && inVideo && noRotate && auxiliary) {
          result[index] = auxiliary;
        }
      });
    }
    return {
      points: result,
      pointKeys: Object.keys(result),
    };
  }, [inClipping, playStatus, moveAsset]);
}
