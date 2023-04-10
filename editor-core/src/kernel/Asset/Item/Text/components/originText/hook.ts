import AssetItemState from '@/kernel/store/assetHandler/asset';
import { CacheImage } from '@kernel/utils/cacheImage';
import { SignatureEffect, SignatureEffectWord } from '@/kernel/typing';
import { deepCloneJson, StringToRGBA } from '@/kernel/utils/single';
import { useMemo } from 'react';
import { toJS } from 'mobx';
// 空layer
const emptyLayers = {
  backgroundClip: 'text',
  color: { r: 255, g: 255, b: 255, a: 0 },
  left: 0,
  linearGradient: undefined,
  strokeColor: undefined,
  top: 0,
  zindex: 0,
  backgroundURL: undefined,
};

/**
 * 转换渐变的角度
 * @param angle
 * @returns
 */
function analysisFillAngle(angle: number) {
  angle += 360;
  if (angle > 0 && angle < 90) {
    return angle;
  }
  if (angle >= 360) {
    angle -= 360;
  }
  if (angle > 0 && angle < 90) {
    return 90 - angle;
  }
  if (angle === 0) {
    angle = 90;
    return angle;
  }
  if (angle === 90) {
    angle = 0;
    return angle;
  }
  if (angle === 180) {
    angle = -90;
    return angle;
  }
  if (angle === 270) {
    angle = -180;
    return angle;
  }
  if (angle > 90 && angle < 270) {
    angle -= 180;
    return angle;
  }

  if (angle > 270 && angle < 360) {
    angle -= 180;
    return angle;
  }
}

