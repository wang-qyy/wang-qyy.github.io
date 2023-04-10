import {
  action,
  autorun,
  computed,
  makeObservable,
  observable,
  reaction,
} from 'mobx';
import type { IObservableArray } from 'mobx';
import {
  AssetClass,
  AssetTempUpdateParams,
  Asset,
  AeA,
  SVGStrokes,
  SVGViewBox,
  SVGStretch,
  Container,
  AssetStoreUpdateParams,
  AeAItem,
  Auxiliary,
  Coordinate,
  AssetTime,
  VideoClip,
  Attribute,
  AssetWithRender,
  TemplateClass,
  PathItem,
} from '@kernel/typing';
import { calculateAssetPoint } from '@kernel/utils/auxiliaryLineHandler';
import {
  AEA_KEYS,
  AEA_TEXT_DURATION,
  ANIMATION_KEYS,
  ANIMATION_TO_AEAKEY,
  getDefaultAuxiliary,
} from '@kernel/store/assetHandler/asset/const';
import {
  assetSizeScale,
  calcAeAFrameToTime,
  calcAssetDurationByAssetTime,
  getAssetAea,
  getAssetSizeScale,
  numberFixed,
  getLimitAeaPbrByTime,
  positionToCoordinate,
} from '@kernel/utils/StandardizedTools';
import {
  isAssetAnimation,
  isImageAsset,
  isMaskType,
  isModuleType,
  isTempModuleType,
} from '@kernel/utils/assetChecker';
import { getFontFamilyByFontName } from '@kernel/utils/defaultConfig';
import {
  buildAssets,
  buildAttribute,
  calcModuleBaseStyle,
  loadAssets,
} from '@kernel/store/assetHandler/utils';
import { isEqual } from 'lodash-es';
import { DEFAULT_FONT_SIZE } from '@kernel/utils/assetHelper/const';
import { newId } from '@kernel/utils/idCreator';
import { getCanvasInfo } from '@kernel/store/global/adapter';
import { deepCloneJson } from '@kernel/utils/single';
import { getRectCenter } from '@kernel/utils/mouseHandler/reactHelper';
import {
  relativeToAbsoluteByModule,
  relativeToAbsoluteByTempModule,
} from '@kernel/store/assetHandler/moduleHelper';
import { isVideoAsset } from '@/kernel/utils/assetChecker';

export default class AssetItemState {
  @observable asset!: Asset;

  @observable id = newId();

  @observable auxiliary = getDefaultAuxiliary();

  @observable.shallow assets: IObservableArray<AssetClass> = observable.array(
    [],
  );

  @observable parent?: AssetClass;

  @observable.shallow tempData: AssetTempUpdateParams = {
    rt_itemScale: 1,
    rt_loading: false,
  };

  @observable.ref template?: TemplateClass;

  @computed
  get attribute() {
    return this.asset.attribute;
  }

  @computed
  get transform() {
    return this.asset.transform;
  }

  @computed
  get meta() {
    return this.asset.meta;
  }

  // 是否拥有所有的动画类型 kw,aeA,animation,
  @computed
  get isAllAnimation() {
    return (
      this.attribute.kw ||
      this.attribute.aeA ||
      this.attribute.animation ||
      this.attribute.rt_previewAeA ||
      this.attribute.stayEffect ||
      this.attribute.bgAnimation ||
      this.attribute.rt_previewAnimation
    );
  }

  @computed
  get isAea() {
    // 预览动画做特殊处理
    if (this.attribute.rt_previewAeA) {
      return true;
    }
    return !isAssetAnimation(this.attribute);
  }

  @computed
  get isAeaText() {
    // 预览动画做特殊处理
    if (this.attribute.aeA) {
      const { aeA } = this.attribute;
      return AEA_KEYS.some((key) => {
        if (aeA[key].kw) {
          return !!aeA[key].kw?.isText;
        }
        return false;
      });
    }
    return false;
  }

  @computed
  get assetTransform() {
    const { rotate = 0, alpha = 100, zindex = 1 } = this.transform || {};
    return {
      rotate,
      opacity: alpha / 100,
      zIndex: zindex * 100,
    };
  }

  @computed
  get assetPosition() {
    const { posY, posX } = this.transform;
    return {
      left: posX,
      top: posY,
    };
  }

