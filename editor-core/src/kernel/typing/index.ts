import React, { CSSProperties } from 'react';
import AssetItemState from '@kernel/store/assetHandler/asset';
import TemplateItemState from '@kernel/store/assetHandler/template';
import { PlayStatus } from '@kernel/utils/const';
import { Property } from 'csstype';

export type Direction = 'l' | 'r' | 't' | 'b' | 'lt' | 'lb' | 'rt' | 'rb';
// after:模板播放结束后衔接转场  before:模板播放前衔接转场
export type TransferLocation = 'after' | 'before';
export type AssetClass = AssetItemState;
export type TemplateClass = TemplateItemState;
export type Assets = Asset[];

export interface CanvasInfo {
  width: number;
  height: number;
  scale: number;
}

export interface AssetTime {
  endTime: number;
  startTime: number;
}
export interface ManualCurrent {
  templateIndex: number;
  currentTime: number;
}
export type LogoType = 'text' | 'image';

export interface LogoAsset {
  text?: AssetClass;
  image?: AssetClass;
}

// 视频播放状态
export interface VideoStatus {
  playStatus: PlayStatus;
  currentTime: number;
  previewCurrentTime?: number;
  currentTimeWithClip?: number;
  speed?: number;
  // 播放音量
  volume?: number;
}

export type AssetIndex = number | number[];

export interface DefaultAssetProps {
  asset: AssetClass;
  parentAsset?: AssetClass;
  index: AssetIndex;
  showOnly: boolean;
  manualPreview?: boolean;
  prefix?: string;
  isPreviewMovie?: boolean;
  previewAll?: boolean;
  AssetRootRef: {
    current: HTMLDivElement | null;
  };
  canvasInfo: CanvasInfo;
  videoInfo: TemplateVideoInfo;
  videoStatus: VideoStatus;
  // 当前选中元素的索引
  assetActive?: number;
  whole?: boolean; // 是否为全片段
}

export interface AssetItemProps extends DefaultAssetProps {
  assetStyle: React.CSSProperties;
  assetClassName: string;
  isAssetActive: boolean;
}

export interface AssetProps {
  showOnly: boolean;
  currentPageNum?: number;
  classTag?: string;
}

export type ChangeCurrentTime = (time: number, isLoaded?: boolean) => void;

export interface StaticDataType {
  canvasInfo: CanvasInfo;
  assetProps: AssetProps;
  allAnimationTime: number;
  currentTime: number;
  isPreviewMovie?: number;
  changeCurrentTime?: ChangeCurrentTime;
}

export interface TemplateClonedWithRender extends RawTemplateData {
  id: number;
  videoInfo: TemplateVideoInfo;
}

export interface AssetStatusUpdateParams {
  // 该元素是否加载完成
  rt_assetLoadComplete: boolean;
  // 元素加载失败，默认false
  rt_assetLoadFailed: boolean;
}

export interface IKeyFrame {
  /** 起始帧 - int */
  t: number;
  /** 属性值 - double - toFixed(2) */
  s: number[];
  /** 内切线点集合 */
  i?: {
    /** 点的 [x, y] - double - toFixed(2) */
    s: [number, number];
  };
  o?: {
    /** 点的 [x, y] - double - toFixed(2) */
    s: [number, number];
  };
}

export interface IKs {
  /** 锚点 */
  a?: {
    k: IKeyFrame[];
  };
  /** 透明度 */
  o?: {
    k: IKeyFrame[];
  };
  /** 旋转 */
  r?: {
    k: IKeyFrame[];
  };
  /** 位置 */
  p?: {
    x?: {
      k: IKeyFrame[];
    };
    y?: {
      k: IKeyFrame[];
    };
    z?: {
      k: IKeyFrame[];
    };
  };
  /** 缩放 */
  s?: {
    x?: {
      k: IKeyFrame[];
    };
    y?: {
      k: IKeyFrame[];
    };
    z?: {
      k: IKeyFrame[];
    };
  };
  /** [custom] 自定义动画 */
  c?: {
    /** [type] 动画类型 - int */
    t: 1;
    /** 自定义动画详情 */
    ks: {
      /*  */
    };
  }[];
}

