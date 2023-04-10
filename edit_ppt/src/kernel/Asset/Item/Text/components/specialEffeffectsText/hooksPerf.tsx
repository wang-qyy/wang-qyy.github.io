import { CacheImage } from '@kernel/utils/cacheImage';
import { deepCloneJson, RGBAToString } from '@kernel/utils/single';
import fabric from 'fabric';
import { useRef } from 'react';
import { EffectAuto, fontAttrProperties } from './typing';

const canvas2dBackend = new fabric.Canvas2dFilterBackend();
fabric.filterBackend = canvas2dBackend;
const useNewPsd = () => {
  const canvas = useRef<any>(null);
  const maxStroke = useRef(null);
  const dataData = useRef(null);
  const textList = useRef([]);

  function findMaxStrokeWidth(data: any) {
    const { strokes = [], strokeList, supportTexts } = data;
    let maxStrokeWidth = 0;
    strokes.forEach((element: any) => {
      if (maxStrokeWidth < strokeList[element].width) {
        maxStrokeWidth = strokeList[element].width;
      }
    });
    supportTexts.forEach((item: any) => {
      const { strokes: suppStrokes } = item;
      suppStrokes.forEach((stroke2: any) => {
        if (maxStrokeWidth < strokeList[stroke2].width) {
          maxStrokeWidth = strokeList[stroke2].width;
        }
      });
    });
    return maxStrokeWidth;
  }
  function getOffsetPos(parentData: any, children: any) {
    const { left, top } = parentData;
    const { left_diff = 0, top_diff = 0 } = children;
    return {
      left: left + left_diff,
      top: top + top_diff,
    };
  }
  function renderFont(text: any, pData: any) {
    const data = deepCloneJson(pData);
    const {
      fills,
      strokes,
      fillList,
      strokeList,
      shadowList,
      sourceList,
      ...other
    } = data;
    other.shadow = shadowList[other.shadow];
    text.set(other);

    function fillWithColor(ctx: any, color: any) {
      ctx.set('fill', color);
    }

    function fillWithLinear(ctx: any, linearData: any) {
      const gradient = new fabric.Gradient(linearData);
      ctx.set('fill', gradient);
    }
    async function fillWithImage(ctx: any, item: any) {
      const imgCache = new CacheImage('effectImage');
      const imgDom = await imgCache.getImageDom(sourceList[item.sourceIndex]);
      const pattern = new fabric.Pattern({
        source: imgDom,
        repeat: item.repeat,
        patternTransform: item.patternTransform,
        offsetX: item.offsetX || 0,
        offsetY: item.offsetY || 0,
      });
      ctx.set('fill', pattern);
      ctx.pattern = pattern;
      canvas.current.renderAll();
    }

    fills.forEach((item: any) => {
      switch (fillList[item].value?.type) {
        case 'linear':
          fillList[item].value.colorStops.forEach((element) => {
            if (element.color instanceof Object) {
              element.color = RGBAToString(element.color);
            }
          });
          fillWithLinear(text, fillList[item].value);
          break;
        case 'pattern':
          fillWithImage(text, fillList[item].value);
          break;
        default:
          fillWithColor(text, fillList[item].value);
      }
    });

    strokes.forEach((item: any) => {
      let stroke;
      if (typeof strokeList[item].value === 'string') {
        stroke = strokeList[item].value;
      } else {
        strokeList[item].value.colorStops.forEach((element) => {
          if (element.color instanceof Object) {
            element.color = RGBAToString(element.color);
          }
        });
        stroke = new fabric.Gradient(strokeList[item].value);
      }
      text.set({
        strokeMiterLimit: strokeList[item].miterLimit,
        stroke,
        strokeWidth: strokeList[item].width,
        // 根据字笑数据判断，圆角描边都带有miterLimit属性，直角描边则不带
        strokeLineJoin: strokeList[item].miterLimit ? 'miter' : 'round',
      });
    });
  }
  // 设置画布属性
  function setCanvasAttr(width: number, height: number) {
    canvas.current.setWidth(width, 'backstoreOnly');
    canvas.current.setHeight(height, 'backstoreOnly');
    canvas.current.enableRetinaScaling = true;
  }
  function renderNewPsd() {
    if (canvas.current) {
      canvas.current.clear();
      canvas.current.renderAll.bind(canvas.current);
      let width = 0;
      let height = 0;
      textList.current.forEach((item: any) => {
        canvas.current.add(item.node);
        renderFont(item.node, item.data);
        if (item.node.getScaledHeight()) {
          height = Math.max(
            item.node.getScaledHeight() * item.data.scale,
            height,
          );
        }
        width = item.data.width * item.data.scale;
      });
      setCanvasAttr(width + maxStroke.current, height + maxStroke.current);
    }
  }
  // 拆分描边数据
  function formatStrokesData(fdata: any) {
    const { supportTexts = [], strokeList, text, ...other } = fdata;
    const fontData = [];
    supportTexts.forEach((item: any) => {
      delete item.fontSize;
      delete item.fontFamily;
      delete item.fontWeight;
      delete item.charSpacing;
      delete item.angle;
      const dataLep = {
        ...other,
        ...item,
        strokeList,
        text,
        width: other.width,
        height: other.height,
        scaleY: other.scaleY ?? 1,
        scaleX: other.scaleX ?? 1,
      };
      if (item.strokes.length > 0) {
        dataLep.strokeWidth = strokeList[item.strokes[0]]?.width;
      }
      Object.assign(dataLep, getOffsetPos(other, item));
      if (dataLep.strokes.length > 1) {
        dataLep.strokes.forEach((stroke: any) => {
          const tempData = JSON.parse(JSON.stringify(dataLep));
          const sLeft = strokeList[stroke].diff + dataLep.left;
          const sTop = strokeList[stroke].diff + dataLep.top;
          tempData.left = sLeft;
          tempData.top = sTop;
          tempData.strokes = [stroke];
          tempData.strokeWidth = strokeList[stroke].width;
          if (strokeList[stroke].diff !== 0) {
            tempData.shadow = [];
          }
          fontData.push({
            node: new fabric.Textbox(text, {
              splitByGrapheme: true,
              cornerColor: 'red',
              borderColor: 'red',
              cursorColor: 'black',
            }),
            data: tempData,
          });
        });
      } else {
        let genDiff = 0;
        let strokeWidth = 0;
        if (
          strokeList.length > 0 &&
          dataLep.strokes.length > 0 &&
          item.strokes.length > 0
        ) {
          genDiff = strokeList[dataLep.strokes[0]]?.diff;
          strokeWidth = strokeList[item.strokes[0]]?.width;
        }
        const sLeft = genDiff + dataLep.left;
        const sTop = genDiff + dataLep.top;
        fontData.push({
          node: new fabric.Textbox(text, {
            splitByGrapheme: true,
            cornerColor: 'red',
            borderColor: 'red',
            cursorColor: 'black',
            strokeWidth,
          }),
          data: { ...dataLep, left: sLeft, top: sTop },
        });
      }
    });

    if (other.strokes.length > 1) {
      other.strokes.forEach((item: any) => {
        const sLeft = strokeList[item].diff + other.left;
        const sTop = strokeList[item].diff + other.top;
        let { shadow } = other;
        if (strokeList[item].diff !== 0) {
          shadow = [];
        }
        fontData.push({
          node: new fabric.Textbox(text, {
            splitByGrapheme: true,
            cornerColor: 'red',
            borderColor: 'red',
            cursorColor: 'black',
          }),
          data: {
            ...other,
            strokeList,
            left: sLeft,
            top: sTop,
            strokeWidth: strokeList[item].width,
            shadow,
            text,
            strokes: [item],
          },
        });
      });
    } else {
      const sLeft = other.left;
      const sTop = other.top;
      let otherStrokeWidth = 0;
      if (strokeList.length > 0 && other.strokes.length > 0) {
        otherStrokeWidth = strokeList[other.strokes[0]]?.width;
      }
      fontData.push({
        node: new fabric.Textbox(text, {
          splitByGrapheme: true,
          cornerColor: 'red',
          borderColor: 'red',
          cursorColor: 'black',
        }),
        data: {
          ...other,
          strokeList,
          left: sLeft,
          top: sTop,
          strokeWidth: otherStrokeWidth,
          text,
        },
      });
    }
    return fontData;
  }
  function formatFontData(data: any, params: any) {
    data = { ...data, ...params, oldFontSize: data.fontSize };
    // 暂存
    dataData.current = data;
    // 开始处理
    data.text = data.text.replaceAll('&nbsp;', ' ');
    data.text = data.text.replaceAll('<br/>', '\n');
    if (data.text instanceof Array) {
      data.text = (data.text || []).join('\n');
    }
    // 处理数据
    switch (data.textDecoration) {
      case 'line-through':
        data.linethrough = true;
        break;
      case 'underline':
        data.underline = true;
        break;
    }

    // 默认字体
    data.fontWeight = data.fontWeight || 'normal';
    data.fontStyle = data.fontStyle || 'normal';
    data.fontFamily = data.fontFamily || 'fnsyhtRegular';

    // 边缘预留宽度
    const maxStrokeWidth = findMaxStrokeWidth(data);
    maxStroke.current = maxStrokeWidth;
    // @ts-ignore
    canvas.current.setZoom(data.scale);
    // setCanvasAttr(data.width, data.height + maxStrokeWidth);
    data.width = data.width / data.scale;
    data.height = data.height / data.scale;

    data.padding = 0;
    data.left = 0;
    data.top = maxStrokeWidth / 2;
    data.strokeUniform = false;

    // 此部分，修改源码，可以去掉
    data.charSpacing = (data.letterSpacing * 1000) / data.fontSize;
    /** *****合并数据********* */
    let fontData = [];
    // 组织渲染的数据
    fontData = formatStrokesData(data);
    return fontData;
  }
  /**
   * 初始化
   *
   * @param data 初始数据
   * @param id 画布id
   * @param params 字体参数
   */
  function initNewPsd(data: EffectAuto, id: any, params: any) {
    // 创建 StaticCanvas
    canvas.current = new fabric.StaticCanvas(id);
    // 格式化数据
    // @ts-ignore
    textList.current = formatFontData(data, params);
    // 渲染
    renderNewPsd();
  }

  /**
   * 改变字体基本信息
   * @param font
   */
  function changeNewPsdFontAttr(fontParam: any) {
    const font = dataData.current;
    if (font) {
      // 开始处理
      if (fontParam.text instanceof Array) {
        fontParam.text = (fontParam.text || []).join('\n');
      }
      fontParam.text = fontParam.text.replaceAll('&nbsp;', ' ');
      fontParam.text = fontParam.text.replaceAll('<br/>', '\n');
      // 处理数据
      switch (fontParam.textDecoration) {
        case 'line-through':
          fontParam.linethrough = true;
          break;
        case 'underline':
          fontParam.underline = true;
          break;
      }
      // 边缘预留宽度
      const maxStrokeWidth = findMaxStrokeWidth(font);
      maxStroke.current = maxStrokeWidth;
      // @ts-ignore
      canvas.current.setZoom(fontParam.scale);
      // setCanvasAttr(fontParam.width, fontParam.height + maxStrokeWidth);
      fontParam.width = fontParam.width / fontParam.scale;
      fontParam.height = fontParam.height / fontParam.scale;

      fontParam.fontWeight = fontParam.fontWeight || 'normal';
      fontParam.fontStyle = fontParam.fontStyle || 'normal';
      fontParam.fontFamily = fontParam.fontFamily || 'fnsyhtRegular';
      //  @ts-ignore
      fontParam.charSpacing =
        (fontParam.letterSpacing * 1000) / fontParam.fontSize;
      let height = fontParam.height * fontParam.scale;
      textList.current.forEach((item: any) => {
        item.node.set({
          ...fontParam,
        });
        if (item.node.getScaledHeight()) {
          height = Math.max(
            item.node.getScaledHeight() * fontParam.scale,
            height,
          );
        }
      });
      setCanvasAttr(
        fontParam.width * fontParam.scale + maxStrokeWidth,
        height + maxStrokeWidth,
      );
      // canvas.current.renderAll();
      canvas.current.requestRenderAll();
    }
  }

  return {
    initNewPsd,
    renderNewPsd,
    changeNewPsdFontAttr,
  };
};

export default useNewPsd;

// 预加载图片
export function startLoadingAllImages(imageURLs: any, callback: () => void) {
  const imgs = [];
  let imagesOK = 0;
  for (let i = 0; i < imageURLs.length; i++) {
    const img = new Image();
    imgs.push(img);
    // eslint-disable-next-line no-loop-func
    img.onload = () => {
      imagesOK += 1;
      if (imagesOK >= imageURLs.length) {
        callback();
      }
    };
    img.onerror = () => {};
    img.src = imageURLs[i];
  }
}
