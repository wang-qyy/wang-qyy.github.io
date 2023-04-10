export const useGuide = () => {
  // 获取位置
  const getPopupContainer = ({
    size = {},
    selector = '',
    position = '',
    offset = [0, 0, 0, 0], // 上、右、下、左
  }) => {
    const positionArr = position.split('-');
    const container = document.querySelectorAll(selector);

    if (!container || !size) return {};

    const domRect = container[0]?.getBoundingClientRect();
    if (!domRect) return {};

    let { top, left } = domRect;
    const { width, height, bottom, right } = domRect;

    switch (positionArr[0]) {
      case 'top':
        top = top - Number(size.height) + offset[0];
        break;
      case 'bottom':
        top = bottom + offset[2];
        break;
      case 'left':
        left = left - Number(size.width) + offset[3];
        break;
      case 'right':
        left = right + offset[1];
        break;
      default:
        break;
    }

    switch (positionArr[1]) {
      case 'top':
        top += offset[0];
        break;
      case 'bottom':
        top = bottom - Number(size.height) + offset[2];
        break;
      case 'left':
        left += offset[3];
        break;
      case 'right':
        left = right - Number(size.width) + offset[1];
        break;
      default:
        if (positionArr[0] === 'left' || positionArr[0] === 'right') {
          top = top + height / 2 - Number(size.height) / 2;
        } else if (positionArr[0] === 'top' || positionArr[0] === 'bottom') {
          left = left + width / 2 - Number(size.width) / 2;
        }
        break;
    }

    return { top, left, position: positionArr };
  };
  return { getPopupContainer };
};
