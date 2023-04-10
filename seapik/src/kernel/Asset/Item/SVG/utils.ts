import type {
  SVGStrokes,
  AssetClass,
  SVGViewBox,
  RGBA,
  SVGStretch,
} from '@kernel/typing';
import { CSSProperties, useEffect, useRef } from 'react';
import {
  analyDashTypeBSvg,
  colorToRGBA,
  colorToRGBAObject,
  getCoorsByAngle,
  RGBAToString,
  deepCloneJson,
} from '@kernel/utils/single';
import { getSVGViewBox } from '@kernel/utils/svgHandler';
import { gradientId } from '@kernel/utils/idCreator';
import { toNumber } from 'lodash-es';
import { getAngle } from '@/kernel/utils/single';
import { assetIdPrefix } from '@/kernel/utils/const';

export function getStyles(
  asset: AssetClass,
  canvasScale: number,
): {
  assetImgLoadStyle: CSSProperties;
  FlipStyle: CSSProperties;
  assetElementStyle: CSSProperties;
} {
  const scale = canvasScale;
  const assetElementStyle = {
    width: asset.containerSize.width,
    height: asset.containerSize.height,
  };
  const FlipStyle = {
    width: '100%',
    height: '100%',
    transform: `scaleX(${asset.transform.flipX ? -1 : 1}) scaleY(${
      asset.transform.flipY ? -1 : 1
    })`,
  };

  const assetImgLoadSize = 36 / scale;
  const assetImgLoadStyle = {
    fontSize: `${36 / scale}px`,
    width: `${assetImgLoadSize}px`,
    height: `${assetImgLoadSize + 2}px`,
  };
  return {
    assetImgLoadStyle,
    FlipStyle,
    assetElementStyle,
  };
}

interface SVGStretchCore extends SVGStretch {
  assetWidth: number;
  assetHeight: number;
}
export class SVGHandler {
  SVGDom: SVGElement | undefined;

  SVGWrapperDom: HTMLDivElement;

  rectNode: any;

  colors: any;

  svgColorsDom: any;

  viewBox: SVGViewBox | undefined;

  svgStrokes: SVGStrokes | undefined;

  strokeNode: SVGElement | undefined;

  svgStretch: SVGStretch | undefined;

  // 原始的:svgStretch
  svgStretchCore: SVGStretchCore | undefined;

  constructor(SVGWrapperDom: HTMLDivElement) {
    this.SVGWrapperDom = SVGWrapperDom;
  }

  getSVGViewBox = () => {
    return this.viewBox;
  };

  getSVGStretch = () => {
    return this.svgStretch;
  };

  getSVGColors = () => {
    return this.colors;
  };

  getSVGStrokes = () => {
    return this.svgStrokes;
  };

