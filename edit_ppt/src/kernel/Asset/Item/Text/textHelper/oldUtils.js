import { createTextId } from '../components/originText/utils.tsx';

/**
 * 书写动画
 * @param {*} row 第几行
 * @param {*} col 第几列
 * @param {*} option 附加参数
 */
export function textWriteAnimation(row, col, option) {
  const {
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
    aeA,
    animationTextPos,
    canvas,
    writeHandImgRef,
  } = option;

  let aniStyle = {};

  const animationEdTime = currentTime - (startTime - aHeadAnimationTime);
  const aniRatio = animationEdTime / assetAnimationTime;
  const curAniTextPos = aniRatio * textStrLength;
  const intPos = parseInt(curAniTextPos, 10);
  const floatPos = curAniTextPos - intPos;
  const assetTransform = asset.transform;
  const assetAttribute = asset.attribute;
  const imgoffsetValue = 10;
  const imgTempWidth = 540;
  const imgTempHeight = 1080; // 手写图片的像素
  const { fontSizeScale } = asset;
  // 写字动画只受 aea.i.pbr 影响;
  const time = aHeadAnimationTime;
  const writeHandImg = writeHandImgRef;
  const canvasScale = 1;
  const reaScale = canvas.scale;
  if (!writeHandImg) {
    return aniStyle;
  }
  // 书写图片 入场
  if (currentTime < startTime - aHeadAnimationTime) {
    const aniEdTime = time - (startTime - time - currentTime);
    const _ratio = aniEdTime / time;

    if (writeHandImg) {
      const pos = animationTextPos[createTextId(0, 0)] || {};
      const bottomDistance = canvas.height / canvasScale - assetTransform.posY;
      const left = pos.left * fontSizeScale;
      const height = pos.height * fontSizeScale;

      writeHandImg.style.left = `${
        (left + assetTransform.posX) * canvasScale -
        imgoffsetValue -
        ((writeHandImg.offsetWidth || imgTempWidth) * (1 - canvasScale)) / 2
      }px`;
      writeHandImg.style.top = `${
        (bottomDistance * (1 - _ratio) + height / 2 + assetTransform.posY) *
          canvasScale -
        imgoffsetValue -
        5 -
        ((writeHandImg.offsetHeight || imgTempHeight) * (1 - canvasScale)) / 2
      }px`;
      writeHandImg.style.transform = `scale(${canvasScale})`;
    }
    return aniStyle;
  }
  // 书写图片 出场
  if (
    currentTime >= assetAniEndTime &&
    currentTime < assetAniEndTime + aHeadAnimationTime
  ) {
    const aniEdTime = currentTime - assetAniEndTime;
    const _ratio = aniEdTime / time;
    if (writeHandImg) {
      const bottomDistance = canvas.height / canvasScale - assetTransform.posY;
      const nowTop = parseInt(writeHandImg.style.top, 10);
      const assetTexts = asset.attribute.text;
      const key = createTextId(
        assetTexts.length - 1,
        assetTexts[assetTexts.length - 1].length - 1,
      );
      const pos = animationTextPos[key] || {}; // 定位到最后一个文字的坐标
      const left = pos.left * fontSizeScale;
      const height = pos.height * fontSizeScale;
      const width = pos.width * fontSizeScale;
      const top = pos.top * fontSizeScale;

      writeHandImg.style.left = `${
        (left + width + assetTransform.posX) * canvasScale -
        imgoffsetValue -
        ((writeHandImg.offsetWidth || imgTempWidth) * (1 - canvasScale)) / 2
      }px`;
      writeHandImg.style.top = `${
        (top + height / 2 + assetTransform.posY) * canvasScale -
        imgoffsetValue -
        5 -
        ((writeHandImg.offsetHeight || imgTempHeight) * (1 - canvasScale)) / 2
      }px`;
      writeHandImg.style.transform = `translateY(${
        bottomDistance * _ratio
      }px) scale(${canvasScale})`;
    }
    return aniStyle;
  }

  // 已经动画结束的文字
  if (currentTxtNum <= intPos) {
    aniStyle = { opacity: 1 };
  } else if (currentTxtNum > intPos + 1) {
    // 未开始动画的文字
    aniStyle = { opacity: 0 };
  } else {
    // 正在动画的文字
    aniStyle = { opacity: floatPos };
    if (writeHandImgRef) {
      const key = createTextId(row - 1, col - 1);
      const pos = animationTextPos[key] || {};
      const left = pos.left * fontSizeScale;
      const height = pos.height * fontSizeScale;
      const width = pos.width * fontSizeScale;
      const top = pos.top * fontSizeScale;
      let rotateDeg = 1; // 旋转度数

      if (floatPos >= 0 && floatPos < 0.25) {
        rotateDeg = -rotateDeg * (floatPos / 0.25);
      } else if (floatPos >= 0.25 && floatPos < 0.5) {
        rotateDeg = rotateDeg * ((floatPos - 0.25) / 0.25) - rotateDeg;
      } else if (floatPos >= 0.5 && floatPos < 0.75) {
        rotateDeg *= (floatPos - 0.5) / 0.25;
      } else {
        rotateDeg -= rotateDeg * ((floatPos - 0.75) / 0.25);
      }

      writeHandImgRef.style.left = `${
        (assetTransform.posX + left + floatPos * width) * canvasScale -
        imgoffsetValue -
        ((writeHandImgRef.offsetWidth || imgTempWidth) * (1 - canvasScale)) / 2
      }px`;
      writeHandImgRef.style.top = `${
        (assetTransform.posY + top + height / 2) * canvasScale -
        imgoffsetValue -
        5 -
        ((writeHandImgRef.offsetHeight || imgTempHeight) * (1 - canvasScale)) /
          2
      }px`;
      writeHandImgRef.style.transform = `rotate(${rotateDeg}deg) scale(${canvasScale})`;
    }
  }
  return aniStyle;
}

