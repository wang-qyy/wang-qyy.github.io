import React, { useEffect } from 'react';
import { useSetState } from 'ahooks';
import { observer } from 'mobx-react';

function RubIn({ children, asset, animatedTime, style, aniDurationTime }) {
  const [state, setState] = useSetState({
    runInDirection: 2, // “擦入”方向（1：上，2：右，3：下，4：左）,
    rubInStyle: {},
  });
  const { rubInStyle } = state;

  function startRubIn() {
    const domWidth = style.width;
    const domHeight = style.height;
    let ratio = animatedTime / aniDurationTime;
    if (animatedTime === 0) {
      ratio = 0;
    }
    const runInDirection = asset.attribute?.animation?.enter?.details.direction;
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

    setState({
      rubInStyle: {
        WebkitMaskPosition: `${_x}px ${_y}px`,
        WebkitMaskSize: `${_size}`,
        WebkitMaskImage: `-webkit-gradient(${_gradient})`,
      },
    });
  }

  useEffect(() => {
    if (style && style.width && style.height) {
      startRubIn();
    }
  }, [
    animatedTime,
    asset.attribute.width,
    asset.attribute.height,
    asset.attribute?.container?.width,
    asset.attribute?.container?.height,
  ]);

  return (
    <div className="movie-animation-rubIn" style={rubInStyle}>
      {children}
    </div>
  );
}

export default observer(RubIn);
