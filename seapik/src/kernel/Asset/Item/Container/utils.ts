import type {
  Asset,
  AssetClass,
  CanvasInfo,
  ContainerAddedAsset,
  ContentInfoItem,
} from '@kernel/typing';
import { CSSProperties } from 'react';
import { useSvgHelper, SVGHandler } from '@AssetCore/Item/SVG/utils';
import asset from '@kernel/Asset';

export { useSvgHelper };

export class ContainerHandler {
  imageList: Element[];

  svgHandler: SVGHandler;

  constructor(SVGWrapperDom: HTMLDivElement) {
    this.svgHandler = new SVGHandler(SVGWrapperDom);
    this.imageList = [];
  }

  getNodeNameG = () => {
    // @ts-ignore
    const SVGDom = this.svgHandler.SVGDom.childNodes[0].childNodes;
    let item;
    for (let i = 0; i < SVGDom.length; i++) {
      item = SVGDom[i];
      if (item.nodeName === 'g') {
        const tempSVGDom = item.childNodes;
        let tempItem;
        for (let j = 0; j < tempSVGDom.length; j++) {
          tempItem = tempSVGDom[j];
          if (tempItem.nodeName === 'g') {
            // @ts-ignore
            this.imageList.push(tempItem.childNodes[1]);
          }
        }
      }
    }
  };

  setSvgAttribute = (
    contentInfo: ContentInfoItem[],
    containerAddedAsset: ContainerAddedAsset | undefined,
    index: number,
  ) => {
    const defaultData = {
      imageUrl: 'https://js.xiudodo.com/index_img/editorV6.0/containerBg.jpg',
      width: 1546,
      height: 984,
      posX: 0,
      posY: 0,
    };
    contentInfo.forEach((item, i) => {
      let data = defaultData;
      if (containerAddedAsset?.index == index) {
        // @ts-ignore
        data = containerAddedAsset.info;
      } else {
        data = item;
      }
      this.imageList[i].setAttribute('xlink:href', data.imageUrl);
      this.imageList[i].setAttribute('width', `${data.width}px`);
      this.imageList[i].setAttribute('height', `${data.height}px`);
      this.imageList[i].setAttribute('x', `${data.posX}px`);
      this.imageList[i].setAttribute('y', `${data.posY}px`);
      this.imageList[i].setAttribute('transform', 'matrix(1 0 0 1 0 0)');
    });
  };

  replaceSvg = (SVGString: string, resId: string, index: number) => {
    // todo 代码异常
    this.svgHandler.replaceSvg(SVGString, resId);
    const { width = '0', height = '0' } = this.svgHandler.getSVGViewBox() ?? {};
    ContainerAdapter.updateContainerContentInfo(index, {
      viewBoxWidth: parseInt(width, 10),
      viewBoxHeight: parseInt(height, 10),
    });
  };
}

const tipAreaStyle: CSSProperties = {
  position: 'absolute',
  top: '20px',
  left: 0,
  right: 0,
  display: 'inline-block',
  padding: '0 15px',
};

export function useContainerStyle(asset: AssetClass, canvasInfo: CanvasInfo) {
  const { scale } = canvasInfo;
  const { width, height } = asset.attribute;
  const assetElementStyle: CSSProperties = {
    width,
    height,
    transformOrigin: '0 0',
    transform: `scale(${scale}) translateZ(0px)`,
  };
  const tipContentStyle: CSSProperties = {
    fontSize: '12px',
    padding: '7px',
    background: 'rgba(0, 0, 0, 0.35)',
    display: 'inline-block',
    position: 'relative',
    left: '50%',
    marginLeft: '-105px',
    width: '196px',
    color: '#fff',
    transform: `scale(${1 / scale})`,
    borderRadius: '4px',
  };

  return {
    assetElementStyle,
    tipContentStyle,
    tipAreaStyle,
  };
}
