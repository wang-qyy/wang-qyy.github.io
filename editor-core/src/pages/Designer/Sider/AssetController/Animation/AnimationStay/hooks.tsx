import {
  FreePathType,
  usePathAnimationObserver,
  useStayEffectObserver,
  useGetCurrentAsset,
} from '@hc/editor-core';
import { Modal } from 'antd';

export interface pathProps {
  points: number[][];
  width: number;
  height: number;
  x: number;
  y: number;
  freePathType: FreePathType;
  key: string;
}
const usePathHook = () => {
  const asset = useGetCurrentAsset();
  const { updatePoints, clearPath } = usePathAnimationObserver();
  const { setPreview } = useStayEffectObserver();
  // 设置路径动画
  const setAnimation = (data: pathProps) => {
    if (asset?.attribute?.aeA) {
      Modal.confirm({
        title: '确定要清空入场动画/出场动画吗？',
        content: '停留动画无法与入场动画/出场动画同时存在！',
        okText: '确认',
        cancelText: '我再想想',
        onOk: () => {
          updatePoints(data);
        },
      });
    } else {
      updatePoints(data);
    }
    // 注释先预览一次
    // setTimeout(() => {
    //   setPreview();
    // }, 100);
  };
  const clearPathAnimation = () => {
    clearPath();
  };
  return {
    setAnimation,
    clearPathAnimation,
  };
};
export default usePathHook;
