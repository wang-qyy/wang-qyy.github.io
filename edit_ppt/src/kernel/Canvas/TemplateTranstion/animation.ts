import { AssetClass } from '@kernel/typing';

export interface AnimationType {
  asset: AssetClass;
  canvasInfo: {
    width: number;
    height: number;
    scale: number;
  };
  animation: {
    id: number;
    currentTime: number;
    duration: number;
    direction?: number;
  };
  style: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
}

function getRatio(animation: AnimationType['animation']) {
  const { currentTime, duration } = animation;
  let ratio = currentTime / duration;
  if (currentTime === 0) {
    ratio = 0;
  }
  return ratio;
}

export function fadeIn({ animation }: AnimationType) {
  animation.duration *= 2;
  return {
    opacity: getRatio(animation),
  };
}

export function fadeOut({ animation }: AnimationType) {
  const ratio = getRatio(animation);
  return {
    opacity: 1 - ratio,
  };
}

export function moveInto({
  canvasInfo,
  animation,
  style,
  asset,
}: AnimationType) {
  const { scale } = canvasInfo;
  const posX = asset.transform.posX * scale;
  const posY = asset.transform.posY * scale;
  const width = asset.attribute.width * scale;
  const height = asset.attribute.height * scale;
  const canvasWidth = canvasInfo.width;
  const canvasHeight = canvasInfo.height;
  const ratio = getRatio(animation);
  // 进入方向（1：上，2：右，3：下，4：左）
  let _poxX = 0;
  let _poxY = 0;
  const _X = posX + width;
  const _Y = posY + height;
  switch (animation.direction ?? 1) {
    case 1:
      _poxY = _Y * ratio - _Y;
      break;
    case 2:
      _poxX = canvasWidth - posX - (canvasWidth - posX) * ratio;
      break;
    case 3:
      _poxY = canvasHeight - posY - (canvasHeight - posY) * ratio;
      break;
    default:
      _poxX = _X * ratio - _X;
  }
  return {
    left: _poxX + style.left,
    top: _poxY + style.top,
  };
}

export function moveOut({
  canvasInfo,
  animation,
  style,
  asset,
}: AnimationType) {
  const { posX, posY } = asset.transform;
  const { width, height } = asset.attribute;
  const canvasWidth = canvasInfo.width;
  const canvasHeight = canvasInfo.height;
  animation.duration *= 2;
  const ratio = getRatio(animation);
  // 进入方向（1：上，2：右，3：下，4：左）
  let _poxX = 0;
  let _poxY = 0;
  const _X = posX + width;
  const _Y = posY + height;
  switch (animation.direction ?? 1) {
    case 1:
      _poxY = -_Y * ratio;
      break;
    case 2:
      _poxX = (canvasWidth - posX) * ratio;
      break;
    case 3:
      _poxY = (canvasHeight - posY) * ratio;
      break;
    default:
      _poxX = -_X * ratio;
  }
  return {
    left: _poxX + style.left,
    top: _poxY + style.top,
  };
}

export function rubIn({ animation, style }: AnimationType) {
  const domWidth = style.width;
  const domHeight = style.height;
  const ratio = getRatio(animation);

  const runInDirection = animation.direction ?? 1;
  /*
      0 - 1 - 1.1 - 1
  */
  let _x = 0;
  let _y = 0;
  let _gradient = '';
  let _size = '';
  let shandowRatio = 0.1; // shandowRatio - 预留的擦出阴影空间
  if (runInDirection == 2) {
    // 右擦入
    const maskW = domWidth * (2 + shandowRatio);
    _x = (maskW / 2) * ratio - maskW / 2;
    _size = `${maskW}px ${domHeight}px`;
    shandowRatio = (domWidth * shandowRatio) / maskW;
    _gradient = `linear,
            0% 100%, 100% 100%,
            from(rgb(0, 0, 0)),
            color-stop(${0.5 - shandowRatio / 2}, rgb(0, 0, 0)),
            color-stop(${0.5}, rgba(0, 0, 0, 0)),
            color-stop(${0.5 + shandowRatio / 2}, rgba(0, 0, 0, 0)),
            to(rgba(0, 0, 0, 0))`;
  } else if (runInDirection == 4) {
    // 左擦入
    const maskW = domWidth * (2 + shandowRatio);
    _x = (-maskW / 2) * ratio;
    _size = `${maskW}px ${domHeight}px`;
    shandowRatio = (domWidth * shandowRatio) / maskW;
    _gradient = `linear,
            0% 100%, 100% 100%,
            from(rgb(0, 0, 0 , 0)),
            color-stop(${0.5 - shandowRatio / 2}, rgb(0, 0, 0, 0)),
            color-stop(${0.5}, rgba(0, 0, 0)),
            color-stop(${0.5 + shandowRatio / 2}, rgba(0, 0, 0)),
            to(rgba(0, 0, 0))`;
  } else if (runInDirection == 1) {
    // 上擦入
    const maskH = domHeight * (2 + shandowRatio);
    _y = (maskH / 2) * ratio - maskH / 2;
    _size = `${domWidth}px ${maskH}px`;
    shandowRatio = (domHeight * shandowRatio) / maskH;
    _gradient = `linear,
            left top, left bottom,
            from(rgb(0, 0, 0 )),
            color-stop(${0.5 - shandowRatio / 2}, rgb(0, 0, 0)),
            color-stop(${0.5}, rgba(0, 0, 0 ,0)),
            color-stop(${0.5 + shandowRatio / 2}, rgba(0, 0, 0 ,0)),
            to(rgba(0, 0, 0 , 0))`;
  } else {
    // 下擦入
    const maskH = domHeight * (2 + shandowRatio);
    _y = (-maskH / 2) * ratio;
    _size = `${domWidth}px ${maskH}px`;
    shandowRatio = (domHeight * shandowRatio) / maskH;
    _gradient = `linear,
            left top, left bottom,
            from(rgb(0, 0, 0 , 0)),
            color-stop(${0.5 - shandowRatio / 2}, rgb(0, 0, 0, 0)),
            color-stop(${0.5}, rgba(0, 0, 0)),
            color-stop(${0.5 + shandowRatio / 2}, rgba(0, 0, 0)),
            to(rgba(0, 0, 0))`;
  }

  return {
    WebkitMaskPosition: `${_x}px ${_y}px`,
    WebkitMaskSize: `${_size}`,
    WebkitMaskImage: `-webkit-gradient(${_gradient})`,
  };
}

