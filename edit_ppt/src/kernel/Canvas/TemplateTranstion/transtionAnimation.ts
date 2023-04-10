import {
  getCanvasInfo,
  getCurrentTemplateIndex,
  getRelativeCurrentTime,
  getTemplateList,
} from '@/kernel/store';
import { CanvasInfo, AssetItemProps, TemplateClass } from '@/kernel/typing';
import { SVG, Svg, Circle } from '@svgdotjs/svg.js';
import { toJS } from 'mobx';
import { CSSProperties, useEffect, useMemo, useRef } from 'react';

export class CircleAniManager {
  // 裁剪
  clipPath: String;

  draw: Svg;

  circle: Circle | null;

  startR: number; // 开始的半径

  endR: number; // 结束的半径

  type: string; // 类型

  constructor(node: Svg, type: string, canvasInfo: CanvasInfo) {
    this.draw = node;
    this.circle = null;
    this.clipPath = '';
    this.type = type;
    if (type === 'Enlarge') {
      this.startR = 0;
      this.endR = canvasInfo.width;
    } else {
      this.endR = 0;
      this.startR = canvasInfo.width;
    }
  }

  /**
   * 构建svg结构
   */
  buildSVG = () => {
    // 创建圆形裁剪形状
    const circle = this.draw
      .circle(this.startR)
      .fill('red')
      .attr({ cx: '50%', cy: '50%' });

    const clip = this.draw.clip();
    this.clipPath = Math.random() + this.type;
    clip.attr({
      id: this.clipPath,
    });
    circle.putIn(clip);

    this.circle = circle;
  };

  set = (percent: number) => {
    if (this.circle) {
      if (this.type === 'Enlarge') {
        this.circle.attr({
          r: this.endR * percent,
        });
      } else {
        this.circle.attr({
          r: this.startR - this.startR * percent,
        });
      }
    }
  };

  /**
   * 获取某个时间点的样式信息
   */
  getTimeMatrix = () => {};
}
const mapManager = {
  CIRCLE: CircleAniManager,
};
interface drawManager {
  draw: Svg;
  manager: any;
}
export const useTranstionAniManager = (
  node: string,
  params: React.PropsWithChildren<AssetItemProps>,
) => {
  const { asset } = params;
  const allTemplate = getTemplateList();
  const templateIndex = getCurrentTemplateIndex();
  const currentTime = getRelativeCurrentTime();
  // svg画布结点信息
  const drawList = useRef<drawManager[]>(
    new Array<drawManager>(allTemplate.length),
  );
  const draw = useRef<Svg>(null);
  const transtionDom = useRef<CircleAniManager>(null);
  const canvasInfo = getCanvasInfo();

  const init = (key: string, type: string) => {
    if (canvasInfo?.width && node) {
      const dom = SVG().addTo(`#${node}`).size('100%', '100%');
      dom.clear();
      const manager = new mapManager[key](dom, type, canvasInfo);
      drawList[templateIndex] = {
        draw: dom,
        manager,
      };
    }
  };
  const buildSVG = () => {
    if (transtionDom.current) {
      transtionDom.current.buildSVG();
    }
  };
  const playInPercent = (percent: number) => {
    if (transtionDom.current) {
      transtionDom.current.set(percent);
    }
  };
  const style = useMemo(() => {
    let style = {};
    let lastStyle = {};
    if (asset && transtionDom.current) {
      if (asset?.meta?.transferLocation === 'after') {
        switch (asset.attribute.transition.key) {
          case 'CIRCLE':
            if (asset.attribute.transition.type === 'Enlarge') {
              lastStyle = {
                clipPath: `url(#${transtionDom.current.clipPath})`,
                zIndex: 103,
              };
              style = {};
            } else {
              style = {
                clipPath: `url(#${transtionDom.current.clipPath})`,
              };
              lastStyle = {};
            }
            break;
        }
      } else {
        switch (asset.attribute.transition.key) {
          case 'CIRCLE':
            if (asset.attribute.transition.type === 'Enlarge') {
              style = {
                clipPath: `url(#${transtionDom.current.clipPath})`,
              };
              lastStyle = {};
            } else {
              lastStyle = {
                clipPath: `url(#${transtionDom.current.clipPath})`,
                zIndex: 103,
              };
              style = {};
            }
            break;
        }
      }
    }
    return {
      style,
      lastStyle,
    };
  }, [asset, transtionDom.current]);
  useEffect(() => {
    console.log('1===========', drawList[templateIndex]);
    if (drawList[templateIndex].manager) {
      transtionDom.current = drawList[templateIndex].manager;
      draw.current = drawList[templateIndex].draw;
    }
  }, [templateIndex]);
  useEffect(() => {
    if (asset && !draw.current) {
      try {
        init(asset.attribute.transition.key, asset.attribute.transition.type);
      } catch (error) {
        console.error(error);
      }
    } else {
      buildSVG();
    }
  }, [canvasInfo?.width, asset]);

  useEffect(() => {
    if (asset && transtionDom.current) {
      const { meta, attribute } = asset;
      const { startTime, endTime } = attribute;
      if (meta.transferLocation === 'after') {
        if (currentTime >= startTime && currentTime <= endTime) {
          playInPercent((currentTime - startTime) / 1000);
        } else {
          playInPercent(0);
        }
      }
      if (meta.transferLocation === 'before') {
        if (currentTime >= startTime && currentTime <= endTime) {
          playInPercent((currentTime - startTime + 500) / 1000);
        } else {
          playInPercent(1);
        }
      }
    }
  }, [currentTime, asset]);

  return { playInPercent, style };
};
