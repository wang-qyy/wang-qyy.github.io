import { MutableRefObject, useCallback, useLayoutEffect, useRef } from 'react';

interface Options {
  ele: MutableRefObject<Element>;
  scrollEle: MutableRefObject<Element>;
  onFirstShow?: (ele: Element) => void;
  onShow?: (ele: Element) => void;
  onHidden?: (ele: Element) => void;
}

/**
 * @description 监听滚动容器内的元素 出现/消失在可视范围内
 * @param opts
 */
const useDisplay = (opts: Options) => {
  const {
    ele,
    scrollEle,
    onShow = () => {},
    onHidden = () => {},
    onFirstShow = () => {},
  } = opts;
  const firstShowed = useRef(false); // 已经出现过一次标记
  const show = useRef(false); // 当前的显示状态

  const calcDisplay = useCallback(() => {
    if (!scrollEle.current || !ele.current) return;
    const scrollEleInfo = scrollEle.current.getBoundingClientRect();
    const eleInfo = ele.current.getBoundingClientRect();

    if (
      eleInfo.y > scrollEleInfo.y &&
      eleInfo.y < scrollEleInfo.y + scrollEleInfo.height
    ) {
      if (!show.current) {
        onShow(ele.current);
        show.current = true;
        if (!firstShowed.current) {
          onFirstShow(ele.current);
          firstShowed.current = true;
        }
      }
    } else {
      if (show.current) {
        onHidden(ele.current);
        show.current = false;
      }
    }
  }, [ele, scrollEle]);

  useLayoutEffect(() => {
    if (!scrollEle.current || !ele.current) return;
    calcDisplay();
    scrollEle.current.addEventListener('scroll', calcDisplay);
    return () => {
      scrollEle.current?.removeEventListener('scroll', calcDisplay);
    };
  }, [calcDisplay, scrollEle, ele]);
};

export default useDisplay;