export function rubOut({ animation, style }: AnimationType) {
  const domWidth = style.width;
  const domHeight = style.height;
  const ratio = getRatio(animation);

  const runInDirection = animation.direction ?? 1;
  /*
            0 - 1 - 1.1 - 1
        */
  let _x = 0;
  let _y = 0;
  let _gradient = '';
  let _size = '';
  let shandowRatio = 0.1; // shandowRatio - 预留的擦出阴影空间
  if (runInDirection == 2) {
    // 右擦出
    const maskW = domWidth * (2 + shandowRatio);
    _x = (-maskW / 2) * ratio;
    _size = `${maskW}px ${domHeight}px`;
    shandowRatio = (domWidth * shandowRatio) / maskW;
    _gradient = `linear,
            0% 100%, 100% 100%,
            from(rgb(0, 0, 0)),
            color-stop(${0.5 - shandowRatio / 2}, rgb(0, 0, 0)),
            color-stop(${0.5}, rgba(0, 0, 0, 0)),
            color-stop(${0.5 + shandowRatio / 2}, rgba(0, 0, 0, 0)),
            to(rgba(0, 0, 0, 0))`;
  } else if (runInDirection == 4) {
    // 左擦出
    const maskW = domWidth * (2 + shandowRatio);
    _x = (maskW / 2) * ratio - maskW / 2;
    _size = `${maskW}px ${domHeight}px`;
    shandowRatio = (domWidth * shandowRatio) / maskW;
    _gradient = `linear,
            0% 100%, 100% 100%,
            from(rgb(0, 0, 0 , 0)),
            color-stop(${0.5 - shandowRatio / 2}, rgb(0, 0, 0, 0)),
            color-stop(${0.5}, rgba(0, 0, 0)),
            color-stop(${0.5 + shandowRatio / 2}, rgba(0, 0, 0)),
            to(rgba(0, 0, 0))`;
  } else if (runInDirection == 1) {
    // 上擦出
    const maskH = domHeight * (2 + shandowRatio);
    _y = (-maskH / 2) * ratio;
    _size = `${domWidth}px ${maskH}px`;
    shandowRatio = (domHeight * shandowRatio) / maskH;
    _gradient = `linear,
            left top, left bottom,
            from(rgb(0, 0, 0 )),
            color-stop(${0.5 - shandowRatio / 2}, rgb(0, 0, 0)),
            color-stop(${0.5}, rgba(0, 0, 0 ,0)),
            color-stop(${0.5 + shandowRatio / 2}, rgba(0, 0, 0 ,0)),
            to(rgba(0, 0, 0 , 0))`;
  } else {
    // 下擦出
    const maskH = domHeight * (2 + shandowRatio);
    _y = (maskH / 2) * ratio - maskH / 2;
    _size = `${domWidth}px ${maskH}px`;
    shandowRatio = (domHeight * shandowRatio) / maskH;
    _gradient = `linear,
            left top, left bottom,
            from(rgb(0, 0, 0 , 0)),
            color-stop(${0.5 - shandowRatio / 2}, rgb(0, 0, 0, 0)),
            color-stop(${0.5}, rgba(0, 0, 0)),
            color-stop(${0.5 + shandowRatio / 2}, rgba(0, 0, 0)),
            to(rgba(0, 0, 0))`;
  }
  return {
    WebkitMaskPosition: `${_x}px ${_y}px`,
    WebkitMaskSize: `${_size}`,
    WebkitMaskImage: `-webkit-gradient(${_gradient})`,
  };
}

export function scaleEnlarge({ animation }: AnimationType) {
  animation.duration *= 2;
  const ratio = getRatio(animation);
  const maxScale = 1;
  const allRatio = maxScale + maxScale - 1;
  let currentScale = allRatio * ratio; // 0 - allRatio   here is 0 - 1.2
  if (currentScale > maxScale) {
    currentScale = maxScale - (currentScale - maxScale);
  }
  return {
    transform: `perspective(${currentScale}px) scale3d(${currentScale},${currentScale},${currentScale})`,
    // opacity: ratio,
  };
}

export function scaleReduce({ animation }: AnimationType) {
  animation.duration *= 2;
  const ratio = getRatio(animation);
  const minScale = 0;
  let scale = 1 - ratio;
  let opacity = 1;
  if (scale < minScale) {
    scale = minScale;
    opacity = (1 - ratio) / minScale;
  }
  return {
    transform: `perspective(${scale}px) scale3d(${scale},${scale},${scale})`,
    opacity,
  };
}

const outList = {
  1: moveOut,
  2: scaleReduce,
  3: fadeOut,
  4: rubOut,
};
const inList = {
  1: moveInto,
  2: scaleEnlarge,
  3: fadeIn,
  4: rubIn,
};

export function animationManager(
  isIn: boolean,
  type: number,
  data: AnimationType,
) {
  // @ts-ignore
  const action = isIn ? inList[type] : outList[type];
  if (!action) {
    return {};
  }
  // @ts-ignore
  return action(data);
}