  @computed
  get assetAbsolutePosition() {
    const { posY, posX } = this.transform;
    const parentX: number = this.parent?.assetAbsolutePosition.left || 0;
    const parentY: number = this.parent?.assetAbsolutePosition.top || 0;

    return {
      left: posX + parentX,
      top: posY + parentY,
    };
  }

  @computed
  get assetAbsolutePositionScale() {
    if (this.parent && isModuleType(this.parent)) {
      const { scale } = getCanvasInfo();
      const { rotate: pRotate = 0 } = this.parent.transform;
      let moduleCenter: Coordinate | undefined;
      const hasRotate = pRotate % 360 > 0;
      if (hasRotate) {
        moduleCenter = getRectCenter({
          ...this.parent.assetSize,
          ...this.parent.assetPosition,
        });
      }
      const {
        posY = 0,
        posX = 0,
        rotate = 0,
      } = relativeToAbsoluteByTempModule(
        this,
        this.parent,
        moduleCenter,
        false,
      );
      return {
        left: posX * scale,
        top: posY * scale,
        rotate,
      };
    }
    return {
      ...this.assetPositionScale,
      rotate: this.transform.rotate,
    };
  }

  @computed
  get assetPositionScale() {
    const { scale } = getCanvasInfo();
    const { left, top } = this.assetPosition;
    return {
      left: left * scale,
      top: top * scale,
    };
  }

  @computed
  get assetSize() {
    const { width, height } = this.attribute;
    return {
      width,
      height,
    };
  }

  @computed
  get assetSizeScale() {
    const { width, height } = this.assetSize;
    const { scale } = getCanvasInfo();
    return {
      width: width * scale,
      height: height * scale,
    };
  }

  @computed
  get containerSize() {
    const { attribute } = this.asset;
    const { container } = attribute;
    if (isImageAsset(this) && container?.id) {
      const { width = 0, height = 0 } = container;
      return {
        width,
        height,
      };
    }
    return this.assetSize;
  }

  @computed
  get containerSizeScale() {
    const { scale } = getCanvasInfo();
    const { width, height } = this.containerSize;
    return {
      width: width * scale,
      height: height * scale,
    };
  }

  @computed
  get animationItemPbr() {
    // 动画的持续时间
    const pbr: Record<keyof AeA, number> = {
      i: 1,
      s: 1,
      o: 1,
    };
    const { aeA } = this.attribute;
    AEA_KEYS.forEach((key) => {
      pbr[key] = aeA?.[key].pbr ?? 1;
    });

    return pbr;
  }

  @computed
  get animationItemPbrWithRealData() {
    // 动画的持续时间
    const pbr: Record<keyof AeA, number> = {
      i: 0,
      s: 0,
      o: 0,
    };
    const { aeA } = this.attribute;
    if (aeA) {
      AEA_KEYS.forEach((key) => {
        const item = aeA[key];
        if (item.kw && item.pbr) {
          pbr[key] = item.pbr ?? 1;
        }
      });
    }

    return pbr;
  }

  @computed
  get animationItemDuration() {
    // 动画的持续时间
    const duration: Record<keyof AeA, number> = {
      i: 0,
      s: 0,
      o: 0,
    };
    const { animation, aeA, stayEffect, endTime, startTime } = this.attribute;
    if (this.isAea) {
      if (aeA) {
        AEA_KEYS.forEach((key) => {
          const item = aeA[key];
          if (item.kw && item.pbr) {
            if (item.kw.isText) {
              duration[key] = AEA_TEXT_DURATION / item.pbr;
            } else {
              duration[key] = calcAeAFrameToTime(item.kw, item.pbr);
            }
          }
        });
      }
    } else {
      if (animation) {
        ANIMATION_KEYS.forEach((key) => {
          const item = animation[key];
          if (item && item.baseId > 0 && item.duration) {
            const aeaKey = ANIMATION_TO_AEAKEY[key];
            duration[aeaKey] = item.duration;
            if (aeA?.[aeaKey]?.pbr) {
              // 兼容旧版动画逻辑，可能存在旧版动画设置了动画倍速的情况
              duration[aeaKey] *= aeA[aeaKey].pbr;
            }
          }
        });
      }
    }
    // 如果是停留特效 停留总时长=endTime-startTime
    if (stayEffect) {
      duration.s = endTime - startTime;
    }
    return duration;
  }

