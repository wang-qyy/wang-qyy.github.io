import { useRef } from 'react';
import { Button, message, Upload } from 'antd';
import {
  AeAItem,
  useAssetAeAByObserver,
  useAssetKwByOberver,
  AeA,
} from '@hc/editor-core';
import { transformLayer } from './old';
import './index.modules.less';

export const animationTypeImport: any = {
  in: 'i',
  out: 'o',
  stay: 's',
  free: 's',
};
export type typeKeyImport = keyof typeof animationTypeImport;

export const useAnimationImport = () => {
  const checkAE = (data: any) => {
    if (data.fr !== 30 || data.layers.length !== 1) {
      // 帧率
      message.warn('导入数据不符合要求！');
      return undefined;
    }
    if (data.layers && data.layers[0]) {
      const layer = data.layers[0].ks;
      if (!layer.o || !layer.r || !layer.p || !layer.a || !layer.s) {
        message.warn('导入数据不符合要求！');
        return undefined;
      }
      if (
        !(
          layer.p.a === 0 ||
          layer.p.a === 1 ||
          layer.p.s ||
          (layer.p.x && layer.p.y && layer.p.z)
        )
      ) {
        message.warn('导入数据动画位置不符合要求！');
        return undefined;
      }
    }
    try {
      const { totalFrames, ks } = transformLayer(data.layers[0], 1);

      if (ks.o && ks.r && ks.p && ks.a && ks.s) {
        const aea: AeAItem = {
          kw: {
            ip: data.ip, // 开始帧
            op: totalFrames, // 结束帧
            ks,
            // isText: true,
            // textDelay: 200,
          },
          pbr: 1,
          resId: '-1',
        };
        return aea;
      }
      message.warn('导入数据动画位置不符合要求！');
    } catch (error) {
      message.warn('导入数据动画位置不符合要求！');
    }
  };
  return { checkAE };
};
export const useSetAnimation = () => {
  const {
    value,
    kw,
    update,
    preview,
    previewEnd,
    clear,
    updatePbr,
    assetAeaDuration,
    max,
  } = useAssetAeAByObserver();
  const { update: updateKw, clear: clearKw } = useAssetKwByOberver();
  const setAnimationPreview = (animation: any) => {
    previewEnd();
    preview(animation.type === 'in' ? 'i' : 'o', animation.id, 1);
  };
  // 设置动画
  const setAnimation = (animation: any) => {
    setAnimationPreview(animation);
    if (['in', 'out', 'stay'].includes(animation.type)) {
      update(animationTypeImport[animation.type], animation.id);
    } else {
      updateKw(animation.id);
    }
    message.success('动画设置成功！');
  };
  // 设置动画速度
  function setAnimationSpeed(type: string, speed: number) {
    const key = animationTypeImport[type];
    updatePbr(key, speed);
    previewEnd();
    preview(type === 'in' ? 'i' : 'o', value[key]?.resId, speed);
  }
  // 清空动画
  const clearAnimation = (type: string) => {
    if (type === 'free') {
      clearKw();
    } else {
      clear(type === 'in' ? 'i' : 'o');
    }
  };
  return {
    value,
    kw,
    assetAeaDuration,
    max,
    setAnimationPreview,
    setAnimation,
    setAnimationSpeed,
    clearAnimation,
  };
};
