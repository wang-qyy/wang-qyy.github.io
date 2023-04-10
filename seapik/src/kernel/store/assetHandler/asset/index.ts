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
  SVGStrokes,
  SVGViewBox,
  SVGStretch,
  Container,
  AssetStoreUpdateParams,
  Auxiliary,
  Coordinate,
  AssetWithRender,
  TemplateClass,
  PathItem,
} from '@kernel/typing';
import { calculateAssetPoint } from '@kernel/utils/auxiliaryLineHandler';
import { getDefaultAuxiliary } from '@kernel/store/assetHandler/asset/const';
import {
  assetSizeScale,
  getAssetSizeScale,
  numberFixed,
  positionToCoordinate,
} from '@kernel/utils/StandardizedTools';
import {
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
import { coordinateToPosition } from '@kernel/utils/mouseHandler/mouseHandlerHelper';
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
  get cropPosition() {
    return this.attribute.crop?.position || { x: 0, y: 0 };
  }

  @computed
  get cropPositionScale() {
    const { scale } = getCanvasInfo();

    const { crop } = this.attribute;

    if (crop) {
      const { position } = crop;
      return { x: position.x * scale, y: position.y * scale };
    }

    return { x: 0, y: 0 };
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
  get assetOriginSizeScale() {
    const { crop } = this.attribute;
    if (crop) {
      const { width, height } = crop.size;
      const { scale } = getCanvasInfo();
      return {
        width: width * scale,
        height: height * scale,
      };
    }

    return this.assetSizeScale;
  }

  @computed
  get assetOriginSize() {
    const { crop } = this.attribute;
    if (crop) {
      return crop.size;
    }

    return this.assetSize;
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

    return {
      startTime,
      endTime,
    };
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
      fontFamily,
      fontSizeScale,
      assetDuration,
      id,
      assetTransform,
    } = this;
    const data: Asset = deepCloneJson({
      ...asset,
      id,
      assetTransform,
      assetSize,
      containerSize,
      containerSizeScale,
      assetSizeScale,
      assetPosition,
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
}
