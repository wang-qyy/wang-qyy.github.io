import { getCurrentTemplate } from '@hc/editor-core';

const useTransition = () => {
  // 当前片段
  const currentTemplate = getCurrentTemplate();

  // 判断动画转场是否选中
  const checkIsChoosed = (data: any) => {
    if (currentTemplate?.endTransfer?.attribute?.animation) {
      const { enter, exit } = currentTemplate.endTransfer.attribute.animation;
      if (
        enter.duration > 0 &&
        data?.animation?.enter &&
        data?.animation?.enter.duration > -1
      ) {
        if (
          enter.baseId === data?.animation.enter.baseId &&
          enter.details.direction === data?.animation.enter.details.direction
        ) {
          return true;
        }
      }
      if (
        exit.duration > 0 &&
        data?.animation?.exit &&
        data?.animation?.exit.duration > -1
      ) {
        if (
          exit.baseId === data?.animation.exit.baseId &&
          exit.details.direction === data?.animation.exit.details.direction
        ) {
          return true;
        }
      }
    }
    if (
      Number(data.id) === Number(currentTemplate?.endTransfer?.attribute.resId)
    ) {
      return true;
    }
    return false;
  };
  return { checkIsChoosed };
};
export default useTransition;
