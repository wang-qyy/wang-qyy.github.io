import { SVGViewBox, Container, Transform } from '@kernel/typing';

/**
 * @description 获取svg的viewbox
 * @param SVGDom
 */
export function getSVGViewBox(SVGDom: SVGElement): SVGViewBox | undefined {
  if (!SVGDom) {
    return undefined;
  }
  let viewBox = SVGDom.getAttribute('viewBox');
  if (!viewBox) {
    for (const key of SVGDom.childNodes) {
      const item = SVGDom.getAttribute('viewBox');
      if (item) {
        viewBox = item;
        break;
      }
    }
  }
  if (viewBox) {
    const [x, y, width, height] = viewBox.split(' ') as [
      string,
      string,
      string,
      string,
    ];
    return {
      x,
      y,
      width,
      height,
    };
  }
}

/**
 * @description 将domStr转化为Dom对象
 * @param domStr {string} domStr
 * @returns {Node}
 */
function stringToDom(domStr: string): SVGElement | undefined {
  try {
    const parentDom = document.createElement('div');
    parentDom.innerHTML = domStr;

    for (const key of parentDom.childNodes) {
      if (key.nodeName === 'svg') {
        return key as SVGElement;
      }
    }
  } catch (e: any) {
    console.error(`${domStr}转换失败，请确实是否是符合规范的dom`);
    throw new Error(e);
  }
}

export class HandleSvg {
  svgString: string;

  svgNode: SVGElement | undefined;

  fabricSvg: SVGElement | undefined;

  viewBox: SVGViewBox | undefined;

  toolsElement:
    | {
        children: HTMLCollection;
        lastElementChild: Element;
      }
    | undefined;

  constructor(svgString: string, svgId?: string) {
    // 针对svgId唯一的情况
    if (svgId) {
      this.svgString = svgString.replaceAll(`SVGID_`, `SVGID_${svgId}`);
    } else {
      this.svgString = svgString;
    }
    // 受fabric支持的svg节点
    this.init();
  }

  error = () => {
    throw new Error(`未传入正确的svg数据，实际传入：${this.svgString}`);
  };

  init = () => {
    this.svgNode = stringToDom(this.svgString);
    if (this.svgNode) {
      this.setToolsElement();
      this.viewBox = getSVGViewBox(this.svgNode);
      this.formatSvg();
      this.batchSetAttributes(this.svgNode, {
        preserveAspectRatio: 'none',
        style: `opacity:0;position:absolute;`,
      });
    } else {
      this.error();
    }
  };

  setToolsElement = () => {
    const { firstElementChild } = this.svgNode ?? {};
    const { children } = firstElementChild ?? {};
    if (!children || !firstElementChild) {
      throw new Error(`未传入正确的svg数据，实际传入：${this.svgString}`);
    }
    this.toolsElement = {
      lastElementChild: firstElementChild,
      children,
    };
  };

  getToolsElement = () => {
    if (!this.toolsElement) {
      throw new Error(`未传入正确的svg数据，实际传入：${this.svgString}`);
    }
    return this.toolsElement;
  };

  /**
   * @description 获取背景图片节点 和 路径节点
   */
  getImgAndClipPathNode = () => {
    const { children: SVGDom } = this.getToolsElement();
    const imageNodes: ChildNode[] = [];
    const clipPathNodes: ChildNode[] = [];
    for (let i = 0; i < SVGDom.length; i++) {
      const tempSVGDom = SVGDom[i];
      if (tempSVGDom.nodeName === 'clipPath') {
        clipPathNodes.push(tempSVGDom);
      }
      if (tempSVGDom.nodeName === 'g') {
        imageNodes.push(tempSVGDom.childNodes[1]);
      }
    }
    return {
      imageNodes,
      clipPathNodes,
    };
  };

  /**
   * @description 删除带有img底图的节点
   */
  removeImgTag = () => {
    const { lastElementChild, children } = this.getToolsElement();
    if (children[2] && children[2].nodeName === 'g') {
      lastElementChild.removeChild(children[2]);
    } else {
      console.error('删除失败：未找到目标节点');
    }
  };

