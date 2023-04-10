import {
  animationManager,
  AnimationType,
} from '@kernel/Canvas/TemplateTranstion/animation';
import React, { useMemo, CSSProperties } from 'react';
import {
  AssetClass,
  AssetItemProps,
  TemplateClass,
  VideoStatus,
} from '@kernel/typing';
import { PlayStatus } from '@kernel/utils/const';
import { useGetVideoStatus, getCanvasInfo } from '@/kernel/store';
import { useTranstionAniManager } from './transtionAnimation';

export function useAnimationStatus(
  { asset }: React.PropsWithChildren<AssetItemProps>,
  videoStatus: VideoStatus,
  template: TemplateClass,
) {
  const { currentTime } = videoStatus;
  const offsetTime = template?.videoInfo?.offsetTime || [0, 0];
  const currentPageTime = offsetTime[0] + currentTime;
  const { playStatus } = useGetVideoStatus();
  const {
    noAnimation,
    isAniIn,
    animatedTime,
    animationId,
    duration,
    animationDirection,
  } = useMemo(() => {
    if (!asset?.attribute?.animation) {
      return {
        noAnimation: true,
        isAniIn: false,
        animatedTime: 0,
        animationId: 0,
        duration: 0,
        animationDirection: -1,
      };
    }
    const { attribute, animationItemDuration: duration, meta } = asset;
    const { startTime = 0, endTime, animation } = attribute;
    let noAnimation = false;
    const isAniIn = duration.i > 0;
    let animatedTime = 0; // 已经动画的时间 - 渲染后续的动画到达状态
    let baseTime = isAniIn ? duration.i : duration.o;
    if (asset.meta.transferLocation === 'after') {
      baseTime = 0;
    }
    if (currentPageTime >= startTime && currentPageTime <= endTime) {
      // 当前为出场动画 - 有结束时间得才有出场动画
      animatedTime = currentPageTime - startTime + baseTime;
    } else {
      noAnimation = true;
    }
    if (currentPageTime >= endTime) {
      animatedTime = 2 * baseTime;
    }

    return {
      noAnimation,
      isAniIn,
      animatedTime,
      animationId: Number(animation?.exit.baseId),
      animationDirection: Number(animation?.exit.details.direction),
      duration,
    };
  }, [asset, currentPageTime]);

  const isPlaying = useMemo(() => {
    return playStatus === PlayStatus.Playing;
  }, [playStatus]);
  return {
    noAnimation,
    animationId,
    isAniIn,
    animatedTime,
    isPlaying,
    duration,
    animationDirection,
  };
}
// 进出场动画
export function useAnimationStyle(
  props: React.PropsWithChildren<AssetItemProps>,

  videoStatus: VideoStatus,
  template: TemplateClass,
) {
  const { asset, assetStyle } = props;
  const { playStatus } = videoStatus;
  const canvasInfo = getCanvasInfo();
  const {
    noAnimation,
    isAniIn,
    animatedTime,
    duration,
    animationId,
    animationDirection,
  } = useAnimationStatus(props, videoStatus, template);

  let animationStyle: CSSProperties = {};
  const containerStyle = assetStyle;
  animationStyle =
    noAnimation && !props?.asset
      ? {}
      : animationManager(isAniIn, animationId, {
          style: props.assetStyle as AnimationType['style'],
          canvasInfo,
          asset,
          animation: {
            id: animationId,
            currentTime: animatedTime,
            duration: isAniIn ? duration.i : duration.o,
            direction:
              asset?.attribute?.animation?.[isAniIn ? 'enter' : 'exit']?.details
                ?.direction,
          },
        });
  const calcStyle = useMemo(() => {
    // 上一个片段的样式
    let lastStyle: CSSProperties = {};
    let style: CSSProperties = {};
    if (asset && !noAnimation) {
      // console.log(
      //   'animationStyle==========',
      //   toJS(asset?.attribute.animation),
      //   animationStyle,
      //   canvasInfo.width,
      //   getCurrentTemplateIndex(),
      //   getRelativeCurrentTime(),
      // );
      if (asset.meta.transferLocation === 'after') {
        // 当前片段的样式
        style = {
          ...animationStyle,
          position: 'absolute',
        };
        // 缩放效果
        if (animationId === 2) {
          if (isAniIn) {
            // 放大效果
            lastStyle = {
              ...animationStyle,
              position: 'absolute',
              zIndex: 103,
            };
            style = {};
          } else {
            // 缩小
            lastStyle = {};
          }
        }
        // 淡入淡出效果
        if (animationId === 3) {
          // 放大效果
          lastStyle = {
            ...animationStyle,
            position: 'absolute',
            zIndex: 103,
          };
          style = {};
        }
        // 移动效果
        if (animationId === 1 || animationId === 4) {
          delete style?.left;
          delete style?.top;
          style.transform = `translate(${animationStyle?.left}px,${animationStyle?.top}px)`;
          switch (animationDirection) {
            // 进入方向（1：上，2：右，3：下，4：左）
            case 1:
              lastStyle = {
                ...style,
                transform: `translate(${0}px,${
                  Number(animationStyle?.top) + Number(canvasInfo.height ?? 0)
                }px)`,
                // top:
                //   Number(animationStyle?.top) + Number(canvasInfo.height ?? 0),
              };
              break;
            case 2:
              lastStyle = {
                ...style,
                transform: `translate(${
                  Number(animationStyle?.left) - canvasInfo.width
                }px,${0}px)`,
                // left: Number(animationStyle?.left) - canvasInfo.width,
              };
              break;
            case 3:
              lastStyle = {
                ...style,
                transform: `translate(${0}px,${
                  Number(animationStyle?.top) - canvasInfo.height
                }px)`,
                // top: Number(animationStyle?.top) - canvasInfo.height,
              };
              break;
            case 4:
              lastStyle = {
                ...style,
                transform: `translate(${
                  Number(animationStyle?.left) + canvasInfo.width
                }px,${0}px)`,
                // left: Number(animationStyle?.left) + canvasInfo.width,
              };
              break;
          }
        }
      } else {
        // 当前片段的样式
        lastStyle = {
          ...animationStyle,
          position: 'absolute',
        };
        // 缩放效果
        if (animationId === 2) {
          if (isAniIn) {
            // 放大效果
            style = {
              ...animationStyle,
              position: 'absolute',
              zIndex: 103,
            };
            lastStyle = {};
          } else {
            // 缩小
            lastStyle.zIndex = 103;
            style = {};
          }
        }
        // 淡入淡出效果
        if (animationId === 3) {
          // 放大效果
          style = {
            ...animationStyle,
            position: 'absolute',
            zIndex: 103,
          };
          lastStyle = {};
        }
        // 移动效果
        if (animationId === 1 || animationId === 4) {
          delete lastStyle?.left;
          delete lastStyle?.top;
          lastStyle.transform = `translate(${animationStyle?.left}px,${animationStyle?.top}px)`;
          switch (animationDirection) {
            case 1:
              style = {
                ...lastStyle,
                transform: `translate(${0}px,${
                  Number(animationStyle?.top) + (canvasInfo.height ?? 0)
                }px)`,
                // top: Number(animationStyle?.top) + (canvasInfo.height ?? 0),
              };
              break;
            case 2:
              style = {
                ...lastStyle,
                transform: `translate(${
                  Number(animationStyle?.left) - (canvasInfo.width ?? 0)
                }px,${0}px)`,
                // left: Number(animationStyle?.left) - (canvasInfo.width ?? 0),
              };
              break;
            case 3:
              style = {
                ...lastStyle,
                transform: `translate(${0}px,${
                  Number(animationStyle?.top) - (canvasInfo.height ?? 0)
                }px)`,
                // top: Number(animationStyle?.top) - (canvasInfo.height ?? 0),
              };
              break;
            case 4:
              style = {
                ...lastStyle,
                transform: `translate(${
                  Number(animationStyle?.left) + (canvasInfo.width ?? 0)
                }px,${0}px)`,
                // left: Number(animationStyle?.left) + (canvasInfo.width ?? 0),
              };
              break;
          }
        }
      }
    }

    return {
      style,
      lastStyle,
    };
  }, [animationStyle]);
  return {
    isAniIn,
    animationStyle: calcStyle,
    containerStyle,
  };
}
// 转场
export function useTranstionStyle(
  videoStatus: VideoStatus,
  template: TemplateClass,
) {
  const { currentTime } = videoStatus;
  const offsetTime = template?.videoInfo?.offsetTime || [0, 0];
  const currentPageTime = offsetTime[0] + currentTime;
  const props = useMemo(() => {
    let asset: AssetClass;
    if (template) {
      const { endTransfer, startTransfer } = template;
      if (endTransfer) {
        const { startTime, endTime } = endTransfer?.attribute;
        if (currentPageTime >= startTime && currentPageTime <= endTime) {
          asset = endTransfer;
        }
      }
      if (startTransfer) {
        const { startTime, endTime } = startTransfer?.attribute;
        if (currentPageTime >= startTime && currentPageTime <= endTime) {
          asset = startTransfer;
        }
      }
    }
    return {
      asset,
      assetStyle: { left: 0, top: 0 },
      isPreviewMovie: true,
      previewAll: false,
    };
  }, [template, currentPageTime]);
  const { animationStyle } = useAnimationStyle(props, videoStatus, template);
  // 1 const { style: pathStyle } = useTranstionAniManager(
  //   'hc-core-canvas-transtion',
  //   props,
  // );
  return {
    animationType: props?.asset?.meta?.transferLocation,
    style: {
      style: {
        // ...pathStyle.style,
        ...animationStyle.style,
      },
      lastStyle: {
        // ...pathStyle.lastStyle,
        ...animationStyle.lastStyle,
      },
    },
  };
}