export interface Ikw {
  /** 起始关键帧 - int */
  ip: number;
  /** 结束关键帧 - int */
  op: number;
  /** 关键帧详情 */
  ks: IKs;
}

export interface AeK {
  i: Ikw;
  o: Ikw;
  s: Ikw;
}

export interface AssetTempUpdateParams {
  rt_auxiliary?: Auxiliary;
  // 子元素专用，用于标记自己的父元素
  rt_parentAssetId?: number;
  // 是否在变形中
  rt_inTransforming?: boolean;
  // 在选中框中展示loading状态
  rt_loading?: boolean;
  // 是否在移动中
  rt_inMoving?: boolean;
  // 针对于画布定位的数据，用于合成组以后，实时计算其绝对定位数据，方便还原
  rt_absolute?: Transform;
  // 针对于组元素定位的数据，用于缓存组，实时计算相对位置，方便合成组
  rt_relative?: Transform;
  // 与父元素的相对宽度比
  rt_relativeSizeRatio?: AssetBaseSize;
  rt_relativeFontSizeRatio?: number;
  rt_relativeLetterSpacingRatio?: number;
  // 用于缓存
  rt_attribute?: ModuleTempData;
  // 缩放标记
  rt_itemScale?: number;
  // 标记元素是否隐藏中
  rt_hideInCanvas?: boolean;
  // 资源加载标记
  rt_loadMark?: object;
  // 失去焦点时  是否需要删除
  rt_deleted?: boolean;
  // lottie是否需要预览
  rt_lottiePreview?: boolean;
  // 拖动合成蒙版上一次数据
  rt_asset?: Asset;
  rt_stopAutoCalc?: boolean;
  // hover图层的信息
  rt_hover?: {
    // 是否hover
    isHover: boolean;
    // 是否处于蒙版中心位置
    isMaskCenter?: boolean;
  };
  rt_style?: Rt_style;
  rt_previewStayEffect: boolean;
}
export interface Rt_style {
  width: number;
  height: number;
  posX: number;
  posY: number;
  rotate: number;
  opacity: number;
}
export interface BgAnimation {
  id: number;
  duration?: number;
}

export interface Asset {
  attribute: Attribute;
  meta: Meta;
  transform: Transform;
  assets?: Asset[];
}

export interface AssetWithRender extends Asset {
  assets?: AssetWithRender[];
  isAea: boolean;
  assetTransform: {
    rotate: number;
    opacity: number;
    zIndex: number;
  };
  id: number;
  assetSize: AssetBaseSize;
  containerSize: AssetBaseSize;
  containerSizeScale: AssetBaseSize;
  assetSizeScale: AssetBaseSize;
  assetPosition: Position;
  animationItemPbr: Record<keyof AeA, number>;
  animationItemDuration: Record<keyof AeA, number>;
  fontFamily: string;
  fontSizeScale: number;
  assetDuration: AssetTime;
}

// 用三个数字表示【left,centerLeft,right】
export interface AuxiliaryItem {
  start: number;
  center: number;
  end: number;
}

export interface Auxiliary {
  // left: Coordinate,
  // top: Coordinate,
  // bottom: Coordinate,
  // right: Coordinate,
  // rightBottom: Coordinate,
  // leftBottom: Coordinate,
  // rightTop: Coordinate,
  // leftTop: Coordinate,
  horizontal: AuxiliaryItem;
  vertical: AuxiliaryItem;
}

export interface AnimationTiming {
  baseId: number;
  details: { direction: number };
  duration: number;
}

export interface Animation {
  enter: AnimationTiming;
  exit: AnimationTiming;
  stay?: AnimationTiming;
}