  /**
   * @description 重构svg为fabric支持的格式
   */
  formatSvg = () => {
    if (this.svgNode) {
      const { children } = this.getToolsElement();
      const path = children[0].innerHTML;
      const clone = this.svgNode.cloneNode(false) as SVGElement;
      clone.innerHTML = `<defs></defs>${path}`;

      this.fabricSvg = clone;
    }
  };

  /**
   * @description 获取ClipPathId
   */
  getClipPathId = () => {
    const { children } = this.getToolsElement();
    if (children[1] && children[1].nodeName === 'clipPath') {
      return children[1].id;
    }
    throw new Error(`未传入正确的svg数据，实际传入：${this.svgString}`);
  };

  /** 对于蒙版
   * @description 获取ClipPathId
   */
  getClipPathIdMask = () => {
    const { children = [] } = this.svgNode || {};
    if (children[0] && children[0].nodeName === 'g') {
      const { children: cchildren } = children[0];
      if (cchildren[1] && cchildren[1].nodeName === 'clipPath') {
        return cchildren[1].id;
      }
      throw new Error(`未传入正确的svg数据，实际传入：${this.svgString}`);
    }
  };

  /**
   * @description 获取ClipPathId  针对来画的svg
   */
  getClipPathIdNew = () => {
    const { children } = this.getToolsElement();
    if (children[0] && children[0].nodeName === 'clipPath') {
      return children[0].id;
    }
    throw new Error(`未传入正确的svg数据，实际传入：${this.svgString}`);
  };

  /**
   * @description 获取svgString
   */
  getSvgStr = () => {
    return this?.svgNode?.outerHTML;
  };

  /**
   * @description 获取svgString
   */
  getFabricSvg = () => {
    return this.fabricSvg ? this.fabricSvg.cloneNode(true) : null;
  };

  /**
   * @description 获取ViewBox的宽高
   */
  getViewBoxSize = () => {
    if (this.viewBox) {
      return {
        viewBoxWidth: parseInt(this.viewBox.width, 10),
        viewBoxHeight: parseInt(this.viewBox.height, 10),
      };
    }
  };

  /**
   * @description 获取svg的图形类型
   * @returns {string|null}
   */
  getSvgType = () => {
    if (this.fabricSvg && this.fabricSvg.lastElementChild) {
      const { nodeName } = this.fabricSvg.lastElementChild;
      // 取第一个字符
      const reg = RegExp(/^./);
      // 第一个字符大写
      const firstWord = nodeName[0].toUpperCase();
      return nodeName.replace(reg, firstWord);
    }
    return null;
  };

  /**
   * @description 设置Element属性
   * @param dom
   * @param attrs
   */
  batchSetAttributes = (
    dom: SVGElement | Element,
    attrs: Record<string, any>,
  ) => {
    Object.keys(attrs).forEach((key) => {
      attrs[key] !== undefined && dom.setAttribute(key, attrs[key]);
    });
  };

  /**
   * @description 整体替换元素属性
   * @param svgAttrs
   * @param clipPathAttrs
   */
  updateAttr = ({
    svgAttrs,
    clipPathAttrs,
  }: {
    svgAttrs: Record<string, any>;
    clipPathAttrs: Record<string, any>;
  }) => {
    const { children } = this.getToolsElement();
    const [_, clipPath] = children;
    if (this.svgNode && this.fabricSvg && clipPath) {
      this.batchSetAttributes(this.svgNode, svgAttrs);
      this.batchSetAttributes(clipPath, clipPathAttrs);
      this.batchSetAttributes(this.fabricSvg, clipPathAttrs);
    }
  };

  /**
   * @description 处理裁剪和形变，判断是否需要更新svg属性
   * @param container
   * @param transform
   */
  update = ({
    container,
    transform,
  }: {
    container: Container;
    transform: Transform;
  }) => {
    const svgAttrs = {
      style: `transform: scaleX(${transform.horizontalFlip ? -1 : 1}) scaleY(${
        transform.verticalFlip ? -1 : 1
      })`,
    };
    const scaleX = container.viewBoxWidth / container.viewBoxWidthBack;
    const scaleY = container.viewBoxHeight / container.viewBoxHeightBack;
    const clipPathAttrs = {
      style: `transform: scaleX(${scaleX}) scaleY(${scaleY})`,
    };
    this.updateAttr({
      svgAttrs,
      clipPathAttrs,
    });
  };
}