  @computed
  get previewFrame() {
    if (isModuleType(this)) {
      let time = -1;
      this.assets.forEach((item) => {
        const { startTime } = item.attribute;
        if (time === -1 || startTime > time) {
          time = startTime + 10;
        }
      });
      return time;
    }
    return this.attribute.startTime;
  }

  @computed
  get minAssetDuration(): number {
    if (isModuleType(this)) {
      let target: AssetClass | undefined;
      this.assets.forEach((item) => {
        if (!target || item.minAssetDuration < target.minAssetDuration) {
          target = item;
        }
      });
      const rst = target!.assetDuration.startTime - this.attribute.startTime;
      const ret = this.attribute.endTime - target!.assetDuration.endTime;
      return target!.minAssetDuration + rst + ret;
    }
    const { o, i } = this.animationItemDuration;

    return 100 + o + i;
  }

  @computed
  get fontFamily() {
    const { fontFamily } = this.attribute;
    if (fontFamily) {
      return getFontFamilyByFontName(fontFamily);
    }
    return '';
  }

  @computed
  get fontSizeScale() {
    // 启用字体缩放方案，需要计算出字体的缩放比
    const { fontSize } = this.attribute;
    if (fontSize) {
      return fontSize / DEFAULT_FONT_SIZE;
    }
    return 1;
  }

  @computed
  get assetDuration() {
    const { startTime, endTime } = this.attribute;
    const { i, o } = this.animationItemDuration;
    if (this.isAea) {
      return {
        startTime: startTime - i,
        endTime: endTime + o,
      };
    }
    return {
      startTime: startTime - i,
      endTime,
    };
  }

  @computed
  get videoClip() {
    const target = (
      isMaskType(this) && this.assets[0] ? this.assets[0] : this
    ) as AssetClass;

    if (isVideoAsset(target)) {
      const { startTime, endTime } = this.assetDuration;
      const { rt_total_time } = target.attribute;
      const { cst = 0, cet = Math.min(endTime - startTime, rt_total_time) } =
        target.attribute;

      return { cst, cet, totalTime: rt_total_time };
    }

    return { cst: 0, cet: 0 };
  }

  @computed
  get assetDurationWithOffset() {
    if (this.template) {
      let { startTime, endTime } = this.assetDuration;
      const { pageTime, offsetTime: [cs, ce] = [0, 0] } =
        this.template.videoInfo;
      if (startTime < cs) {
        startTime = cs;
      }
      const pageEnd = pageTime - ce;
      if (endTime > pageEnd) {
        endTime = pageEnd;
      }
      return {
        startTime: startTime - cs,
        endTime: endTime - cs,
      };
    }
    return this.assetDuration;
  }

  constructor(asset: Asset, parent?: AssetClass) {
    this.replaceAssetSelf(asset);
    this.parent = parent;

    this._autoRunAuxiliary();
    this._reactionClearRtRelativeByParent();
    makeObservable(this);
  }

  /**
   * @description 自动更新辅助线数据
   */
  _autoRunAuxiliary = () => {
    autorun(
      () => {
        // 存在父元素不需要更新最新数据，否则会导致父元素尺寸计算错误
        if (isModuleType(this.parent) || isMaskType(this.parent)) {
          return;
        }
        this.autoUpdateAuxiliary();
      },
      { delay: 100 },
    );
  };

  autoUpdateAuxiliary = () => {
    if (!this) {
      return;
    }
    const { rotate } = this.assetTransform;
    this.setAuxiliary(
      calculateAssetPoint(
        this.containerSizeScale,
        positionToCoordinate(this.assetPositionScale),
        rotate,
      ),
    );
  };

  /**
   * @description 没有父元素的时候，自动清除相关的rt属性
   */
  _reactionClearRtRelativeByParent = () => {
    reaction(
      () => this.parent,
      (value) => {
        if (!value) {
          this.setRtRelativeByParent();
        }
      },
    );
  };