export interface EffectVariant {
  state?: string;
  layers: {
    left: number;
    strokeColor?: RGBA;
    color?: RGBA;
    strokeWidth?: number;
    top: number;
    zIndex: number;
  }[];
  variableColorPara: {
    colorBlock: RGBA;
    colors: {
      index: number;
      key: 'strokeColor' | 'color' | string;
    }[];
  }[];
  rt_defaultFontColor?: RGBA;
  variableSizePara: {
    sizes: {
      index: number;
      key:
        | 'top'
        | 'left'
        | 'strokeWidth'
        | 'shadowH'
        | 'shadowV'
        | 'shadowBlur'
        | string;
    }[];
    range: {
      min: number;
      max: number;
    };
  }[];
  rt_name: string;
  rt_variantColors: any[];
  rt_variantList: {
    layers: {
      backgroundURL: string;
    }[];
  }[];
  rt_variantNames: any[];
  rt_defaultFontFamily: string;
}

export interface Filters {
  resId?: string;
  brightness: number; // 亮度 [-1 ~ 1]
  saturate: number; // 饱和度 [-1 ~ 1]
  contrast: number; // 对比度 [-1 ~ 1]
  blur: number; // 模糊 [0 ~ 1]
  sharpen: number; // 锐化 [0 ~ 1]
  strong?: number; // 滤镜强度 [0 ~ 1]
  'gamma-r'?: number; // red通道 [0.01 ~ 2.2]
  'gamma-g'?: number; // green 通道 [0.01 ~ 2.2]
  'gamma-b'?: number; // blue 通道 [0.01 ~ 2.2]
  hue: number; // 色相 [-2 ~ 2]
}

export interface Shadow {
  x?: number; // x偏移 [-100 ~ 100]
  y?: number; // y偏移 [-100 ~ 100]
  color?: string; // 十六进制颜色
  blur?: number; // 模糊 [0 ~ 50]
  spread?: number; // 扩散 [-100 ~ 100]
}

export interface RectInfo {
  width: number;
  height: number;
  rx?: number;
  ry?: number;
  x?: number;
  y?: number;
}

export interface SVGViewBox {
  x: string;
  y: string;
  width: string;
  height: string;
}

export interface SVGStretch {
  x?: string;
  y?: string;
  width: number;
  height: number;
  rectInfo: RectInfo;
}

export type ImageEffects = any;

export interface SVGStroke {
  // 颜色
  stroke: RGBA;
  // 宽度
  strokeWidth: number;
  // 间隙类型
  strokeDashType: number;
  // 间隙
  strokeDash: string;
  // 形状
  strokeLinecap?: string;
}

export type SVGStrokes = SVGStroke[];

export interface Container {
  height: number;
  id: string;
  posX: number;
  posY: number;
  source_height: string;
  source_width: string;
  source_key: string;
  picUrl: string;
  isEdit: boolean;
  svgUrl: string;
  // 请求svg结构以后，赋值到该字段
  rt_svgString?: string;
  viewBoxHeight: number;
  viewBoxHeightBack: number;
  viewBoxWidth: number;
  viewBoxWidthBack: number;
  width: number;
}

export type AssetGravity =
  | 'nw' // 左上
  | 'north' // 中上
  | 'ne' // 右上
  | 'west' // 左中
  | 'center' // 中部
  | 'east' // 右中
  | 'sw' // 左下
  | 'south' // 中下
  | 'se'; // 右下
// 路径动画类型
export type FreePathType = 'bessel' | 'line';

interface ColorStop {
  color: RGBA;
  offset: number;
}

export interface GradientType {
  type: string;
  angle: number;
  colorStops: ColorStop[];
  coords: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  };
}

export interface SvgInfo {
  fill: RGBA | GradientType; // 填充颜色
  radius?: number; // 圆角
  pathItems?: PathItem[];
  closed?: boolean; // 是否闭合路径
  stroke: RGBA; // 颜色
  strokeWidth: number; // 宽度
  strokeDashType: number; // 间隙类型
  strokeDash: string; // 间隙 strokeDasharray
  strokeLinecap?: 'inherit' | 'butt' | 'round' | 'square' | undefined; // 形状
}

