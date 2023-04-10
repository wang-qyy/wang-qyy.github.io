import classNames from 'classnames';

import { getCanvasInfo } from '@/kernel/store';
import Transformer from '@kernel/Components/Transformer';
import { ResizePointStatic } from '@kernel/Components/TransformPoints/handler';
import { AssetClass } from '@/kernel/typing';
import { getCanvasClientRect } from '@kernel/utils/single';
import {
  ChangeType,
  TransformerChangerParams,
} from '@kernel/Components/Transformer/typing';

import { CalcResize, correctOffsetByRotate } from './handler';

const { unLRTB, LR, TB } = ResizePointStatic;

export default function BackgroundTransform(props: {
  style: { width: number; height: number; left: number; top: number };
  asset: AssetClass;
  originAbsolute: { x: number; y: number };
}) {
  const { scale } = getCanvasInfo();

  const { style: styleProps, asset, originAbsolute } = props;

  const { meta } = asset;
  const { rotate } = asset.transform;

  function onChange(
    type: ChangeType,
    { style }: TransformerChangerParams,
    distance: { x: number; y: number },
  ) {
    if (style) {
      const { rect } = CalcResize[type](rotate, styleProps, {
        left: distance.x,
        top: distance.y,
      });

      const offset = correctOffsetByRotate[type](
        rotate,
        originAbsolute,
        distance,
      );

      // console.log(offset);

      asset.update({
        attribute: {
          width: rect.width / scale,
          height: rect.height / scale,
          crop: {
            size: asset.assetOriginSize,
            position: { x: offset.x / scale, y: offset.y / scale },
          },
        },
        transform: { posX: rect.left / scale, posY: rect.top / scale },
      });
    }
  }

  function changeStart() {}
  function changeEnd() {}

  return (
    <Transformer
      className={classNames({
        // 'corner-point': maskType === 'preview',
        // 'no-left-top-resize-point': hiddenPoint?.left_top,
        // 'no-left-bottom-resize-point': hiddenPoint?.left_bottom,
        // 'no-right-top-resize-point': hiddenPoint?.right_top,
        // 'no-right-bottom-resize-point': hiddenPoint?.right_bottom,
      })}
      nodes={[...unLRTB, ...LR, ...TB]}
      style={styleProps}
      rotate={0}
      getRect={getCanvasClientRect}
      rotatePoint={false}
      locked={meta.locked}
      onChange={onChange}
      //   minRect={minRect}
      //   maxRect={maxRect}
      onChangeEnd={changeEnd}
      onChangeStart={changeStart}
    />
  );
}