  /**
   * @description 根据数据载入子元素，会根据数据实例化子元素
   * @param assetList
   * @param autoSetChildrenRtRelative
   */
  @action
  buildAssets = (assetList: Asset[], autoSetChildrenRtRelative = false) => {
    this.assets.replace(buildAssets(assetList, this));
    loadAssets(this.assets);
    if (autoSetChildrenRtRelative && (isModuleType(this) || isMaskType(this))) {
      const { startTime, endTime } = this.assetDuration;
      this.assets.forEach((asset) => {
        if (isMaskType(this)) {
          // 如果蒙版子图层startTime！=蒙版startTime-i或者endTime！=蒙版startTime+o
          if (
            asset.attribute.startTime !== startTime ||
            asset.attribute.endTime
          ) {
            asset.update(
              buildAttribute({
                startTime,
                endTime,
              }),
            );
          }
        }

        asset.setRtRelativeByParent();
      });
    }
  };

  /**
   * @description 设置元素所属的asset信息
   * @param template
   */
  @action
  setTemplatePoint(template: TemplateClass) {
    if (this.template !== template) {
      this.template = template;
    }
  }

  /**
   * @description 硬性载入子元素，不会走资源确认添加逻辑
   * @param assets
   * @param autoSetChildrenParent
   */
  @action
  setChildren = (assets: AssetClass[], autoSetChildrenParent = true) => {
    this.assets.replace(assets);
    if (autoSetChildrenParent) {
      assets.forEach((asset) => {
        asset.setParent(this);
        if (isModuleType(this) || isMaskType(this)) {
          asset.setRtRelativeByParent();
        }
      });
    }
  };

  @action
  setParent = (parent?: AssetClass) => {
    this.parent = parent;
  };

  @action
  replaceChild = (asset: Asset, index: number) => {
    this.assets.splice(index, 1, new AssetItemState(asset, this));
  };

  @action
  replaceAssetSelf = (asset: Asset) => {
    const { meta, attribute, transform } = asset;
    this.asset = {
      meta: {
        ...meta,
        id: this.id,
      },
      attribute,
      transform,
      assets: [],
    };
    if (isMaskType(this.parent)) {
      this.setRtRelativeByParent();
    }
    this.autoUpdateAuxiliary();
    if (asset.assets && asset.assets.length) {
      this.buildAssets(asset.assets, true);
    } else {
      this.assets.clear();
    }
  };

  @action
  restore = (asset: AssetWithRender) => {
    const { meta, transform, attribute, assets = [] } = asset;
    Object.assign(this.asset, {
      meta: deepCloneJson(meta),
      transform: deepCloneJson(transform),
      attribute: deepCloneJson(attribute),
    });

    const newAssets: AssetClass[] = [];
    assets.forEach((item) => {
      const target = this.assets.find((i) => i.id === item.id);
      if (target) {
        target.restore(item);
        newAssets.push(target);
      } else {
        const newAsset = new AssetItemState(
          {
            meta: deepCloneJson(item.meta),
            transform: deepCloneJson(item.transform),
            attribute: deepCloneJson(item.attribute),
            assets: item.assets,
          },
          this,
        );
        newAssets.push(newAsset);
      }
    });
    if (newAssets.length) {
      this.assets.replace(newAssets);
    }
  };

  @action
  setAuxiliary = (auxiliary: Auxiliary) => {
    this.auxiliary = auxiliary;
  };

  @action
  setTempData = (data: Partial<AssetTempUpdateParams>) => {
    Object.assign(this.tempData, data);
  };

  scaleSvgPath = (
    pathItems: PathItem[] | undefined,
    scaleX: number,
    scaleY: number,
  ) => {
    if (!pathItems) return;
    pathItems.forEach((item) => {
      const { start, startControl, end, endControl } = item;
      item.start = [start[0] * scaleX, start[1] * scaleY];
      item.end = [end[0] * scaleX, end[1] * scaleY];
      startControl &&
        (item.startControl = [
          startControl[0] * scaleX,
          startControl[1] * scaleY,
        ]);
      endControl &&
        (item.endControl = [endControl[0] * scaleX, endControl[1] * scaleY]);
    });
  };