export type OverlayType = 'video' | 'image' | 'lottie';

export interface EffectInfo {
  contrast?: number; // 对比度 [0 - 200%] 100%
  brightness?: number; // 亮度 [0 - 200%] 100%
  saturate?: number; // 饱和度的 [0 - 200%] 100%
  sepia?: number; // 棕褐色 [0 - 100%] 0
  grayscale?: number; // 灰度 [0 - 100%] 0
  invert?: number; // 反色 [0 - 100%] 0
  hue?: number; // 色相 [0 - 360deg] 0deg
  blur?: number; // 模糊 [0 - 20px] 0px
  mixBlendMode?: Property.MixBlendMode; // 叠加模式
  background?: RGBA; // 叠加颜色 目前没有实现渐变色
}
export interface QrcodeInfo {
  foreground: RGBA | GradientType; // 前景颜色
  background: RGBA; // 背景颜色
  pdGround?: RGBA; // 三个角的颜色
  text: string; // 文本内容
  wxText?: string; // 微信公众号id，用于文本展示
  textType: 'url' | 'wxUrl' | 'text'; // 文本类型
  rt_url?: string;
  resId?: string; // icon资源ID
  iconType?: string; // 当为custom时，为上传自定义，根据resId生成的rt_url值
}

export interface Attribute {
  svgInfo?: SvgInfo;
  qrcodeInfo?: QrcodeInfo;
  attribute: any[];
  effectInfo?: EffectInfo;
  class_id: any[];
  endTime: number;
  // 组元素的设计持续时长，用于动态计算缩放后的组元素以及子元素的动画、持续时长
  originDuration?: number;
  // 根据动画时间与出入场时间计算出实际的时间轴节点
  rt_assetTime: AssetTime;
  height: number;
  resId?: string;
  gid?: string;
  ufsId?: string;
  opacity?: number;
  rt_frame_url: string;
  rt_preview_url?: string;
  rt_preview?: string;
  rt_total_time: number; // 原视频时长
  rt_total_frame: number;
  // 针对于字体文件，是否需要自动更新宽高
  rt_stopAutoCalc?: boolean;
  // 显示抠图
  mattingInfo?: {
    resId: string; // 原始资源ID
    rt_url: string; // 原始资源URL
  };
  rt_url: string;
  rt_frame_file?: string; // gif和视频动画数据
  // 视频相关元素是否加载完成
  rt_isloaded: boolean;
  rt_ready: boolean;
  // 表示lottie的加载状态
  rt_lottieLoaded: boolean;
  // 图表类型
  chartBaseId?: number;
  startTime: number;
  width: number;
  // 裁剪开始时间
  cst?: number;
  // 裁剪结束时间
  cet?: number;
  animation?: Animation;
  bgAnimation?: BgAnimation;
  // 动画预览
  rt_previewAnimation?: Animation;
  writingMode?: 'horizontal-tb' | 'vertical-rl';
  color?: RGBA;
  fontStyle?: string;
  textDecoration?: string;
  colors: Record<string, RGBA>;
  effect?: string;
  effectVariant?: EffectVariant;
  rt_fontFamily_important?: string;
  fontFamily?: string;
  // 新增视频的音量
  videoVolume?: number;
  volume?: number; // 音量
  voiced?: boolean; // 是否有声音
  // 备份字体，用作候补字体
  rt_backupFontFamily?: string;
  fontSize?: number;
  fontWeight?: CSSProperties['fontWeight'];
  letterSpacing?: number;
  lineHeight?: number;
  text?: string[];
  textAlign?: CSSProperties['textAlign'];
  cropXFrom?: number;
  cropYFrom?: number;
  cropXTo?: number;
  cropYTo?: number;
  loopTimes?: number;
  isLoop?: boolean;
  filters?: Partial<Filters>;
  dropShadow?: Shadow;
  container?: Container;
  rt_owner?: string;
  sourceWidth?: string;
  sourceHeight?: string;
  assetWidth?: number;
  assetHeight?: number;
  picUrl?: string;
  rt_picUrl_2k?: string;
  source_key?: string;
  viewBox?: SVGViewBox;
  svgStretch?: SVGStretch;
  contentInfo?: ContentInfoItem[];
  textEditor?: any[];
  imageEffects?: ImageEffects;
  // todo 待完善类型
  kw?: AeAKw;
  aeA?: AeA;
  // 由于在某些动画下，元素的实际位置与现实位置不一致，所以需要根据变形值，计算出实际的数据
  rt_kwTransform_matrix?: CSSProperties['transform'];
  // 动画预览
  rt_previewAeA?: AeA;
  // 如果是视频，判断是否是用户上传的视频
  isUser?: boolean;
  // 花字 信息
  effectColorful?: SignatureEffectWord;
  SVGUrl?: string;
  // svg改变之后的dom信息
  rt_svgString?: string;
  svgStrokes?: SVGStrokes;
  // 字体背景色块信息
  textBackground?: {
    // 是否开启
    enabled: boolean;
    // 颜色
    color: RGBA;
    // 不透明度
    opacity: number;
    // 圆角
    borderRadius: number;
  };
  originResId?: string | number; // 原始 ResId
  mattingPicId?: string; // 抠图 ResId
  rt_relativeTime: { start: number; end: number };
  // logo 属性
  isFill?: boolean; // 是否铺满
  gravity?: AssetGravity; // 位置
  scale?: number;
  rt_blob_url?: string; // 滤镜图片的临时url地址,单片段画布画布

