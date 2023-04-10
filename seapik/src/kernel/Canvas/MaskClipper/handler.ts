import { useGetCanvasInfo } from '@kernel/store';
import { Asset } from '@kernel/typing';
import {
  getCenterPointFromSize,
  AssetCoordinate,
  calculateRotatedPointCoordinate,
  positionToCoordinate,
  coordinateToPosition,
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

export class MaskClipperHandler {
  scale: number;

  rotate: number;

  asset: Asset;

  containerAsset: Asset;

  protected attribute: AssetCoordinate;

  protected container: AssetCoordinate;

  constructor(editAsset: Asset, asset: Asset, scale: number) {
    this.scale = scale;
    this.asset = asset;
    this.containerAsset = editAsset;
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

  getOriginStyle = () => {
    const { scale, rotate } = this;
    const { transform, attribute } = this.asset;
    const style = {
      left: transform.posX * scale,
      top: transform.posY * scale,
      width: attribute.width * scale,
      height: attribute.height * scale,
      position: 'absolute',
      transform: `rotate(${rotate}deg)`,
    };
    return style;
  };

  // 目前没用 暂存 不删除
  getPreviewStyle = (
    vSize: { viewBoxWidth: number; viewBoxHeight: number },
    vScale: { scaleX: number; scaleY: number },
    clipPath: string,
  ) => {
    const { scale, rotate } = this;
    const { transform, attribute } = this.asset;
    const {
      posY,
      posX,
      width = 0,
      height = 0,
    } = attribute.container ?? getEmptyContainer();
    const style = {
      touchAction: 'manipulation',
      width: vSize.viewBoxWidth,
      height: vSize.viewBoxHeight,
      clipPath: `url(#${clipPath})`,
      transform: `scale(${vScale.scaleX},${vScale.scaleY})`,
      transformOrigin: 'left top',
    };
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

      Object.assign(style, coordinateToPosition(originAttributePosition));
    }
    return style;
  };

  // 目前没用 暂存 不删除
  maskClipperStyle = (asset: Asset) => {
    const canvasInfo = useGetCanvasInfo();
    const { scale } = this;
    const { transform, attribute } = asset;
    const { posY, posX, rotate } = transform;
    const { width = 0, height = 0 } = attribute;
    const style = {
      width,
      height,
      transform: `rotate(${rotate}deg)`,
      position: 'absolute',
      left: posX * scale,
      top: posY * scale,
      visibility: 'visible',
    };
    if (rotate) {
      /**
       * 1 计算出原始裁剪容器的中心坐标
       * 2 计算出新裁剪容器的中心坐标
       * 3 因为裁剪后的元素旋转是围绕裁剪容器中心的，所以需要将元素容器的中心根据裁剪中心旋转，可以得到正确的元素中心点位置
       * 4 将新位置与新中心坐标旋转，得到实际位置坐标
       * 5 将新位置与旧中心坐标反向旋转，得到正确的坐标
       */
      const containerPosition = {
        left: 0,
        top: 0,
      };
      const containerSize = {
        width: canvasInfo.width * scale,
        height: canvasInfo.height * scale,
      };
      const attributePosition = {
        left: posX * scale,
        top: posY * scale,
      };
      const attributeSize = {
        width: width * scale,
        height: height * scale,
      };
      const containerCenter = getCenterPointFromSize(
        containerPosition,
        containerSize,
      );

      const attributeCenter = getCenterPointFromSize(
        attributePosition,
        attributeSize,
      );
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
      Object.assign(style, coordinateToPosition(originAttributePosition));
    }
    return style;
  };
}