/**
 * 逐行显示
 * @param {*} row 第几行
 * @param {*} col 第几列
 * @param {*} option 附加参数
 */
export function textAniShowByLine(row, col, option) {
  const {
    animationTextPos,
    currentTime,
    startTime,
    assetAnimationTime,
    aHeadAnimationTime,
  } = option;
  let aniStyle = {};

  let textRows = 1;
  let maxTop = 0;

  const textRowObj = {};
  Object.keys(animationTextPos).forEach((key) => {
    const item = animationTextPos[key];
    if (item.top > maxTop) {
      // eslint-disable-next-line no-plusplus
      textRows++;
      maxTop = item.top;
    }
    textRowObj[item.top] = textRows; // 每个高度分布在第几行
  });

  const animationEdTime = currentTime - (startTime - aHeadAnimationTime);
  const aniRatio = animationEdTime / assetAnimationTime;
  const allRows = textRows;
  const curAniTextPos = aniRatio * allRows;
  const intPos = parseInt(curAniTextPos, 10);
  const floatPos = curAniTextPos - intPos;

  const prevKey = createTextId(row - 1, col - 1);
  if (
    animationTextPos?.[prevKey] &&
    textRowObj?.[animationTextPos[prevKey].top]
  ) {
    // todo 如果逐行显示动画出现问题，需要排查文字缩放逻辑
    row = textRowObj?.[animationTextPos?.[prevKey]?.top];
  }

  // console.log(animationTextPos,'animationTextPos',textRows,textRowObj,row);
  if (row <= intPos) {
    // 已经动画结束的文字
    aniStyle = { opacity: 1 };
  } else if (row > intPos + 1) {
    // 未开始动画的文字
    aniStyle = { opacity: 0 };
  } else {
    // 正在动画的文字
    aniStyle = { opacity: floatPos };
  }

  return aniStyle;
}

/**
 * 文字打字动画
 * @param {*} row 第几行
 * @param {*} col 第几列
 * @param {*} option 附加参数
 */
export function textTypeAnimation(row, col, option) {
  const {
    textStrLength,
    currentTxtNum,
    currentTime,
    startTime,
    assetAnimationTime,
    aHeadAnimationTime,
  } = option;
  let aniStyle = {};

  const animationEdTime = currentTime - (startTime - aHeadAnimationTime);
  const aniRatio = animationEdTime / assetAnimationTime;
  const curAniTextPos = aniRatio * textStrLength;
  const intPos = parseInt(curAniTextPos, 10);
  const floatPos = curAniTextPos - intPos;

  if (currentTxtNum <= intPos) {
    // 已经动画结束的文字
    aniStyle = { opacity: 1 };
  } else if (currentTxtNum > intPos + 1) {
    // 未开始动画的文字
    aniStyle = { opacity: 0 };
  } else {
    // 正在动画的文字
    aniStyle = { opacity: floatPos };
  }

  return aniStyle;
}

