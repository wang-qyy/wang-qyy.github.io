import React, { CSSProperties } from 'react';
import {
  forEachText,
  getAllTextLength,
} from '@AssetCore/Item/Text/components/originText/utils';
import {
  Refs,
  TextPositionObject,
} from '@AssetCore/Item/Text/components/originText/typing';
import { AeA, AeAItem, AeAKw, Animation, AssetClass } from '@/kernel/typing';
import {
  textAniShowByLine,
  textBounceAnimation,
  textRollAnimation,
  textTypeAnimation,
  textWriteAnimation,
} from '@AssetCore/Item/Text/textHelper/oldUtils';
import { AnimationParams } from '@AssetCore/Item/Text/hooks';
import AeaAnimation from '@AssetCore/Item/Text/textHelper/aeaAnimation';
import { aeAKey } from '@AssetCore/Item/Text/textHelper/aeaAnimation/const';
import { AEA_TEXT_DURATION } from '@/kernel/store/assetHandler/asset/const';
import { toJS } from 'mobx';

export function calcTextAniDuration(
  asset: AssetClass,
  aeaKwInfo: {
    resId: string;
    pbr: number;
    isText: boolean;
    key: string;
    textDelay?: number;
  },
) {
  const { attribute, assetDuration, animationItemDuration } = asset;
  let inDuration = animationItemDuration.i;
  let outDuration = animationItemDuration.o;
  if (aeaKwInfo) {
    const { key, textDelay } = aeaKwInfo;
    if (textDelay && key === 'i') {
      inDuration = attribute.endTime - 100 - assetDuration.startTime;
    }
    if (key === 'o') {
      outDuration = Math.max(
        assetDuration.endTime - attribute.endTime,
        AEA_TEXT_DURATION,
      );
    }
  } else if (attribute.aeA?.i.kw?.textDelay) {
    inDuration = attribute.endTime - 100 - assetDuration.startTime;
  }
  return {
    inDuration,
    outDuration,
  };
}

export class TextDomHandler {
  renderText: React.ReactElement[] = [];

  textRefs: Refs = {};

  textPosition: TextPositionObject = {};

  textRefKeys: string[] = [];

  textInstance: string[] = [];

  textHtml = '';

  originText: string[] = [];

  textNumber = 0;

  updateText = (text: string[]) => {
    const textInstance: string[] = [];
    const textRefKeys: string[] = [];
    const renderText: React.ReactElement[] = [];
    const setRefs = (key: string, ref: HTMLSpanElement | null) => {
      this.textRefs[key] = ref;
    };
    forEachText(text, {
      parentCb: ({ value }) => {
        textInstance.push(
          value
            .replace(/&/g, '&#38;')
            .replace(/</g, '&#60;')
            .replace(/>/g, '&#62;'),
        );
      },
      itemCb: ({ key, itemValue }) => {
        const str = itemValue.replace(/(\s)/g, `&nbsp;`);
        textRefKeys.push(key);
        renderText.push(
          <span
            className="__renderText"
            ref={ref => {
              setRefs(key, ref);
            }}
            dangerouslySetInnerHTML={{ __html: str }}
            key={key}
          />,
        );
      },
      endCb: ({ index, textArrayLength }) => {
        if (index !== textArrayLength - 1) {
          renderText.push(<br key={`br-${index}`} />);
        }
      },
    });

    this.textHtml = textInstance
      .join('<br/>')
      .replace(/(\s)/g, '&nbsp;')
      .replace(/(&nbsp;&nbsp;)/g, '&nbsp; ');
    this.renderText = renderText;
    this.textInstance = textInstance;
    this.textRefKeys = textRefKeys;
    this.textNumber = getAllTextLength(text);
    this.originText = text;
  };

  updateTextPosition = () => {
    const posObj: TextPositionObject = {};
    this.textRefKeys.forEach(key => {
      const node = this.textRefs[key];
      if (node) {
        posObj[key] = {
          left: node.offsetLeft,
          top: node.offsetTop,
          width: node.offsetWidth,
          height: node.offsetHeight,
        };
      }
    });
    this.textPosition = posObj;
  };
}

export class AnimationHandler {
  writeHandImgRef: React.RefObject<HTMLImageElement>;