const useTextFormatter = (asset: AssetItemState, isPreviewMovie: boolean) => {
  const { attribute } = asset;
  const { effectVariant, effectColorful } = attribute;
  /**
   * 获取单层的解析数据
   * @param effect
   * @param zindex
   * @param fillList
   * @param strokeList
   * @param shadowList
   * @param sourceList
   * @returns
   */
  const getEffectLayers = (
    effect: SignatureEffect,
    zindex: number,
    fillList: any[],
    strokeList: any[],
    shadowList: any[],
    sourceList: any[],
  ) => {
    const signerLayers = [];
    const topAsset = deepCloneJson(emptyLayers);
    topAsset.zindex = zindex;
    if (effect.left_diff) {
      const left = effect.left_diff / effect.fontSize;
      topAsset.left = left;
    }
    if (effect.top_diff) {
      const top = effect.top_diff / effect.fontSize;
      topAsset.top = top;
    }
    // 转换填充
    if (effect.fills.length > 0) {
      delete topAsset.backgroundClip;
      delete topAsset.linearGradient;
      delete topAsset.strokeColor;
      effect.fills.forEach((item, index) => {
        const fill = fillList[item];
        if (fill.value?.type === 'linear') {
          const colorStops = [];
          fill.value.colorStops.forEach(element => {
            colorStops.push({
              position: element.offset,
              color: StringToRGBA(element.color),
            });
          });
          topAsset.linearGradient = {
            angle: analysisFillAngle(fill.angle),
            colors: colorStops,
          };
          topAsset.backgroundClip = 'text';
        } else if (fill.value.type === 'pattern') {
          const imageUrl = sourceList[fill.value.sourceIndex];
          topAsset.backgroundClip = 'text';
          topAsset.backgroundURL = imageUrl;
          topAsset.backgroundSize = {
            width: 0.35,
            height: 0.35,
          };
        } else {
          topAsset.color = StringToRGBA(fill.value);
        }
      });
      topAsset.strokeColor = {
        r: 0,
        g: 0,
        b: 0,
        a: 0,
      };
    }

    // 转换描边
    if (effect.strokes.length > 0) {
      effect.strokes.forEach((item, index) => {
        const stroke = strokeList[item];
        if (stroke.value?.type === 'linear') {
          const colorStops = [];
          stroke.value.colorStops.forEach(element => {
            colorStops.push({
              position: element.offset,
              color: StringToRGBA(element.color),
            });
          });
          // 外描边:多添加一层layer 否则全部走居中描边的逻辑
          if (stroke.position === 'outsetFrame') {
            signerLayers.push(topAsset);
            signerLayers.push({
              ...topAsset,
              type: 'out',
              backgroundClip: 'text',
              linearGradient: {
                angle: analysisFillAngle(stroke.angle),
                colors: colorStops,
              },
              strokeWidth: stroke.width / effect.fontSize,
              color: { r: 255, g: 255, b: 255, a: 0 },
              strokeColor: {
                r: 0,
                g: 0,
                b: 0,
                a: 0,
              },
              zindex: zindex - 9,
            });
          } else {
            topAsset.linearGradient = {
              angle: analysisFillAngle(stroke.angle),
              colors: colorStops,
            };
            topAsset.strokeWidth = stroke.width / effect.fontSize;
            topAsset.strokeColor = {
              r: 0,
              g: 0,
              b: 0,
              a: 0,
            };
            signerLayers.push(topAsset);
          }
        } else {
          // 外描边:多添加一层layer 否则全部走居中描边的逻辑
          if (stroke.position === 'outsetFrame') {
            signerLayers.push(topAsset);
            signerLayers.push({
              ...topAsset,
              color: { r: 255, g: 255, b: 255, a: 0 },
              type: 'out',
              backgroundClip: 'text',
              strokeWidth: stroke.width / effect.fontSize,
              strokeColor: StringToRGBA(stroke.value),
              zindex: zindex - 9,
            });
          } else {
            topAsset.backgroundClip = 'text';
            topAsset.color = { r: 255, g: 255, b: 255, a: 0 };
            topAsset.strokeWidth = stroke.width / effect.fontSize;
            topAsset.strokeColor = StringToRGBA(stroke.value);
            signerLayers.push(topAsset);
          }
        }
      });
    } else {
      signerLayers.push(topAsset);
    }
    // 转换阴影
    effect.shadow.forEach((item, index) => {
      const shadow = shadowList[item];
      signerLayers.push({
        ...emptyLayers,
        shadowColor: StringToRGBA(shadow.color),
        shadowBlur: shadow.blur / effect.fontSize,
        shadowH: shadow.offsetX / effect.fontSize,
        shadowV: shadow.offsetY / effect.fontSize,
        // 单独的阴影层级，应是最低的
        zindex: zindex - 10,
      });
    });
    return signerLayers;
  };

  /**
   * 花字转换特效字结构
   * @param effectColorful 花字数据
   */
  function effectColorfulToEffectVariant(effectColorful: SignatureEffectWord) {
    let newLayers = [];
    const effect = deepCloneJson(effectColorful.effect);
    if (effect) {
      const {
        supportTexts = [],
        fillList,
        strokeList,
        shadowList,
        sourceList,
      } = effect;
      let zindex = supportTexts.length; // 最上面的一层图层
      // 第一层
      newLayers = getEffectLayers(
        effect,
        (supportTexts.length + 1) * 100,
        fillList,
        strokeList,
        shadowList,
        sourceList,
      );
      // 其他层;
      for (let i = supportTexts.length - 1; i >= 0; i--) {
        newLayers = getEffectLayers(
          { ...supportTexts[i], fontSize: effect.fontSize },
          zindex * 100,
          fillList,
          strokeList,
          shadowList,
          sourceList,
        ).concat(newLayers);
        zindex -= 1;
      }
    }

    return newLayers;
  }

  const formatLayers = useMemo(() => {
    // 特效字
    if (effectVariant && effectVariant.layers) {
      return effectVariant.layers;
    }
    // 花字
    if (effectColorful) {
      return effectColorfulToEffectVariant(effectColorful);
    }
    return [];
  }, [effectVariant, effectColorful?.effect]);

  const assetkey = attribute.effect || effectColorful?.resId;

  return { layers: formatLayers, assetkey };
};
export default useTextFormatter;