  transition: {
    key: string;
    type: string; // 类型
  }; // 转场的裁剪动画信息
  totalTime: number; // 转场时长

  // 停留特效
  stayEffect?: {
    // 动画时长
    duration: number;
    // 路径动画信息
    graph?: {
      key: string;
      width: number;
      height: number;
      x: number;
      y: number;
      // 速度
      easing: number;
      // 是否循环
      loop: boolean;
      points: number[][];
      // 路径类型 bessel:贝塞尔曲线 line:直线
      freePathType: FreePathType;
      // 动画每个节点的信息 默认只有终点信息 即长度始终为1
      toBounds: PathBound[];
    };
    // 旋转抖动动画信息
    attach?: {
      // Whirl:旋转 shake:抖动
      type: 'Whirl' | 'shake';
      data: {
        position?: {
          left: number;
          top: number;
        };
        // 速度
        speed: number;
        // 是否顺时针
        ccw?: boolean;
        // 方向
        direction?: number;
        // 振幅
        amplitude?: number;
      };
    };
  };
}
export interface PathBound {
  width: number;
  height: number;
  rotate: number;
  opacity: number;
}

export interface AeaKwKsP {
  x: { a: number; k: number[] };
  y: { a: number; k: number[] };
  z: { a: number; k: number[] };
}

export interface AeaKwKsK {
  a: number;
  k: number[];
}

export interface AeAKw {
  ip: number;
  ks: {
    a: AeaKwKsK;
    o: AeaKwKsK;
    p: AeaKwKsP;
    r: AeaKwKsK;
    s: AeaKwKsK;
  };
  isText?: boolean;
  textDelay?: number;
  op: number;
  direction?: Direction;
  ofh?: boolean;
  // transform-origin
  tfo?: Direction;
}

export interface AeAItem {
  kw?: AeAKw;
  pbr: number;
  resId?: string;
  title?: string;
  animationType?: string;
  duration?: number;
}

export interface AeA {
  i: AeAItem;
  o: AeAItem;
  s: AeAItem;
}

export interface ContentInfoItem {
  resId: string;
  imageUrl: string;
  width: number;
  height: number;
  posX: number;
  posY: number;
  viewBoxWidth: number;
  viewBoxHeight: number;
}

/**
 * @description
 * 正常type会保存至后端，
 * __type 为暂用节点，一般用于暂时使用，会在某一个时间节点卸载，不能用于保存等操作，会在提交保存时过滤
 */
