import {
  animationManager,
  AnimationType,
} from '@kernel/Asset/Item/CanvasAnimationWrap/animation';
import React, { useMemo, CSSProperties } from 'react';
import { AssetItemProps } from '@kernel/typing';
import { PlayStatus } from '@kernel/utils/const';
import { getBgAnimationStyle } from '@AssetCore/Item/CanvasAnimationWrap/bgAnimation';

const aniDurationTime = 500;

export function useAnimationStatus({
  videoInfo,
  asset,
  videoStatus,
}: React.PropsWithChildren<AssetItemProps>) {
  const { attribute, animationItemDuration: duration } = asset;
  const { allAnimationTime } = videoInfo;
  const { currentTime, playStatus } = videoStatus;
  const { startTime = 0, endTime = allAnimationTime, animation } = attribute;

  const { noAnimation, isAniIn, animatedTime, animationId } = useMemo(() => {
    if (!animation) {
      return {
        noAnimation: true,
        isAniIn: false,
        animatedTime: 0,
        animationId: 0,
      };
    }

    let noAnimation = false;
    let isAniIn = true;
    let animatedTime = 0; // 已经动画的时间 - 渲染后续的动画到达状态

    if (
      currentTime >= startTime - duration.i &&
      currentTime <= startTime &&
      animation?.enter?.baseId > 0
    ) {
      // 当前为入场动画
      isAniIn = true;
      animatedTime = duration.i - (startTime - currentTime);
    } else if (
      endTime &&
      currentTime >= endTime - duration.o &&
      currentTime <= endTime &&
      animation.exit.baseId > 0
    ) {
      // 当前为出场动画 - 有结束时间得才有出场动画
      isAniIn = false;
      animatedTime = duration.o - (endTime - currentTime);
    } else {
      noAnimation = true;
    }

    if (isAniIn && currentTime >= startTime) {
      animatedTime = duration.i;
    }
    if (!isAniIn && currentTime >= endTime) {
      animatedTime = duration.o;
    }
    return {
      noAnimation,
      isAniIn,
      animatedTime,
      animationId: Number(
        isAniIn ? animation?.enter.baseId : animation?.exit.baseId,
      ),
    };
  }, [
    attribute,
    currentTime,
    animation?.enter.baseId,
    animation?.exit.baseId,
    duration.i,
    duration.o,
    endTime,
    startTime,
  ]);

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
  };
}

export function useAnimationStyle(
  props: React.PropsWithChildren<AssetItemProps>,
) {
  const {
    asset,
    assetStyle,
    isPreviewMovie,
    videoStatus,
    videoInfo,
    previewAll,
    manualPreview,
  } = props;
  const { animation, bgAnimation } = asset.attribute;
  const {
    noAnimation,
    isAniIn,
    animatedTime,
    isPlaying,
    duration,
    animationId,
  } = useAnimationStatus(props);
  let animationStyle: CSSProperties = {};
  let containerStyle = assetStyle;
  if (bgAnimation?.id) {
    animationStyle = getBgAnimationStyle(
      bgAnimation.id,
      videoStatus.currentTime,
      videoInfo.pageTime,
    );
    containerStyle = { ...containerStyle, ...animationStyle };
  } else {
    animationStyle = {};

    const noNeedAni =
      noAnimation || (!isPlaying && (!isPreviewMovie || previewAll));

    if (manualPreview || !noNeedAni) {
      animationStyle = animationManager(isAniIn, animationId, {
        style: props.assetStyle as AnimationType['style'],
        canvasInfo: {
          ...props.canvasInfo,
          scale: 1,
        },
        asset,
        animation: {
          id: animationId,
          currentTime: animatedTime,
          duration: isAniIn ? duration.i : duration.o,
          direction:
            animation?.[isAniIn ? 'enter' : 'exit']?.details?.direction,
        },
      });
    }

    if (animationId === 1) {
      if (animationStyle.left != null) {
        // 动画移动改为 修改 left top 值
        // containerStyle = {...containerStyle,left : (style.left + (animationStyle.left || 0)),
        //     top : (style.top + (animationStyle.top || 0))}
        containerStyle = { ...containerStyle, ...animationStyle };
      } else {
        if (containerStyle.transform && animationStyle.transform) {
          // 原始数据有 transform 数据 需和动画变换 结合
          const _oldTransform = containerStyle.transform;
          containerStyle = { ...containerStyle, ...animationStyle };
          containerStyle.transform = `${_oldTransform} ${animationStyle.transform}`;
        } else {
          containerStyle = { ...containerStyle, ...animationStyle };
        }
      }
    }
  }
  return {
    animationStyle,
    containerStyle,
  };
}
