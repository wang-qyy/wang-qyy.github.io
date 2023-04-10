import { useReactive, useThrottleFn } from 'ahooks';

export const useDrag = (props: any) => {
  const { bingStorage, winWidth, bindSildValue } = props;
  const state = useReactive({
    downClientX: 0, // 鼠标按下x值
    isMoving: false, // 鼠标拖动是否记录拖动位移值
  });

  // 鼠标按下记录当前位置
  const handleMouseDown = (event: any) => {
    event.preventDefault();
    state.isMoving = true;

    state.downClientX = event.clientX;
  };

  const { run } = useThrottleFn(
    (clientX: number) => {
      if (state.isMoving) {
        const val = (clientX - state.downClientX) / winWidth;
        bindSildValue(val);
      }
    },
    { wait: 16 },
  );

  // 鼠标抬起
  document.onmouseup = () => {
    if (state.isMoving) {
      bingStorage();
    }
    state.isMoving = false;
  };

  // 鼠标移动

  document.onmousemove = (event: any) => run(event.clientX);

  return {
    handleMouseDown,
  };
};