  @action
  update = (data: AssetStoreUpdateParams, autoSetChildren = true) => {
    const target = this.asset;
    const {
      attribute: { svgInfo, width, height },
    } = target;
    const pathItems = svgInfo?.pathItems;

    if (data.tempData) {
      Object.assign(this.tempData, data.tempData);
    }
    // if (data.filters) {
    //   target.attribute.filters = { ...data.filters };
    // }
    if (data.meta) {
      Object.assign(target.meta, data.meta);
    }
    if (data.attribute) {
      if (data.attribute.width || data.attribute.height) {
        this.scaleSvgPath(
          pathItems,
          (data.attribute.width || width) / width,
          (data.attribute.height || height) / height,
        );
      }
      if (data.attribute.width) {
        data.attribute.width = numberFixed(data.attribute.width);
      }
      if (data.attribute.height) {
        data.attribute.height = numberFixed(data.attribute.height);
      }
      if (data.attribute.fontSize) {
        data.attribute.fontSize = numberFixed(data.attribute.fontSize);
      }
      Object.assign(target.attribute, data.attribute);
    }
    if (data.transform) {
      if (data.transform.posX) {
        data.transform.posX = numberFixed(data.transform.posX);
      }
      if (data.transform.posY) {
        data.transform.posY = numberFixed(data.transform.posY);
      }
      Object.assign(target.transform, data.transform);
    }

    if (autoSetChildren && (data.attribute || data.transform)) {
      this.autoCalcChildrenStyle();
    }
  };

  @action
  updateContainer = (payload: Partial<Container>) => {
    const { container } = this.attribute;
    if (container) {
      this.asset.attribute.container = {
        ...container,
        ...payload,
      };
    }
  };

  @action
  updateAeaItem = (payload: { key: keyof AeA; data: AeAItem }[]) => {
    const prevAssetDuration = { ...this.assetDuration };
    if (this.attribute.animation) {
      this.attribute.animation = undefined;
    }
    if (this.attribute.kw) {
      this.attribute.kw = undefined;
    }
    // 进出场动画  目前无法兼容停留特效
    if (this.attribute.stayEffect) {
      this.attribute.stayEffect = undefined;
    }
    if (!this.attribute.aeA) {
      this.attribute.aeA = getAssetAea();
    }
    const { aeA } = this.attribute;
    payload.forEach((item) => {
      const { key, data } = item;
      if (aeA?.[key]) {
        aeA[key] = data;
      }
    });
    this.autoUpdateAssetTime(prevAssetDuration);
  };

  @action
  autoUpdateAssetTime = (prevAssetDuration: AssetTime) => {
    const { startTime, endTime } = prevAssetDuration;
    const { i, o } = this.animationItemDuration;
    const newStartTime = startTime + i;
    let newEndTime = endTime - o;
    // 元素最小持续时间100
    if (newEndTime - newStartTime < 100) {
      newEndTime = newStartTime + 100;
    }
    Object.assign(this.attribute, {
      startTime: newStartTime,
      endTime: newEndTime,
    });
    const duration = newEndTime - newStartTime;
    // 当停留动画的时长大于当前图层的停留时长时 要重置停留动画的时间
    if (
      this.attribute.stayEffect &&
      duration < this.attribute.stayEffect.duration
    ) {
      Object.assign(this.attribute, {
        stayEffect: {
          ...this.attribute.stayEffect,
          duration: newEndTime - newStartTime,
        },
      });
    }
  };

  /**
   * @description 根据父元素，计算子元素的样式属性
   */
  autoCalcChildrenStyle = () => {
    if (this.assets.length) {
      const { rotate: pRotate = 0 } = this.transform;
      let moduleCenter: Coordinate | undefined;
      const hasRotate = pRotate % 360 > 0;
      if (hasRotate) {
        moduleCenter = getRectCenter({
          ...this.assetSize,
          ...this.assetPosition,
        });
      }
      const moduleSize = { ...this.assetSize };
      this.assets.forEach((asset) => {
        const {
          rt_relativeSizeRatio = { width: 1, height: 1 },
          rt_relativeFontSizeRatio = 1,
          rt_relativeLetterSpacingRatio = 1,
        } = asset.tempData;
        const newData: AssetStoreUpdateParams = {
          attribute: assetSizeScale(moduleSize, rt_relativeSizeRatio),
          transform: {},
        };

        if (asset.attribute.fontSize) {
          newData.attribute!.fontSize =
            moduleSize.width * rt_relativeFontSizeRatio;
        }
        if (asset.attribute.letterSpacing) {
          newData.attribute!.letterSpacing =
            moduleSize.width * rt_relativeLetterSpacingRatio;
        }
        // 如果是tempModule，需要额外处理相对数据转化为绝对数据的逻辑
        if (isTempModuleType(this)) {
          const result = relativeToAbsoluteByTempModule(
            asset,
            this,
            moduleCenter,
          );
          Object.assign(newData.transform, result);
        } else {
          const result = relativeToAbsoluteByModule(asset, this);
          Object.assign(newData.transform, result);
        }
        asset.update(newData);
      });
    }
  };

