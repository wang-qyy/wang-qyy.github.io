import { Asset } from '@kernel/typing';
import {
  getCenterPointFromSize,
  AssetCoordinate,
  calculateRotatedPointCoordinate,
  positionToCoordinate,
  coordinateTOPosition,
} from '@kernel/utils/mouseHandler/mouseHandlerHelper';

export function getEmptyContainer() {
  return {
    posY: 0,
    posX: 0,
    width: 0,
    height: 0,
    rt_svgString: undefined,
  };
}

export class ImageClipperHandler {
  scale: number;
  rotate: number;
  asset: Asset;
  protected attribute: AssetCoordinate;
  protected container: AssetCoordinate;

  constructor(asset: Asset, scale: number) {
    this.scale = scale;
    this.asset = asset;
    const { attribute, transform } = asset;
    const { posY, posX, rotate } = transform;
    const { container = getEmptyContainer(), width, height } = attribute;

    this.rotate = rotate;

    this.attribute = new AssetCoordinate(
      { width, height },
      {
        left: transform.posX,
        top: transform.posY,
      },
      scale,
    );

    this.container = new AssetCoordinate(
      container,
      {
        left: posX + container.posX,
        top: posY + container.posY,
      },
      scale,
    );
  }

  getStyle = () => {
    const scale = this.scale;
    const rotate = this.rotate;
    const { transform, attribute } = this.asset;
    const {
      posY,
      posX,
      width = 0,
      height = 0,
    } = attribute.container ?? getEmptyContainer();

    const style = {
      left: (transform.posX + posX) * scale,
      top: (transform.posY + posY) * scale,
      transform: `rotate(${rotate}deg)`,
      width: attribute.width * scale,
      height: attribute.height * scale,
      // zIndex: transform.zindex * 10 - 5,
    };
    // console.log("transform", {
    //   left: transform.posX,
    //   top: transform.posY
    // });
    // console.log("container", {
    //   left: posX,
    //   top: posY
    // });
    // console.log(style);
    if (rotate) {
      /**
       * 1 计算出原始裁剪容器的中心坐标
       * 2 计算出新裁剪容器的中心坐标
       * 3 因为裁剪后的元素旋转是围绕裁剪容器中心的，所以需要将元素容器的中心根据裁剪中心旋转，可以得到正确的元素中心点位置
       * 4 将新位置与新中心坐标旋转，得到实际位置坐标
       * 5 将新位置与旧中心坐标反向旋转，得到正确的坐标
       */
      const containerPosition = {
        left: transform.posX * scale,
        top: transform.posY * scale,
      };
      const containerSize = {
        width: width * scale,
        height: height * scale,
      };
      const containerCenter = getCenterPointFromSize(
        containerPosition,
        containerSize,
      );

      const attributeCenter = getCenterPointFromSize(style, style);
      const rotatedAttributeCenter = calculateRotatedPointCoordinate(
        attributeCenter,
        containerCenter,
        rotate,
      );
      const rotatedAttributePosition = calculateRotatedPointCoordinate(
        positionToCoordinate(style),
        containerCenter,
        rotate,
      );
      const originAttributePosition = calculateRotatedPointCoordinate(
        rotatedAttributePosition,
        rotatedAttributeCenter,
        -rotate,
      );

      Object.assign(style, coordinateTOPosition(originAttributePosition));
    }
    return style;
  };
}
