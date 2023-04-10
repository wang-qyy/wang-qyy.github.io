import { useMemo } from 'react';
import { observer } from 'mobx-react';
import { AssetItemProps, RGBA } from '@kernel/typing';
import { RGBAToString } from '@kernel/utils/single';
import { SpecialTextProps } from '@AssetCore/Item/Text/components/specialEffeffectsText';
import { transformGravityToCssProperties } from '../../../utils';

export interface TextBecomeImgParams {
  text: string[];
  fontSize: number;
  color?: RGBA;
  fontFamily: string;
}

/**
 * js使用canvas将文字转换成图像数据base64
 */
function textBecomeImg(params: TextBecomeImgParams, canvasInfo: any) {
  const {
    text: initText,
    fontSize = 16,
    color = { r: 0, g: 0, b: 0, a: 1 },
    fontFamily,
  } = params;

  const fontcolor = RGBAToString(color);

  const canvas = document.createElement('canvas');

  // 对于g j 等有时会有遮挡，这里增加一些高度
  // canvas.height = fontSize + height;
  canvas.height = canvasInfo.height;
  const context = canvas.getContext('2d');

  if (context) {
    // 擦除(0,0)位置大小为200x200的矩形，擦除的意思是把该区域变为透明
    context.clearRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = fontcolor;
    context.font = `${fontSize}px ${fontFamily}`;

    // canvas.width = context.measureText(text).width;
    canvas.width = canvasInfo.width;
    let lineWidth = 0;
    let initHeight = 100; // 绘制字体距离canvas顶部初始的高度
    let lastSubStrIndex = 0; // 每次开始截取的字符串的索引

    context.fillStyle = fontcolor;
    context.font = `${fontSize}px ${fontFamily}`;
    // top（顶部对齐） hanging（悬挂） middle（中间对齐） bottom（底部对齐） alphabetic是默认值
    context.textAlign = 'left';
    context.textBaseline = 'middle';

    initText.forEach(text => {
      for (let i = 0; i < text.length; i++) {
        lineWidth += context.measureText(text[i]).width;
        if (text[i] === '\n') {
          lineWidth = 0;
          initHeight += fontSize; // 20为字体的高度
          lastSubStrIndex = i;
        }
        if (lineWidth > canvas.width) {
          context.fillText(text.substring(lastSubStrIndex, i), 10, initHeight); // 绘制截取部分
          initHeight += fontSize; // 20为字体的高度
          lineWidth = 0;
          lastSubStrIndex = i;
        }
        if (i == text.length - 1) {
          // 绘制剩余部分
          context.fillText(
            text.substring(lastSubStrIndex, i + 1),
            10,
            initHeight,
          );
        }
      }
      lineWidth = 0;
      initHeight += fontSize; // 20为字体的高度
      lastSubStrIndex = 0;
    });

    // context.fillText(text, 0, 100);
  }

  const dataUrl = canvas.toDataURL('image/png'); // 注意这里背景透明的话，需要使用png
  return dataUrl;
}

function LogoText(props: SpecialTextProps) {
  const { asset, canvasInfo } = props;
  const { attribute } = asset;
  const {
    isFill = false,
    gravity = 'nw',
    fontSize,
    color,
    fontFamily,
    text = [],
    width,
    height,
    scale: imgScale = 100,
  } = attribute;

  const { scale } = canvasInfo;

  const [posX, posY] = transformGravityToCssProperties(gravity);

  const textImage = useMemo(() => {
    return textBecomeImg(
      {
        text,
        fontSize: 250,
        color,
        fontFamily: asset.fontFamily,
      },
      {
        width,
        height: height / 2,
      },
    );
  }, [text, fontSize, color, fontFamily]);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: `url(${textImage}) ${
          isFill ? 'repeat' : 'no-repeat'
        } ${posY} ${posX} / ${width * 0.8 * (imgScale / 100) * scale}px`,
      }}
    />
  );
}

export default observer(LogoText);