  /**
   * @description 在设置父元素的时候，把子元素相对于父元素的位置信息存储起来
   */
  setRtRelativeByParent = () => {
    const tempData: AssetTempUpdateParams = {};

    if (this.parent) {
      const { assetPosition, containerSize } = this.parent;
      if (isTempModuleType(this.parent)) {
        tempData.rt_relative = {
          ...this.transform,
          posX:
            (this.assetPosition.left - assetPosition.left) /
            containerSize.width,
          posY:
            (this.assetPosition.top - assetPosition.top) / containerSize.height,
        };
      } else {
        tempData.rt_relative = {
          ...this.transform,
          posX: this.assetPosition.left / containerSize.width,
          posY: this.assetPosition.top / containerSize.height,
        };
      }

      tempData.rt_relativeSizeRatio = getAssetSizeScale(
        this.parent.assetSize,
        this.containerSize,
      );
      tempData.rt_relativeFontSizeRatio =
        (this.attribute.fontSize || 0) / this.parent.assetSize.width;
      tempData.rt_relativeLetterSpacingRatio =
        (this.attribute.letterSpacing || 0) / this.parent.assetSize.width;
    } else {
      tempData.rt_relativeSizeRatio = undefined;
      tempData.rt_relativeFontSizeRatio = undefined;
      tempData.rt_relativeLetterSpacingRatio = undefined;
      tempData.rt_relative = undefined;
    }

    this.setTempData(tempData);
  };

  /**
   * @description 根据子元素计算自身的宽高
   */
  @action
  setModuleStyleByChildren = () => {
    const { width, height, left, top, zIndex, assetTime } = calcModuleBaseStyle(
      this.assets,
    );
    Object.assign(this.asset.attribute, {
      width,
      height,
      ...assetTime,
    });
    Object.assign(this.asset.transform, {
      posX: left,
      posY: top,
      rotate: 0,
      zindex: zIndex,
    });
  };

  /**
   * @description 获取元素的深克隆数据
   */
  getAssetCloned = () => {
    const data: Asset = {
      ...deepCloneJson(this.asset),
    };
    if (this.assets.length) {
      data.assets = this.assets.map((asset) => {
        return asset.getAssetCloned();
      });
    } else {
      delete data.assets;
    }
    return data;
  };

  /**
   * @description 获取元素的深克隆数据
   */
  getAssetClonedWithRender = () => {
    const {
      asset,
      assetSize,
      containerSize,
      containerSizeScale,
      assetSizeScale,
      assetPosition,
      animationItemPbr,
      animationItemDuration,
      fontFamily,
      fontSizeScale,
      assetDuration,
      isAea,
      id,
      assetTransform,
    } = this;
    const data: Asset = deepCloneJson({
      ...asset,
      id,
      isAea,
      assetTransform,
      assetSize,
      containerSize,
      containerSizeScale,
      assetSizeScale,
      assetPosition,
      animationItemPbr,
      animationItemDuration,
      fontFamily,
      fontSizeScale,
      assetDuration,
    });
    if (this.assets.length) {
      data.assets = this.assets.map((asset) => {
        return asset.getAssetClonedWithRender();
      });
    } else {
      delete data.assets;
    }
    return data;
  };

  /** @description ae动画逻辑 */
  @action
  deletePreviewAEAKw = () => {
    this.asset.attribute.rt_previewAeA = undefined;
  };

  /* ae动画逻辑 */

  /** @description 旧版裁剪逻辑 */
  /**
   * @description 替换裁剪形状
   * @param svgString
   */
  replaceContainerSVG = (svgString: string) => {
    this.updateContainer({ rt_svgString: svgString });
  };

