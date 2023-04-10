import { TemplateClass } from '@hc/editor-core';

// 判断动画转场是否选中
export function checkIsSelectedTransfer(data: any, template?: TemplateClass) {
  if (template?.endTransfer?.attribute.animation) {
    const { enter, exit } = template.endTransfer.attribute.animation;
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
  if (Number(data.id) === Number(template?.endTransfer?.attribute.resId)) {
    return true;
  }
  return false;
}