  animation?: Animation;

  getAnimationParams: () => AnimationParams;

  animationInEndTime?: { aniInEndTime: number; allAniTime: number };

  constructor(
    writeHandImgRef: React.RefObject<HTMLImageElement>,
    getAnimationParams: () => AnimationParams,
  ) {
    this.writeHandImgRef = writeHandImgRef;
    this.getAnimationParams = getAnimationParams;
  }

  updateAnimationParams = () => {
    this.animationInEndTime = this.calcTextAnimationInEndTime();
  };

  calcTextAnimationInEndTime = () => {
    const {
      speed,
      aHeadAnimationTime,
      startTime,
      endTime,
      textLength,
      assetShowTime,
      enterTypeId,
      textPosition,
      allAnimationTime,
      currentTime,
      exitTypeId,
    } = this.getAnimationParams();

    let aniInEndTime = startTime;
    let allAniTime = 0;
    let textAniShowTime = assetShowTime;

    if (enterTypeId > 0) {
      textAniShowTime -= aHeadAnimationTime;
    }
    if ([5, 9, 7, 8].includes(enterTypeId)) {
      // 除了逐行显示
      const allTime =
        textLength * speed > textAniShowTime
          ? textAniShowTime
          : textLength * speed;

      const aniNeedTime = allTime + startTime - aHeadAnimationTime;

      allAniTime = aniNeedTime; // 总共动画所需时间
      aniInEndTime = aniNeedTime <= endTime ? aniNeedTime : endTime; // 动画结束的时间点
    }
    if (enterTypeId === 6) {
      let allTextRows = 1;
      let maxTop = 0;

      Object.keys(textPosition).forEach(key => {
        const item = textPosition[key];
        if (item.top > maxTop) {
          allTextRows += 1;
          maxTop = item.top;
        }
      });

      const _speed = 333;
      const allAningTime =
        allTextRows * _speed > textAniShowTime
          ? textAniShowTime
          : allTextRows * _speed;

      const aniNeedTime = allAningTime + startTime - aHeadAnimationTime;

      allAniTime = aniNeedTime; // 总共动画所需时间
      aniInEndTime = aniNeedTime <= endTime ? aniNeedTime : endTime; // 动画结束的时间点
    }
    return { aniInEndTime, allAniTime }; // 计算出 动画的结束时间点 以及 动画所需的总共时间
  };

  /**
   * 文字动画控制 --- 只有入场动画存在
   */
  textAnimationCtrl = (
    row: number,
    col: number,
    textStrLength: number,
    currentTxtNum: number,
    animationInEndTime: { aniInEndTime: number; allAniTime: number },
    animationParams: AnimationParams,
  ) => {
    const {
      speed,
      aHeadAnimationTime,
      startTime,
      endTime,
      textLength,
      assetShowTime,
      enterTypeId,
      allAnimationTime,
      currentTime,
      canvas,
      asset,
      textPosition,
      exitTypeId,
    } = animationParams;

    const assetAniEndTime = animationInEndTime.aniInEndTime;
    const assetAnimationTime =
      animationInEndTime.allAniTime - (startTime - aHeadAnimationTime);

    let sumAniStyle = {};
    let aniStyle = {};

    if (currentTime > assetAniEndTime && enterTypeId !== 5) {
      return sumAniStyle;
    }

    if (
      currentTime >=
        startTime -
          (enterTypeId === 5 ? 2 * aHeadAnimationTime : aHeadAnimationTime) &&
      currentTime <
        assetAniEndTime + (enterTypeId === 5 ? aHeadAnimationTime : 0)
    ) {
      // 动画执行前提条件
      const option = {
        asset,
        textStrLength,
        currentTxtNum,
        currentTime,
        startTime,
        endTime,
        allAnimationTime,
        assetAnimationTime,
        aHeadAnimationTime,
        assetAniEndTime,
        animationTextPos: textPosition,
        canvas,
        writeHandImgRef: this.writeHandImgRef.current,
      };
      switch (enterTypeId) {
        case 5:
          // 书写
          aniStyle = textWriteAnimation(row, col, option);
          break;
        case 6:
          // 逐行显示
          aniStyle = textAniShowByLine(row, col, option);
          break;
        case 7:
          // 文字打字
          aniStyle = textTypeAnimation(row, col, option);
          break;
        case 8:
          // 文字翻滚
          aniStyle = textRollAnimation(row, col, option);
          break;
        case 9:
          // 文字弹跳
          aniStyle = textBounceAnimation(row, col, option);
          break;
      }
    }

    sumAniStyle = { ...sumAniStyle, ...aniStyle };

    return sumAniStyle;
  };