export type AssetType =
  | 'videoE' // 视频
  | 'image' // 图片
  | 'background' //
  | 'pic' // 图片
  | 'SVG' // svg
  | 'group' // 图怪兽组
  | 'module' // 组
  | '__module' // 临时组
  | 'container' //
  | 'chart' //
  | 'table' //
  | 'lottie' // lottie
  | 'video' // 视频 mp4 分帧 webm(请求接口拿分帧)
  | 'text' // 文字
  | 'mask' // 蒙版
  | 'svgPath' // 自由绘制的svg
  | 'effect' // 特效层
  | 'qrcode' // 二维码
  | 'plain'; // 简单的类型，占位用

export type ShapeType =
  | 'rect' // 矩形
  | 'ellipse' // 椭圆
  | 'triangle' // 三角
  | 'line' // 线
  | 'path'; // 路径

// 拐角类型 rightAngle 直角 symmetric 对称 AngleSymmetry 角度对称 asymmetric 不对称
// 为空时不做约束
export type CornerType = 'rightAngle' | 'symmetric' | 'AngleSymmetry';

export type Point = [number, number];
export interface PathItem {
  start: Point; // 起始点位置
  end: Point; // 结束点位置
  startControl?: Point; // 起始控制点位置 为空时不显示控制点
  endControl?: Point; // 结束控制点位置 为空时不显示控制点
  cornerType?: CornerType; // 拐角类型 作用于结束点和下一个元素的开始点
}

export interface Meta {
  group?: string;
  id: number;
  isBackground?: boolean;
  isWatermark?: boolean;
  isLogo?: boolean;
  isQuickEditor?: boolean;
  isTextEditor?: boolean;
  isImageEditor?: boolean;
  // 是否贯通展示(相对于父级）元素贯穿后，startTime  endTime无意义
  isAlwaysVisible?: boolean;
  transferLocation?: TransferLocation;
  // 是否是转场效果
  isTransfer?: boolean;
  locked?: boolean;
  name?: string;
  className?: string;
  origin?: string;
  type: AssetType;
  shapeType?: ShapeType;
  addOrigin?: string;
  index: number;
  isUserAdd?: boolean;
  hidden?: boolean;
  // 是否阻止事件触发
  rt_disabledEvent?: boolean;
  isClip?: boolean;
  trackId?: string;
  replaced?: boolean; // 是否被替换过
  overlayType?: OverlayType; // 视频滤镜资源类型
  isOverlay?: boolean; // 是否是视频特效
}

export interface Transform {
  posX: number;
  posY: number;
  rotate: number;
  // 图怪兽原始数据格式非驼峰
  zindex: number;
  alpha?: number;
  horizontalFlip?: boolean;
  verticalFlip?: boolean;
}

export interface ModuleTempData {
  width: number;
  height: number;
  posX: number;
  posY: number;
  widthDiff?: number;
  HeightDiff?: number;
  poXDiff?: number;
  poYDiff?: number;
  fontSize?: number;
  container?: Container;
  letterSpacing?: number;
  lineHeight?: number;
  source_key?: string;
  rt_svgString?: string;
}

export interface AssetStoreUpdateParams {
  meta?: Partial<Meta>;
  filters?: Partial<Filters>;
  attribute?: Partial<Attribute>;
  transform?: Partial<Transform>;
  assets?: Assets;
  rt_attribute?: ModuleTempData;
  rt_asset?: Asset;
  tempData?: AssetTempUpdateParams;
}

export interface ContainerAddedAsset {
  index: number;
  info: ContentInfoItem[];
}

export interface PageInfo {
  pageTime: number;
}

export interface AssetLoadType {
  rt_assetLoadComplete: boolean;
  rt_assetLoadFailed: boolean;
}

export interface Audio {
  endTime: number;
  isLoop: boolean;
  resId: string;
  rt_duration: number;
  rt_title: string;
  rt_url: string;
  selfDuration: number;
  selfStartTime: number;
  startTime: number;
  volume: number;
  rt_loadInfo: AssetLoadType;
}

export type Audios = Audio[];

