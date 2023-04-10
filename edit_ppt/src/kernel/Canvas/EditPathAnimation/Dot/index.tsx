import { useThrottleFn } from 'ahooks';

const Dot = (props) => {
  const { change, onUp, limitInfo, ...rest } = props || {};
  const { dot, kuang } = limitInfo;
  // L 表示直径
  const L = dot?.width;
  /**
   * 按住鼠标左键移动事件，添加节流
   */
  const { run: holdMouseMove } = useThrottleFn(
    (event) => {
      event.stopPropagation();
      const { clientX, clientY } = event;
      let { left, top, width, height } = kuang;
      const minLeft = 0;
      const minTop = 0;
      const maxLeft = width - L;
      const maxTop = height - L;
      left = clientX - left;
      top = clientY - top;
      // 限定在div内拖动
      if (left < minLeft) left = minLeft;
      if (left > maxLeft) left = maxLeft;
      if (top < minTop) top = minTop;
      if (top > maxTop) top = maxTop;
      change && change({ left, top });
    },
    { wait: 100 },
  );

  /**
   * 按下鼠标左键
   * @param {*} event
   */
  const mousedown = (event) => {
    event.stopPropagation();
    document.onmousemove = holdMouseMove;
    document.onmouseup = function (event2) {
      document.onmouseup = null;
      document.onmousemove = null;
      onUp && onUp();
    };
  };
  return <div {...rest} onMouseDown={mousedown} />;
};
export default Dot;