  /**
   * 解析svg可变更的填充颜色
   * @param originDom
   * @param SVGDom
   * @returns
   */
  // @ts-ignore
  updateColorNode = (
    originDom = this.SVGDom,
    SVGDom = this.SVGDom?.childNodes,
  ) => {
    if (!SVGDom) {
      return;
    }
    let item: any = '';
    let tempFill: any = '';
    const oldNodeId: string[] = [];
    const fillIds: string[] = [];
    for (let i = 0; i < SVGDom.length; i++) {
      item = SVGDom[i];
      if (
        item.nodeName !== '#text' &&
        item.nodeName !== 'linearGradient' &&
        item.nodeName !== 'radialGradient' &&
        item.nodeName !== 'stop'
      ) {
        const gradientKey = gradientId();
        tempFill = item.getAttribute('fill');
        let yFill = item.getAttribute('yfill');
        if (!yFill) {
          yFill = tempFill;
        }
        if (tempFill !== null && tempFill !== 'none') {
          let id = tempFill;
          if (tempFill.includes('url(#')) {
            id = tempFill.replaceAll('url(#', '').replaceAll(')', '');
          }

          let isExitId = '';
          // 判断当前渐变颜色是否已经存在
          // eslint-disable-next-line no-loop-func
          fillIds.forEach((key) => {
            if (key === id) {
              isExitId = this.colors[key].id;
            }
          });
          fillIds.push(id);
          if (tempFill.includes('url(#')) {
            if (item.nodeName === 'circle') {
              return;
            }
            if (isExitId === '') {
              oldNodeId.push(id);
              // @ts-ignore
              const parent = originDom?.getElementById(id);
              const x1 = parseFloat(parent?.getAttribute('x1') || '0');
              const y1 = parseFloat(parent?.getAttribute('y1') || '0');
              const x2 = parseFloat(parent?.getAttribute('x2') || '0');
              const y2 = parseFloat(parent?.getAttribute('y2') || '0');
              const angle = getAngle(x2 - x1, y2 - y1);
              const coord = getCoorsByAngle(angle);
              const childList = parent?.childNodes;
              const colorStops: any[] = [];
              // 构建渐变点数据
              if (childList) {
                childList?.forEach((child: any, index: number) => {
                  if (child.nodeName === 'stop') {
                    const style = child?.getAttribute('style');
                    const colorReg = /stop-color: ?(#\w+|rgb(a?)\(.*\))/gi;
                    const opacityReg = /stop-opacity: ?([\d.]+)/gi;
                    const opacityMatch = style.match(opacityReg);

                    let opacity = 1;
                    if (opacityMatch && opacityMatch[0]) {
                      opacity = parseFloat(
                        opacityMatch[0].replaceAll('stop-opacity:', ''),
                      );
                    }

                    const ColorMatch = style.match(colorReg);
                    colorStops.push({
                      // @ts-ignore
                      offset:
                        Math.floor(child?.getAttribute('offset') * 100) / 100 ||
                        0,
                      // @ts-ignore
                      color: colorToRGBA(
                        ColorMatch[0].replaceAll('stop-color:', ''),
                        opacity,
                      ),
                    });
                  }
                  if (index === childList.length - 1) {
                    const tmpColor = {
                      coords: coord,
                      colorStops,
                      angle,
                    };
                    Object.assign(this.colors, {
                      [yFill]: {
                        id: gradientKey,
                        color: tmpColor,
                      },
                    });
                  }
                });
              }
              if (!this.svgColorsDom[yFill]) {
                Object.assign(this.svgColorsDom, {
                  [yFill]: [],
                });
              }
              this.svgColorsDom[yFill].push(item);
              item.setAttribute('fill', `url(#${gradientKey})`);
            } else {
              this.svgColorsDom[isExitId].push(item);
              item.setAttribute('fill', `url(#${isExitId})`);
            }
          } else {
            if (isExitId === '') {
              Object.assign(this.colors, {
                [yFill]: {
                  id: gradientKey,
                  color: id,
                },
              });
              item.setAttribute('fill', id);
              if (!this.svgColorsDom[yFill]) {
                Object.assign(this.svgColorsDom, {
                  [yFill]: [],
                });
              }
              this.svgColorsDom[yFill].push(item);
            } else {
              this.svgColorsDom[yFill].push(item);
              item.setAttribute('fill', id);
            }
          }
        }
        if (item.childNodes.length > 0) {
          this.updateColorNode(originDom, item.childNodes);
        }
      }
    }
    oldNodeId.forEach((id) => {
      // @ts-ignore
      const tmpNode = originDom?.getElementById(id);
      if (tmpNode) {
        tmpNode?.parentNode.removeChild(tmpNode);
      }
    });
  };

  /**
   * 解析描边数据
   */
  analySvgStroke = () => {
    if (this.SVGDom) {
      const childNodes = this.SVGDom?.childNodes;
      const node: any[] = [];
      childNodes.forEach((item) => {
        if (
          item.nodeName !== 'text' &&
          item.nodeName !== '#text' &&
          item.nodeName !== 'title'
        ) {
          node.push(item);
        }
      });

      if (node && node.length === 1) {
        const strokeNode = node[0];
        if (strokeNode) {
          this.strokeNode = strokeNode;
          const stroke = strokeNode.getAttribute('stroke');
          const strokeWidth = toNumber(strokeNode.getAttribute('stroke-width'));
          const strokeDash =
            strokeNode.getAttribute('stroke-dasharray') ?? '0,0';
          if (stroke) {
            this.svgStrokes = [
              {
                stroke: colorToRGBAObject(stroke),
                strokeWidth,
                strokeDash,
                strokeDashType: analyDashTypeBSvg(strokeDash, strokeWidth),
                strokeLinecap:
                  strokeNode.getAttribute('stroke-linecap') || 'round',
              },
            ];
          }
          // else {
          //   this.svgStrokes = [
          //     {
          //       stroke: { r: 0, g: 0, b: 0, a: 1 },
          //       strokeWidth: 0,
          //       strokeDash: '0',
          //       strokeDashType: 0,
          //       strokeLinecap: null,
          //     },
          //   ];
          // }
        }
      }
    }
  };

  // 设置渐变元素
  gradientFormatElement = (gradient: any, gradientKey: string) => {
    if (this.SVGDom) {
      // const SVGDom = deepCloneJson(this.SVGDom);
      const xmlns = this.SVGDom.getAttribute('xmlns');
      const xmlnsXlink = this.SVGDom.getAttribute('xmlns:xlink');
      const { colorStops = [], coords, type } = gradient;
      // @ts-ignore
      let gradienDom = this.SVGDom.getElementById(gradientKey);
      if (colorStops.length > 0) {
        if (!gradienDom) {
          // 创建渐变dom
          gradienDom = document.createElementNS(xmlns, 'linearGradient');
        } else {
          gradienDom.innerHTML = '';
        }
        const gDom = document.createElement('g');
        gradienDom.setAttributeNS(null, 'id', gradientKey);
        gradienDom.setAttributeNS(null, 'x1', coords.x1);
        gradienDom.setAttributeNS(null, 'y1', coords.y1);
        gradienDom.setAttributeNS(null, 'x2', coords.x2);
        gradienDom.setAttributeNS(null, 'y2', coords.y2);

        // 创建颜色停顿点
        colorStops.forEach((color: any) => {
          let setColor = color.color;
          if (typeof setColor !== 'string') {
            setColor = RGBAToString(setColor);
          }
          const stopDom = document.createElementNS(xmlns, 'stop');
          stopDom.setAttributeNS(null, 'offset', color.offset);
          stopDom.setAttributeNS(null, 'style', `stop-color:${setColor}`);
          gradienDom.appendChild(stopDom);
        });

        gDom.appendChild(gradienDom);
        this.SVGDom.prepend(gradienDom);
      } else {
        if (gradienDom) {
          gradienDom.parentNode.removeChild(gradienDom);
        }
      }
    }
  };

  xmlToString = (xmlObject: SVGElement) => {
    return new XMLSerializer().serializeToString(xmlObject);
  };

  // 获取rect结点
  getRectNode = (
    svgdom: any,
    info: SVGStretch,
    assetWidth: number,
    assetHeight: number,
  ) => {
    if (svgdom && this.viewBox) {
      let node = null;
      const { width: vWidth = 1 } = this.viewBox;
      const scaleSvg = assetWidth / Number(vWidth);

      const svgDomChild = svgdom.childNodes;
      for (let i = 0; i < svgDomChild.length; i++) {
        const item = svgDomChild[i];
        if (item.nodeName === 'rect') {
          if (!info) {
            this.svgStretchCore = {
              ...this.viewBox,
              rectInfo: {
                width: item.getAttribute('width') * scaleSvg,
                height: item.getAttribute('height') * scaleSvg,
                rx: item.getAttribute('rx') * scaleSvg,
                ry:
                  (item.getAttribute('ry') || item.getAttribute('rx')) *
                  scaleSvg,
                x: item.getAttribute('x'),
                y: item.getAttribute('y'),
              },
              assetHeight,
              assetWidth,
            };
          } else {
            this.svgStretchCore = {
              ...info,
              assetWidth,
              assetHeight,
            };
          }
          if (node) {
            node = null;
            break;
          } else {
            node = item;
          }
        }
      }
      this.rectNode = node;
    }
  };

  replaceSvg = (
    SVGString: string,
    resId: string,
    svgStr: SVGStretch,
    assetWidth: number,
    assetHeight: number,
    id: number,
  ) => {
    const svgStretch = deepCloneJson(svgStr);

    // 处理特殊素材的id重复问题  暂时未能找到很好的解决方式
    // const reg = /(?<=filter="url\(#).*(?=\)")/g;
    const reg = /(?<=\="url\(#).*(?=\)")/g;
    const list = SVGString.match(reg) || [];
    list.forEach((item) => {
      SVGString = SVGString.replaceAll(item, `${item}_${resId}_${id}`);
    });

    this.SVGWrapperDom.innerHTML = SVGString;
    this.SVGWrapperDom.setAttribute('svgId', resId);
    this.SVGDom = this.SVGWrapperDom.childNodes[0] as SVGElement;
    this.SVGDom.setAttribute('data-asset-id', `${assetIdPrefix}${id}`);
    this.colors = {};
    this.svgColorsDom = {};
    this.viewBox = getSVGViewBox(this.SVGDom);
    this.svgStretchCore = {
      ...svgStretch,
      assetHeight,
      assetWidth,
    };
    this.svgStrokes = undefined;
    this.getRectNode(this.SVGDom, svgStretch, assetWidth, assetHeight);
  };

  transform = (
    width: number,
    height: number,
    asset: AssetClass,
    rt_itemScale: number,
  ) => {
    if (this.SVGDom) {
      this.SVGDom.setAttribute('preserveAspectRatio', 'none');
      // 设置SVG宽高
      this.SVGDom.setAttribute('width', `${width}px`);
      this.SVGDom.setAttribute('height', `${height}px`);
      this.SVGDom.style.position = 'absolute';
      this.SVGDom.style.left = '0';
      this.SVGDom.style.top = '0';
      if (this.rectNode && this.svgStretchCore?.rectInfo) {
        const { assetWidth: lastWidth, assetHeight: lastHeight } =
          this.svgStretchCore;
        if (lastWidth && lastHeight) {
          const widthDiff = lastWidth - width;
          const heightDiff = lastHeight - height;
          const {
            width: nodeWidth,
            height: nodeHeight,
            rx,
            ry,
            x,
            y,
          } = this.svgStretchCore.rectInfo;
          let setRx = toNumber(rx);
          let setRy = toNumber(ry);
          let setWidth = Math.abs(nodeWidth - widthDiff);
          let setHeight = Math.abs(nodeHeight - heightDiff);

          if (setWidth <= setRx * 2 && rt_itemScale !== 1) {
            setRx = setWidth / 2;
          }

          if (setHeight <= setRy * 2 && rt_itemScale !== 1) {
            setRy = setHeight / 2;
          }
          if (rt_itemScale && rt_itemScale !== 1 && this.svgStretch?.rectInfo) {
            const scale = width / lastWidth;
            setRx *= scale;
            setRy *= scale;
            setWidth = nodeWidth * scale;
            setHeight = nodeHeight * scale;
          }
          setWidth = Math.floor(setWidth);
          setHeight = Math.floor(setHeight);
          // 更新rect节点
          this.rectNode.setAttribute('rx', `${setRx}`);
          this.rectNode.setAttribute('ry', `${setRy}`);
          if (x) {
            this.rectNode.setAttribute('x', x);
          }
          if (y) {
            this.rectNode.setAttribute('y', y);
          }
          const strokeWidth = this.rectNode.getAttribute('stroke-width');
          if (strokeWidth) {
            setWidth = width - strokeWidth;
            setHeight = height - strokeWidth;
          }
          this.rectNode.setAttribute('width', `${setWidth}`);
          this.rectNode.setAttribute('height', `${setHeight}`);

          this.SVGDom.setAttribute('viewBox', `0 0 ${width} ${height}`);

          this.svgStretch = {
            ...this.svgStretch,
            width,
            height,
            rectInfo: {
              width: setWidth,
              height: setHeight,
              rx: setRx,
              ry: setRy,
              x,
              y,
            },
          };
        }
      }
    }
  };

  setColor = (
    colors: Record<
      string,
      {
        id: string;
        color: RGBA | { angle: number; coords: any[]; colorStops: any[] };
      }
    >,
    resId: string,
  ) => {
    if (this.SVGDom) {
      Object.keys(colors).forEach((key) => {
        if (colors[key] && this.svgColorsDom[key]) {
          const itemColor = colors[key];
          let realColor = itemColor.color;
          this.colors[key] = itemColor;
          if (realColor) {
            // @ts-ignore
            if (realColor?.colorStops?.length > 0) {
              this.svgColorsDom[key].forEach((domItem: SVGElement) => {
                domItem.setAttribute('fill', `url(#${itemColor.id})`);
                domItem.setAttribute('yfill', key);
              });
              // 添加/变更渐变元素
              this.gradientFormatElement(realColor, itemColor.id);
            } else {
              const beforeColor = realColor;
              if (!(typeof realColor === 'string')) {
                // @ts-ignore
                realColor = RGBAToString(realColor);
              }
              this.colors[key].color = beforeColor;
              this.svgColorsDom[key].forEach((domItem: SVGElement) => {
                if (realColor) {
                  // @ts-ignore
                  domItem.setAttribute('fill', realColor);
                  // @ts-ignore
                  domItem.setAttribute('yfill', key);
                }
              });
              // 删除渐变元素
              this.gradientFormatElement({}, itemColor.id);
            }
          }
        }
      });
    }
  };

  setStroke = (
    strokeSvg: SVGStrokes,
    width: number,
    height: number,
    asset: AssetClass,
  ) => {
    if (this.strokeNode && strokeSvg) {
      const { stroke, strokeWidth, strokeDash, strokeLinecap } = strokeSvg[0];
      this.strokeNode.setAttribute('stroke', RGBAToString(stroke));
      this.strokeNode.setAttribute('stroke-width', `${strokeWidth}`);
      this.strokeNode.setAttribute('stroke-dasharray', strokeDash);
      this.strokeNode.setAttribute('stroke-linecap', `${strokeLinecap}`);
      if (this.rectNode) {
        if (this.svgStretch?.rectInfo.x && this.svgStretchCore?.rectInfo.x) {
          this.svgStretch.rectInfo.x = strokeWidth / 2;
          this.svgStretchCore.rectInfo.x = strokeWidth / 2;
        }
        if (this.svgStretch?.rectInfo.y && this.svgStretchCore?.rectInfo.y) {
          this.svgStretch.rectInfo.y = strokeWidth / 2;
          this.svgStretchCore.rectInfo.y = strokeWidth / 2;
        }
        this.transform(width, height, asset, 1);
      }
      this.svgStrokes = strokeSvg;
    }
  };
}

export function useSvgHelper({ asset }: { asset: AssetClass }) {
  const { rt_itemScale = 1 } = asset?.parent?.tempData || {};
  const { rt_svgString, width, height } = asset.attribute;
  const svgHandler = useRef<SVGHandler>(null);
  const svgHandlerInstance = svgHandler.current;

  function setSVGHandler(dom: HTMLDivElement) {
    // @ts-ignore
    svgHandler.current = new SVGHandler(dom);
  }

  function hasSvg() {
    return rt_svgString;
  }

  useEffect(() => {
    asset?.setSVGRtAttribute?.({
      width,
      height,
    });
  }, []);
  useEffect(() => {
    if (svgHandlerInstance) {
      svgHandlerInstance.transform(width, height, asset, rt_itemScale);
      const svgStretch = svgHandlerInstance.getSVGStretch();
      if (svgStretch) {
        asset?.setSVGStretch?.(svgStretch);
      }
    }
  }, [width, height]);

  return {
    setSVGHandler,
    hasSvg,
    svgHandlerInstance,
  };
}