  /**
   * @description 更新元素的viewBox
   * @param viewBox
   */
  setContainerViewBox = (viewBox: SVGViewBox) => {
    const currentContainer = this.attribute.container as Container;

    const newData = {
      viewBoxWidth: currentContainer.width,
      viewBoxHeight: currentContainer.height,
      viewBoxWidthBack: parseInt(viewBox.width, 10),
      viewBoxHeightBack: parseInt(viewBox.height, 10),
    };

    if (!isEqual({ ...currentContainer, ...newData }, currentContainer)) {
      this.updateContainer({
        viewBoxWidth: currentContainer.width,
        viewBoxHeight: currentContainer.height,
        viewBoxWidthBack: parseInt(viewBox.width, 10),
        viewBoxHeightBack: parseInt(viewBox.height, 10),
      });
    }

    if (!isEqual(this.attribute.viewBox, viewBox)) {
      this.update(
        buildAttribute({
          viewBox,
        }),
      );
    }
  };

  /**
   * @description 给裁剪元素设置viewBox
   */
  setContainerViewBoxInClip = () => {
    const currentContainer = this.attribute.container as Container;

    this.updateContainer({
      viewBoxWidth: currentContainer.width,
      viewBoxHeight: currentContainer.height,
      viewBoxWidthBack: currentContainer.viewBoxWidth,
      viewBoxHeightBack: currentContainer.viewBoxHeight,
    });
  };
  /* 旧版裁剪逻辑 */

  /** @description 文字元素逻辑 */
  /**
   * @description lottie文字支持的方法，暂时无用
   * @param textEditor
   */
  setTextEditor = (textEditor: any) => {
    const data = buildAttribute({
      textEditor: [textEditor],
    });
    this.update(data);
  };
  /* 文字元素逻辑 */

  /** @description svg逻辑 */
  replaceSVG = (picUrl: string) => {
    const { asset } = this;
    if (asset?.attribute.picUrl !== picUrl) {
      const data = buildAttribute({
        picUrl,
      });
      this.update(data);
    }
  };

  setSVGViewBox = (viewBox: SVGViewBox) => {
    const { attribute } = this.asset ?? {};
    if (attribute) {
      if (!isEqual(attribute.viewBox, viewBox)) {
        const data = buildAttribute({
          viewBox,
        });
        this.update(data);
      }
    }
  };

  setSVGString = (svgString: string) => {
    const { attribute } = this.asset ?? {};
    if (attribute) {
      if (!isEqual(attribute.picUrl, svgString)) {
        const data = buildAttribute({
          rt_svgString: svgString,
        });
        this.update(data);
      }
    }
  };

  setSVGColors = (colors: any) => {
    const { attribute } = this.asset ?? {};
    if (attribute) {
      if (!isEqual(attribute.colors, colors)) {
        const data = buildAttribute({
          colors,
        });
        this.update(data);
      }
    }
  };

  setSVGRtAttribute(rt_attribute: any) {
    const { rt_attribute: rt_attribute2 } = this.tempData ?? {};
    if (rt_attribute) {
      if (!isEqual(rt_attribute2, rt_attribute)) {
        this.update({ rt_attribute });
      }
    }
  }

  setSVGStrokes = (svgStrokes: SVGStrokes) => {
    const { attribute } = this.asset ?? {};
    if (attribute) {
      if (!isEqual(attribute.svgStrokes, svgStrokes)) {
        const data = buildAttribute({
          svgStrokes,
        });
        this.update(data);
      }
    }
  };

  setSVGStretch = (svgStretch: SVGStretch) => {
    const { attribute } = this.asset ?? {};
    if (attribute) {
      if (!isEqual(attribute.svgStretch, svgStretch)) {
        const data = buildAttribute({
          svgStretch,
        });
        this.update(data);
      }
    }
  };

  /** @description svg逻辑 */

  /** @description 修改时间的逻辑 */
  updateAssetChildrenDuration(
    duration: AssetTime,
    oldDuration: AssetTime,
    offsetTime: VideoClip = [0, 0],
  ) {
    const [cs, ce] = offsetTime;
    const { assetDuration, assets } = this;
    const newTime = {
      startTime: duration.startTime + cs,
      endTime: duration.endTime + cs,
    };
    const ratio =
      calcAssetDurationByAssetTime(duration) /
      calcAssetDurationByAssetTime(oldDuration);

    assets.forEach((item) => {
      const { startTime = 0, endTime = 0 } = item.assetDuration;
      const relativeStartTime = (startTime - assetDuration.startTime) * ratio;
      const relativeEndTime = (assetDuration.endTime - endTime) * ratio;

      const { i, o } = item.animationItemDuration;
      const updateData: Partial<Attribute> = {
        startTime: newTime.startTime + i + relativeStartTime,
        endTime: newTime.endTime - o - relativeEndTime,
      };
      if (isMaskType(item)) {
        const child = item.assets[0];
        child.update({
          attribute: duration,
        });
      }

      item.update({
        attribute: updateData,
      });
    });
  }