export interface ReplaceClipSvgParams {
  id: string;
  source_key: string;
  source_width: string;
  source_height: string;
}

export interface RGBA {
  r: number;
  g: number;
  b: number;
  a?: number;
}
// 渐变类型
export interface HSVA {
  h: number;
  s: number;
  v: number;
  a?: number;
}

export type DataType =
  | 'Object'
  | 'String'
  | 'Array'
  | 'Number'
  | 'Boolean'
  | 'Symbol'
  | 'Map'
  | 'WeakMap'
  | 'Set'
  | 'WeakSet'
  | 'Undefined'
  | 'Null'
  | 'Date'
  | 'Function'
  | 'BigInt';

export interface ElementStyle {
  height: number;
  width: number;
  top: number;
  left: number;
  rotate: number;
  zIndex: number;
  color?: string;
}

export interface RectLimit {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

export interface PanelBorder {
  x1: number;
  x2: number;
  y1: number;
  y2: number;
}

export interface PanelInfoType {
  scale: number;
  panelBorder: PanelBorder;
}

export interface Position {
  left: number;
  top: number;
}

export interface Coordinate {
  x: number;
  y: number;
}

export interface AssetBaseSize {
  width: number;
  height: number;
}

export interface AssetSizeAndPosition {
  width: number;
  height: number;
  left: number;
  top: number;
  fontSize?: number;
}

export interface CanvasStatus {
  // 是否裁剪中
  inClipping: boolean;
  // 替换中
  inReplacing: boolean;

  // 旋转中
  inRotating: boolean;

  // 移动中
  inMoving: boolean;

  // 视频蒙版是否编辑中
  inMask: boolean;
  // 鼠标的位置信息
  mousePosition: Position;

  // 隐藏选中框
  hideTransformerBox: boolean;

  // 是否显示镜头画布交互内容
  inCamera: boolean;
  // 路径动画的状态 -1: 为处于使用路径动画 0:正在绘制路径点 1:编辑路径点 2:显示路径动画首尾结点编辑
  inAniPath: number;

