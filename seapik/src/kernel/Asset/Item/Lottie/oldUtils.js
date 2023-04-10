import WebFont from 'webfontloader';
import { getFontNameValueList } from '@kernel/utils/defaultConfig';

export class OldLottieHandler {
  constructor(lottieDom, animation) {
    this.lottieDom = lottieDom;
    this.animation = animation;
  }

  updateTextLottieSvg = (textEditor, width, height, scale, asset) => {
    const svgDom = this.lottieDom.childNodes[0];
    if (!svgDom) {
      return;
    }
    const cont_g_dom =
      svgDom && svgDom.childNodes[1]
        ? svgDom.childNodes[1].childNodes[0]
        : null; // 文字容器 g
    const textDom = cont_g_dom ? cont_g_dom.childNodes[0] : null; // 文字 text
    const textSpanDom = textDom ? textDom.childNodes[0] : null; // 文字 tSpan
    const clipPath_RectDom =
      svgDom && svgDom.childNodes[0] && svgDom.childNodes[0].childNodes[1]
        ? svgDom.childNodes[0].childNodes[1].childNodes[0]
        : null;

    const curTextEditor = textEditor[0];
    const dataText = curTextEditor.text[0];
    const dataFontFamily = curTextEditor.fontFamily;
    const dataFontSize = curTextEditor.fontSize;
    const dataColor = curTextEditor.color;
    const fontNameValueList = getFontNameValueList();
    const newfontFamily = fontNameValueList[dataFontFamily];
    const newfontFamily2 = fontNameValueList.fnsyhtRegular;
    const _fontFamilyStr = `${newfontFamily},${newfontFamily2}`;
    const _colorStr = `rgb(${dataColor.r},${dataColor.g},${dataColor.b})`;
    const svgDomWidth = this.animation.animationData.w;
    const svgDomHeight = this.animation.animationData.h;
    // const lottieDataFontSize = this.animation.animationData.layers[0]?.t.d.k[0].s.s;
    const scaleRatio_w = (width * scale) / svgDomWidth;
    const scaleRatio_h = (height * scale) / svgDomHeight;
    const scaleRatio =
      scaleRatio_w > scaleRatio_h ? scaleRatio_h : scaleRatio_w;
    if (
      width / height != svgDomWidth / svgDomHeight &&
      clipPath_RectDom &&
      svgDom.childNodes[1]
    ) {
      // 拖动元素框时 调整svg绘制区域的大小
      if (width > height) {
        const newW = Math.round(svgDomHeight * (width / height));
        clipPath_RectDom.style.width = `${newW}px`;
        // clipPath_RectDom.style.x = -(newW - svgDomWidth)/2 + 'px';
        svgDom.childNodes[1].style.transform = `translateX(${
          -(newW - svgDomWidth) / 2
        }px)`;
      } else {
        const newH = Math.round(svgDomWidth * (height / width));
        clipPath_RectDom.style.height = `${newH}px`;
        svgDom.childNodes[1].style.transform = `translateX(${
          -(newH - svgDomHeight) / 2
        }px)`;
      }
    }
    if (clipPath_RectDom) {
      clipPath_RectDom.style.width = `${100000000000000}px`;
      clipPath_RectDom.style.height = `${100000000000000}px`;
      clipPath_RectDom.style.x = `${-10000}px`;
      clipPath_RectDom.style.y = `${-10000}px`;
    }

    cont_g_dom ? (cont_g_dom.style.fill = _colorStr) : '';
    cont_g_dom ? (cont_g_dom.style.fontFamily = _fontFamilyStr) : '';
    cont_g_dom ? (cont_g_dom.style.fontSize = dataFontSize) : '';
    // cont_g_dom ? cont_g_dom.style.fontSize = dataFontSize * (asset.attribute.width / svgDomWidth) : '';
    // const cont_g_domBounding = cont_g_dom.getBoundingClientRect();
    // const svgBounding = svgDom.getBoundingClientRect();
    // const svgWidth = svgDom.getAttribute("width");
    // const svgHeight = svgDom.getAttribute("height");

    // svgDom.setAttribute('viewBox',`0 0 ${asset.attribute.width * scale} ${asset.attribute.width * (svgDomHeight / svgDomWidth)  * canvas.scale}`)
    svgDom.setAttribute('width', asset.attribute.width * scale);
    svgDom.setAttribute(
      'height',
      asset.attribute.width * (svgDomHeight / svgDomWidth) * scale,
    );

    textSpanDom ? (textSpanDom.innerHTML = dataText) : '';
    // console.log(currentLottieId,'currentLottieId',svgDomContainer ,textSpanDom, textSpanDom.innerHTML);
  };
}