  updateAssetDuration(duration: AssetTime, offsetTime: VideoClip = [0, 0]) {
    const [cs] = offsetTime;
    const { animationItemDuration, assetDuration } = this;

    const newTime = {
      startTime: duration.startTime + cs,
      endTime: duration.endTime + cs,
    };
    /**
     // 旧版动画设置逻辑不需要考虑动画时间问题
     if (!this.isAea) {
      this.update({
        attribute: newTime,
      });
      return;
    }
     const newDuration = calcAssetDurationByAssetTime(newTime);

     const { i, o } = animationItemDuration;

     // duration低于该值，需要缩放动画时长，高于该值，则只调整stay time
     const scaleLimit = i + o + 100;
     const updateData: Partial<Attribute> = {};
     if (newDuration < scaleLimit) {
      const aeA = deepCloneJson(attribute.aeA);
      // 动画设定的有效值，也就是元素总时长-100元素的最小持续时间
      let newI = i;
      let newO = o;
      const valid = (newDuration - 100) / 2;
      if (newI > valid && aeA?.i.kw) {
        aeA.i.pbr = Math.min(getLimitAeaPbrByTime(valid, aeA.i.kw), 0.5);
        newI = calcAeAFrameToTime(aeA.i.kw, aeA.i.pbr);
      }
      if (newO > valid && aeA?.o.kw) {
        aeA.o.pbr = Math.min(getLimitAeaPbrByTime(valid, aeA.o.kw), 0.5);
        newO = calcAeAFrameToTime(aeA.o.kw, aeA.o.pbr);
      }

      updateData.aeA = aeA;
      updateData.startTime = startTime + calcAeAFrameToTime(aeA?.i.kw, newI);
      updateData.endTime = endTime - calcAeAFrameToTime(aeA?.o.kw, newO);
    } else {
      updateData.startTime = newTime.startTime + i;
      updateData.endTime = newTime.endTime - o;
    }
     */
    const { i, o } = animationItemDuration;

    if (this.isAea) {
      newTime.startTime += i;
      newTime.endTime -= o;
    } else {
      // 旧版动画结束时间与元素实际结束时间重合，所以不需要单独处理
      newTime.startTime += i;
    }
    if (isModuleType(this)) {
      this.updateAssetChildrenDuration(duration, assetDuration, offsetTime);
    } else if (isMaskType(this)) {
      if (this.assets.length) {
        const child = this.assets[0];
        child.update({
          attribute: {
            ...duration,
            aeA: undefined,
            animation: undefined,
          },
        });
      }
    }
    // 停留特效  停留时间最大等于元素停留时长

    if (this.attribute?.stayEffect) {
      this.update(
        buildAttribute({
          stayEffect: {
            ...this.attribute?.stayEffect,

            duration: Math.min(
              newTime.endTime - newTime.startTime,

              this.attribute?.stayEffect.duration,
            ),
          },
        }),
      );
    }
    this.update({
      attribute: newTime,
    });
  }

  /**
   * @description 设置元素时间（视频元素同时更新裁剪参数）
   */
  setAssetDuration(change: [number, number]) {
    const targetAsset =
      isMaskType(this) && this.assets.length ? this.assets[0] : this;

    const [start, end] = change;
    let { startTime, endTime } = this.assetDuration;

    startTime += start;
    endTime += end;
    // 设置视频元素的裁剪参数
    const isVideo = isVideoAsset(targetAsset);
    if (isVideo) {
      let { cst = 0 } = targetAsset.attribute;
      cst += start;

      targetAsset.update({
        attribute: { cst, cet: cst + (endTime - startTime) },
      });
    }

    this.updateAssetDuration({ startTime, endTime });
  }
}
