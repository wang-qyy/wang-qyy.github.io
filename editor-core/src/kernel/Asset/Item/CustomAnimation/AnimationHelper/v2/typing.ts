import { IKs } from '../../../../../typing';

export interface IPageAnimation {
  /** [playIndex] 元素播放顺序 - 页动画特有属性 - int */
  pi?: number;
  /** 动画 id */
  resId?: string;
  /** 效果名 */
  rt_name?: string;
  /** 效果图 */
  rt_list_preview?: string;
  /** [delay] 元素播放顺序延迟  - 页动画特有属性 */
  d?: {
    /** [type] 延迟类型 - int */
    t: number;
    s: number[];
    // 属性详情根据 [type] 控制
    [key: string]: any;
  };
  /** 关键帧动画集合类型 - int */
  kwst?: number;
  /** 关键帧动画集合 */
  kws?: {
    /** main 主元素动画 当前页第一个元素 */
    m?: [
      {
        /** 起始关键帧 - int */
        ip: number;
        /** 结束关键帧 - int */
        op: number;
        /** 关键帧详情 */
        ks: IKs;
      },
    ];
    /** common 非文本元素动画 */
    c?: {
      /** 起始关键帧 - int */
      ip: number;
      /** 结束关键帧 - int */
      op: number;
      /** 关键帧详情 */
      ks: IKs;
    }[];
    /** text 文本元素动画 */
    t?: {
      /** 起始关键帧 - int */
      ip: number;
      /** 结束关键帧 - int */
      op: number;
      /** 关键帧详情 */
      ks: IKs;
    }[];
  };
}

/** 元素特效 接口定义 START */

export interface IAssetEffect {
  t: number;
  resId: string;
  il: boolean;
  rt_preview_url?: string;
  rt_name?: string;
  rt_urlImage?: string;
  ks?: {
    l?: IListAnimation[];
  };
}

export interface IListAnimation {
  is: boolean; // false: 在主元素上方；ture：在主元素下方
  i: number; // 元素索引，值越大层级越高（高层级覆盖地层级）
  type: string;
  resId: string; // 元素ID
  ip: number;
  op: number;
  iu: boolean; // false：设计师元素；true：用户元素
  rt_url?: string;
  rt_ow?: number;
  rt_oh?: number;
  x?: number;
  y?: number; // x、y 定位单位（默认：1）
  pu: number; // 1：像素；2：百分比（x = 0.1 为 10%）,以主元素为 100%
  w?: number;
  h?: number; // width、height 尺寸单位（默认：1）
  su: number; // 1：像素；2：百分比（w = 0.1 为 10%）,以主元素为 100%
  al?: number; // 透明度
  ro?: number; // 旋转 360° 取余 取整数
  ks: IKs;
  l?: IListAnimation[];
}

/** 元素特效 接口定义 END */

/** 元素动效 接口定义 START */

export interface IAssetAnimation {
  resId: string;
  rt_name?: string;
  rt_list_preview?: string;
  kw: {
    /** 起始关键帧 - int */
    ip: number;
    /** 结束关键帧 - int */
    op: number;
    /** 关键帧详情 */
    ks: IKs;
  };
}

/** 元素动效 接口定义 END */
export interface ICanvas {
  x?: number;
  y?: number;
  left?: number;
  top?: number;
  height: number;
  width: number;
  scale: number;
  backgroundColor?: {
    r: number;
    g: number;
    b: number;
    a: number;
  };
  showUnit?: 'px' | 'cm' | 'mm';
  floorCutting?: {
    height: number;
  }[];
  /* group word 临时属性 */
  positionX?: number;
  positionY?: number;
  /* group word 临时属性 */
}

export interface ICanvasPainted {
  jobId?: string;
  isDesigner?: boolean;

  [key: string]: any;
}