  renderTextByPosition = (isPlaying: boolean, isPreviewMovie: boolean) => {
    const animationParams = this.getAnimationParams();
    const animationInEndTime = this.calcTextAnimationInEndTime();
    const { textPosition, text, textLength: textStrLength } = animationParams;
    const res: React.ReactElement[] = [];
    // 当前文字所占第几位置
    let currentTxtNum = 1;

    forEachText(text, {
      itemCb: ({ key, index, itemIndex, itemValue }) => {
        const pos = textPosition[key];

        const aniStyle = this.textAnimationCtrl(
          index + 1,
          itemIndex + 1,
          textStrLength,
          currentTxtNum,
          animationInEndTime,
          animationParams,
        );
        // console.log({
        //   row: index + 1,
        //   col: itemIndex,
        // });
        let style: CSSProperties = {
          position: 'absolute',
        };

        if (pos) {
          style.left = pos.left;
          style.top = pos.top;
        }
        if (isPlaying || isPreviewMovie) {
          style = { ...style, ...aniStyle };
        }
        res.push(
          <span key={key + currentTxtNum} style={style}>
            {itemValue}
          </span>,
        );
        currentTxtNum += 1;
      },
    });

    return res;
  };
}

export class AeaHandler {
  asset: AssetClass;

  handler: AeaAnimation;

  previewStyles?: {
    duration: number;
    kw: AeAKw;
    key: keyof AeA;
    styles: CSSProperties[];
  };

  getAnimationParams: () => AnimationParams;

  constructor(asset: AssetClass, getAnimationParams: () => AnimationParams) {
    this.asset = asset;
    this.getAnimationParams = getAnimationParams;
    const { startTime, endTime } = asset.attribute;
    this.handler = new AeaAnimation(
      {
        scale: 1,
        stay: endTime - startTime,
      },
      {},
    );
  }

  setPreviewHandler = () => {
    const { startTime, endTime, rt_previewAeA } = this.asset.attribute;
    if (rt_previewAeA) {
      const targetKey = aeAKey.find(key => {
        const { pbr, kw } = rt_previewAeA[key];
        return pbr && kw;
      });
      if (!targetKey) {
        return;
      }
      const tarAni = { ...rt_previewAeA[targetKey] };
      const ani = new AeaAnimation(
        {
          scale: 1,
          stay: endTime - startTime,
        },
        // @ts-ignore
        { [targetKey]: tarAni },
      );
      aeAKey.forEach(key => {
        const style = ani.styles[key];
        const { pbr, kw } = rt_previewAeA[key];
        if (style.length > 0 && kw) {
          this.previewStyles = {
            key,
            styles: style,
            kw,
            duration: 1000 / pbr,
          };
        }
      });
    } else {
      this.previewStyles = undefined;
    }
  };

  /**
   * @description 计算当前时间节点的帧画面
   * @param time
   */
  getCurrentFrame = (time: number) => {
    return Math.round((time / 1000) * 60);
  };