  // 旋转动画 true：正在设置旋转中心点
  inWhirl: boolean;
}

export interface TemplateBackground {
  backgroundColor: RGBA | GradientType;
  backgroundImage: {
    resId: '';
    rt_imageUrl: '';
    backgroundSize: {
      width: number;
      height: number;
    };
  };
}

export type VideoClip = [number, number];

export interface TemplateVideoInfo {
  startTime: number;
  endTime: number;
  allAnimationTime: number;
  baseTime: number;
  pageTime: number;
  // [开始部分裁剪的长度,结束部分裁剪的长度]
  offsetTime?: VideoClip;
  allAnimationTimeBySpeed: number; // 倍速后的片段时长
  speed?: number; // 视频倍速
}

export type CutInfo = AssetTime;

export interface PageAttr {
  backgroundColor: TemplateBackground['backgroundColor'];
  backgroundImage?: TemplateBackground['backgroundImage'];
  pageInfo: {
    gifInfo: any;
    // 模板的实际播放时长
    pageTime: number;
    // 模板完整播放一次的时长
    baseTime: number;
    offsetTime?: VideoClip;
    rt_preview_image: string;
    rt_preview_video: string;
    tid: string;
    speed?: number;
  };
  sound: {
    list: Audios;
  };
  audios?: MultipleAudioObject;
  aqe?: Array<Array<number>>;
}

export interface EventHooks {
  onChange?: (asset: Asset | Audio | string, needSave?: boolean) => void;
  onError?: (asset: Asset, error?: any) => void;
}

export interface TransformPosition {
  posY: number;
  posX: number;
}

export interface Camera extends TransformPosition {
  width: number;
  height: number;
  startTime: number;
  endTime: number;
  // 速度曲线 暂时没用
  easing: string;
  scale: number;
}
export interface RawTemplateData {
  canvas?: {
    width: number;
    height: number;
    title: string;
  };
  assets: Assets;
  pageAttr: PageAttr;
  templateId?: string;
  poster?: string;
  preview?: string;
  preview_url?: string;
  small_url?: string;
  BGMIndex?: number;
  cameras: Camera[];
}

export interface RawTemplateWithRender {
  canvas?: {
    width: number;
    height: number;
    title: string;
  };
  videoInfo: {
    startTime: number;
    endTime: number;
    allAnimationTime: number;
    allAnimationTimeBySpeed: number;
    speed: number;
    offsetTime?: [number, number];
    pageTime: number;
    baseTime: number;
  };
  id: number;
  assets: AssetWithRender[];
  cameras: Camera[];
  pageAttr: PageAttr;
  templateId?: string;
  poster?: string;
  preview?: string;
  BGMIndex?: number;
}

export interface TemplateData {
  // 本地id，作为模板唯一标识使用
  canvas: {
    width: number;
    height: number;
    title: string;
  };
  id: string;
  assets: Assets;
  pageAttr: PageAttr;
  // 模板id，空白模板不存在该数据
  templateId?: string;
  poster: string;
  BGMIndex?: number;
  videoInfo: TemplateVideoInfo;
  maxZIndex: number;
  minZIndex: number;
  transfer?: Asset;
}

export interface VideoHandler {
  pauseVideo: () => void;
  stopVideo: () => void;
  playVideo: () => void;
  setCurrentTime: (currentTime: number, needFix: boolean) => void;
}

export interface VideoStatusStateHandler {
  videoStatus: VideoStatus;
  setVideoStatus: (data: Partial<VideoStatus>) => void;
  resetVideoStatus: () => void;
  setCurrentTimeRange: (timeRange: number) => void;
}

export interface BaseMultipleAudio {
  resId: string;
  type: 1 | 2; // bgm:1  其他配乐:2
  rt_sourceType: 1 | 2 | 3; // 1-上传，2-AI文字转语音，3-录音;
  // 音频裁剪
  cut?: VideoClip;
  // 用来设置淡入淡出效果，可以冗余
  startEffect?: number;
  endEffect?: number;
  // 音频出入场时间
  startTime: number;
  endTime: number;
  volume: number;
  isLoop: boolean;
  fadeIn?: number; // 淡入持续时长 0-5000
  fadeOut?: number; // 淡出持续时长 0-5000
  rt_duration: number;
  rt_title: string;
  rt_url: string;
  rt_endTime?: number;
  speed?: number;
  // 音频时长
}

export interface MultipleAudio extends BaseMultipleAudio {
  // 本地id，用于数据处理
  rt_id: number;
  // 是否由用户控制持续时间
  rt_isUserControl: boolean;
  // 音频裁剪
  // 用来设置淡入淡出效果，可以冗余
  rt_loadInfo: AssetLoadType;
}

export interface MultipleAudioObject {
  audios: MultipleAudio[];
}

/**
 * 花字 类型
 */
export interface SignatureEffectWord {
  resId: string;
  effect: SignatureEffect | undefined;
}

/**
 * 花字 特效类型
 */
export interface SignatureEffect {
  type: string;
  angle: number;
  left: number;
  top: number;
  left_diff?: number;
  top_diff?: number;
  fontSize: number;
  fills: any[];
  shadow: any[];
  strokes: any[];
  shadowList: any[];
  // 图片资源
  sourceList: any[];
  fillList: any[];
  strokeList: any[];
  // 纯色 关联颜色数组 填充 描边 阴影
  colorIndexLisr: any[];
  supportTexts?: any[];
}

export type AssetDurationParams = AssetTime;

// 添加蒙版参数类型
export interface AddMaskParams {
  meta?: {
    isWatermark?: boolean;
    isClip?: boolean;
  };
  attribute: {
    width: Attribute['width'];
    height: Attribute['height'];
    resId: Attribute['resId'];
    source_key: Attribute['source_key'];
    SVGUrl: Attribute['SVGUrl'];
    rt_svgString: Attribute['rt_svgString'];
  };
  transform?: {
    posX: number;
    posY: number;
  };
}