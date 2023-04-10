import { useState, useRef, CSSProperties } from 'react';
import { useThrottleFn, useUpdateEffect } from 'ahooks';
import classNames from 'classnames';
import useCanvasGradient from '../../canvasGradient';
import { stopPropagation } from '@/utils';

interface GradientPickerProps {
  activeIndex: number; // 当前选中的索引
  background: CSSProperties['background'];
  list: any[];
  changeList: (list: any[]) => void;
  setActiveIndex: (index: number) => void;
  deleteCurrent: () => void;
  colorType: 'radial' | 'linear';
}

const GradientPicker = (props: GradientPickerProps) => {
  const {
    activeIndex,
    list,
    background,
    changeList,
    setActiveIndex,
    deleteCurrent,
    colorType,
  } = props;
  const { paintGradient, getCanvasGradientColor } =
    useCanvasGradient('gradientCanvas');

  const MatrixBox = useRef(null);
  // 这里写上每一个的属性
  const icmItem = useRef({ width: 20 });
  const [icmList, setIcmList] = useState(list);
  const slidIndex = useRef(null);
  const currentPercent = useRef(null);

  const { run: runChangeList } = useThrottleFn((value) => changeList(value), {
    wait: 60,
  });

  /**
   * 获取基本信息
   * @returns
   */
  const getReference = () => {
    const { clientWidth, clientHeight } = MatrixBox.current;
    const { left, top } = MatrixBox.current.getBoundingClientRect();
    return {
      min: icmItem.current.width,
      max: icmItem.current.width,
      minX: left,
      maxX: left + clientWidth,
      minY: top,
      maxY: top + clientHeight,
      clientWidth,
      clientHeight,
    };
  };

  /**
   * 计算
   * @param {*} clientX
   * @param {*} clientY
   */
  const { run: calculate } = useThrottleFn(
    (event) => {
      event.stopPropagation();
      event.preventDefault();
      const { offsetX: clientX, offsetY: clientY, target } = event;
      // 鼠标不停留在面板
      if (target.className !== MatrixBox.current.className) {
        return;
      }

      const { clientWidth } = getReference();
      const item = {
        ...icmList[slidIndex.current],
        left: clientX,
        right: clientX + icmItem.current.width,
        top: clientY,
      };

      item.percent = Math.floor((item.left / clientWidth) * 100);
      if (clientWidth - icmItem.current.width < item.left) {
        item.left = clientWidth - icmItem.current.width;
        item.right = clientWidth;
      }
      const exist =
        icmList.filter((pct) => pct.percent === item.percent).length > 0;
      // 当前比例存在
      if (exist) return;
      const icmListTemp = [...icmList];
      if (slidIndex.current) {
        icmListTemp.splice(slidIndex.current * 1, 1, item);
      } else {
        item.color = getCanvasGradientColor(item.left, item.top);
        icmListTemp.push(item);
      }

      currentPercent.current = item.percent;
      setIcmList(icmListTemp);
    },
    { wait: 60 },
  );

  /**
   * 获取下标
   * @param event
   * @returns
   */
  const getIcmIndex = (event) => {
    const { clientX } = event;
    const { minX } = getReference();
    let index = -1;
    for (let i = 0; i < icmList.length; i++) {
      if (
        minX + icmList[i].left <= clientX &&
        minX + icmList[i].right >= clientX
      ) {
        index = i;
        currentPercent.current = icmList[i].percent;
        setActiveIndex(i);
        break;
      }
    }
    return index;
  };

  /**
   * 选中某个点
   */
  const { run: checkedFn } = useThrottleFn(
    (event) => {
      event.stopPropagation();
      window.removeEventListener('mouseup', checkedFn);
      calculate(event);
    },
    { wait: 60 },
  );

  /**
   * 松开鼠标
   */
  const { run: mouseUp } = useThrottleFn(
    (event) => {
      if (!slidIndex.current) {
        checkedFn(event);
      }
      event.stopPropagation();
      window.removeEventListener('mousemove', calculate);
      window.removeEventListener('mouseup', mouseUp);
      // 重置
      slidIndex.current = null;
    },
    { wait: 60 },
  );

  /**
   * 按下鼠标
   */
  const { run: mouseDown } = useThrottleFn(
    (event) => {
      stopPropagation(event);
      // 获取滑块下标
      const index = getIcmIndex(event);
      if (index >= 0) {
        slidIndex.current = `${index}`;
        // 移除点击事件
        window.addEventListener('mousemove', calculate);
        window.addEventListener('mouseup', mouseUp);
      } else {
        window.addEventListener('mouseup', mouseUp);
      }
    },
    { wait: 160 },
  );
  /**
   * 向外传递值
   */
  useUpdateEffect(() => {
    runChangeList(icmList);
    // 添加渐变画布
    paintGradient(icmList);
  }, [icmList, colorType]);

  /**
   * 接收props
   */
  useUpdateEffect(() => {
    setIcmList(list);
    if (currentPercent.current >= 0) {
      for (let i = 0; i < list.length; i++) {
        if (list[i].percent === currentPercent.current) {
          setActiveIndex(i);
          break;
        }
      }
    }
  }, [list]);

  return (
    <div className="gradient-picker-container">
      <div className="gradient-picker-container-done-view">
        <div
          className="gradient-picker-container-done"
          style={{ background }}
        />
        <canvas
          id="gradientCanvas"
          className="gradient-picker-container-canvas"
        />
        <div
          className="gradient-picker-container-focus"
          ref={MatrixBox}
          tabIndex={activeIndex}
          onKeyDown={(e) => {
            stopPropagation(e);
            deleteCurrent();
          }}
          onMouseDown={mouseDown}
        />
        {(icmList || []).map((item, index) => {
          return (
            <div
              key={item.percent}
              style={{
                left: item.left,
                zIndex: slidIndex.current === index ? 4 : 3,
              }}
              className={classNames('bar-position', {
                'bar-active': activeIndex === index,
              })}
              onClick={stopPropagation}
              onMouseDown={stopPropagation}
            >
              <div className="gradient-picker-container-bar" />
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default GradientPicker;