  getAnimation = (
    currentTime: number,
    textIndex: number,
    textLength: number,
    aeaPreview: boolean,
  ): CSSProperties => {
    if (aeaPreview && !this.previewStyles) {
      return {};
    }
    // 1.根据currentTime和出入场时间，计算出当前帧是那个动画
    // 2.获取动画对象pbr,根据文字长度，计算出来每个动画的播放间隔
    // 3.根据文字的索引，获取对应的动画帧
    const {
      assetDuration,
      attribute,
      animationItemDuration,
      animationItemPbr,
    } = this.asset;

    if (
      aeaPreview
        ? this.previewStyles!.key === 'i'
        : currentTime >= assetDuration.startTime &&
          currentTime < attribute.endTime - 100
    ) {
      const aeaKw = aeaPreview ? this.previewStyles!.kw : attribute.aeA?.i.kw;
      // 整个入场的持续时间最长为
      let inDuration = animationItemDuration.i / 2;

      let current = aeaPreview
        ? currentTime
        : currentTime - assetDuration.startTime;
      const styleArray = aeaPreview
        ? this.previewStyles!.styles
        : this.handler.styles.i;

      let delay = 0;
      let leftDelayTime = 0;

      if (aeaKw?.textDelay) {
        inDuration = attribute.endTime - 100 - assetDuration.startTime;
        delay = aeaKw.textDelay / animationItemPbr.i;
        leftDelayTime = inDuration - animationItemDuration.i / 2;
      } else {
        delay = inDuration / textLength;
        leftDelayTime = animationItemDuration.i / 2;
      }

      if (delay * textLength > leftDelayTime) {
        delay = Math.floor(leftDelayTime / textLength);
      }

      current -= textIndex * delay;
      // console.log({
      //   textIndex,
      //   textLength,
      //   delay,
      //   leftDelayTime,
      //   current,
      //   pbr: animationItemPbr.i,
      // });
      let style: CSSProperties = {};
      if (current > inDuration) {
        return style;
      }
      if (current > 0) {
        const frame = Math.min(
          this.getCurrentFrame(current),
          styleArray.length,
        );
        style = styleArray[frame] || {};
      } else {
        style = styleArray[0] || {};
      }

      if (aeaKw?.ofh) {
        style.overflow = 'hidden';
      }
      return style;
    }

    if (
      aeaPreview
        ? this.previewStyles!.key === 'o'
        : currentTime >= attribute.endTime &&
          currentTime <= assetDuration.endTime
    ) {
      let current = aeaPreview ? currentTime : currentTime - attribute.endTime;

      const styleArray = aeaPreview
        ? this.previewStyles!.styles
        : this.handler.styles.o;

      const duration = styleArray.length * 15;
      const leftDelayTime = animationItemDuration.o - duration;
      const aeaKw = aeaPreview ? this.previewStyles!.kw : attribute.aeA?.o.kw;
      const delay = (textIndex * leftDelayTime) / textLength;

      current -= delay;
      if (current > duration) {
        return { opacity: 0 };
      }

      let style: CSSProperties = {};
      if (current > 0) {
        const frame = Math.min(
          this.getCurrentFrame(current),
          styleArray.length,
        );
        style = styleArray[frame] || {};
      } else {
        style = {};
      }
      if (aeaKw?.ofh) {
        style.overflow = 'hidden';
      }
      return style;
    }
    return {};
  };

  renderTextByPosition = (isPlaying: boolean, isPreviewMovie: boolean) => {
    const {
      text,
      textLength,
      currentTime,
      textRefs,
      showOnly,
      aeaPreview,
      asset,
    } = this.getAnimationParams();
    if (showOnly) {
      return null;
    }
    const res: React.ReactElement[] = [];
    // 当前文字所占第几位置
    let currentTxtNum = 0;
    forEachText(text, {
      itemCb: ({ key, index, itemIndex, itemValue }) => {
        const style: CSSProperties = {
          display: 'inline-block',
          ...this.getAnimation(
            currentTime,
            currentTxtNum,
            textLength,
            aeaPreview && !!asset.attribute.rt_previewAeA,
          ),
        };
        const node = textRefs[key];
        const pos: CSSProperties = node
          ? {
              position: 'absolute',
              left: node.offsetLeft,
              top: node.offsetTop,
              width: node.offsetWidth,
              height: node.offsetHeight,
            }
          : {};
        delete style.overflow;
        if (style.overflow) {
          res.push(
            <div
              key={key + currentTxtNum}
              style={{
                overflow: 'hidden',
                ...pos,
              }}
            >
              <span style={style}>{itemValue}</span>
            </div>,
          );
        } else {
          res.push(
            <span key={key + currentTxtNum} style={{ ...style, ...pos }}>
              {itemValue}
            </span>,
          );
        }

        currentTxtNum += 1;
      },
      endCb: ({ index, textArrayLength }) => {
        if (index !== textArrayLength - 1) {
          res.push(<br key={`br-${index}`} />);
        }
      },
    });

    return res;
  };
}