/**
 * 翻滚动画
 * @param {*} row 第几行
 * @param {*} col 第几列
 * @param {*} option 附加参数
 */
export function textRollAnimation(row, col, option) {
  const {
    textStrLength,
    currentTxtNum,
    currentTime,
    startTime,
    assetAnimationTime,
    aHeadAnimationTime,
  } = option;
  let aniStyle = {};

  const animationEdTime = currentTime - (startTime - aHeadAnimationTime);
  const aniRatio = animationEdTime / assetAnimationTime;
  const curAniTextPos = aniRatio * textStrLength;
  const intPos = parseInt(curAniTextPos, 10);
  const floatPos = curAniTextPos - intPos;
  const initalX = 200; // 初始文字靠右距离
  const extraRotateDeg = 20; // 文字旋转 回转角度

  /*
      初始位置 - 右侧200px   0deg
      变化 200px -> 0px
      0deg 逆时针旋转 360deg  -> 再多旋转20deg  -> 顺时针 20deg 到 0deg
  */
  if (currentTxtNum <= intPos) {
    // 已经动画结束的文字
    aniStyle = {
      opacity: 1,
    };
  } else if (currentTxtNum > intPos + 1) {
    // 未开始动画的文字
    aniStyle = {
      opacity: 0,
      transform: `translateX(${initalX}px)`,
    };
  } else {
    // 正在动画的文字
    let nowDeg = Math.round(floatPos * (360 + extraRotateDeg * 2));
    if (nowDeg >= 0 && nowDeg <= 360 + extraRotateDeg) {
      nowDeg %= 360;
      nowDeg = 360 - nowDeg;
    } else if (
      nowDeg > 360 + extraRotateDeg &&
      nowDeg <= 360 + extraRotateDeg * 2
    ) {
      const moreDeg = nowDeg - (360 + extraRotateDeg);
      nowDeg = 360 - extraRotateDeg + moreDeg;
    }
    aniStyle = {
      opacity: floatPos,
      transform: `translateX(${
        initalX * (1 - floatPos)
      }px) rotate(${nowDeg}deg)`,
    };
  }

  return aniStyle;
}

/**
 * 弹跳动画
 * @param {*} row 第几行
 * @param {*} col 第几列
 * @param {*} option 附加参数
 */
export function textBounceAnimation(row, col, option) {
  const {
    textStrLength,
    currentTxtNum,
    currentTime,
    startTime,
    assetAnimationTime,
    aHeadAnimationTime,
  } = option;

  let aniStyle = {};

  const animationEdTime = currentTime - (startTime - aHeadAnimationTime);
  const aniRatio = animationEdTime / assetAnimationTime;
  const curAniTextPos = aniRatio * textStrLength;
  const intPos = parseInt(curAniTextPos, 10);
  const floatPos = curAniTextPos - intPos;
  const initalY = 80; // 初始文字靠
  const extraDistance = 20; // 文字弹跳 缓冲距离

  if (currentTxtNum <= intPos) {
    // 已经动画结束的文字
    aniStyle = {
      opacity: 1,
    };
  } else if (currentTxtNum > intPos + 1) {
    // 未开始动画的文字
    aniStyle = {
      opacity: 0,
      transform: `translateY(${initalY}px)`,
    };
  } else {
    // 正在动画的文字
    let nowDistance = floatPos * (initalY + extraDistance * 2);

    if (nowDistance >= initalY && nowDistance < initalY + extraDistance) {
      // nowDistance = -(nowDistance - initalY)
    } else if (
      nowDistance >= initalY + extraDistance &&
      nowDistance <= initalY + extraDistance * 2
    ) {
      // nowDistance = -(nowDistance - initalY - extraDistance)
      nowDistance -= extraDistance;
    }

    aniStyle = {
      opacity: floatPos,
      transform: `translateY(${initalY - nowDistance}px)`,
    };
  }
  // if (asset.attribute?.text?.[0] === "•••••••••••") {
  //   console.log("textBounceAnimation", row, col, aniStyle);
  // }
  return aniStyle;
}
