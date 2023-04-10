import {
  action,
  computed,
  makeObservable,
  observable,
  reaction,
  toJS,
} from 'mobx';
import type { IObservableArray } from 'mobx';
import type { Asset } from '@kernel/typing';
import { isEqual } from 'lodash-es';
import { AssetIndex } from '@/kernel/typing';
import TemplateState from '@kernel/store/assetHandler/template';
import {
  DEFAULT_BACKGROUND,
  DEFAULT_VIDEO_INFO,
} from '@kernel/store/assetHandler/const';
import {
  CanvasStatus,
  RawTemplateData,
  AssetClass,
  TemplateClass,
  LogoAsset,
  LogoType,
  RawTemplateWithRender,
} from '@kernel/typing';
import AssetItemState from '@kernel/store/assetHandler/asset';
import { deepCloneJson } from '@kernel/utils/single';
import { getAssetIndexById, getTargetAsset, getTargetAssetById } from './utils';
import CameraState from './template/camera';

class AssetHandler {
  @observable.shallow templates: IObservableArray<TemplateClass> =
    observable.array([]);

  @observable reloadMarker = 0;

  @observable replaceTemplateLoading = false;

  @observable currentTemplateIndex = -1;

  // 辅助线命中的元素索引
  @observable auxiliaryTargetIndex: number[] = observable.array([]);

  // 高亮元素
  @observable highlightAssets: AssetClass[] = observable.array([]);

  // 所有元素中，层级高的zIndex
  @observable maxZIndex = 0;

  // 编辑选中，包括移动，变形
  @observable active?: AssetClass;

  // 编辑选中，包括移动，变形
  @observable moduleItemActive?: AssetClass;

  // hover选中
  @observable hoverActive?: AssetClass;

  // 移动选中
  @observable moveActive?: AssetClass;

  // 文字编辑
  @observable textEditActive?: AssetClass;

  @observable logoAsset: LogoAsset = { text: undefined, image: undefined };

  @observable assetId = -1;

  // 蒙版中移动的元素
  @observable moveActiveMask?: AssetClass;

  // 编辑中的镜头
  @observable editCamera?: CameraState;

  @observable status = {
    // 是否裁剪中
    inClipping: false,
    // 替换中
    inReplacing: false,

    // 旋转中
    inRotating: false,

    // 移动中
    inMoving: false,

    // 视频蒙版是否编辑中
    inMask: false,

    // 隐藏选中框  应用场景：调整文字背景圆角
    hideTransformerBox: false,

    // 鼠标的位置信息
    mousePosition: { left: 0, top: 0 },

    // 路径动画的状态 -1: 为处于使用路径动画 0:正在绘制路径点 1:编辑路径点 2:展现首尾数据
    inAniPath: -1,

    // 旋转动画 true：正在设置旋转中心点
    inWhirl: false,
    // 是否显示镜头画布交互内容
    inCamera: false,
  };

  /**
   * 违规图层数据
   */
  @observable lllegelAssets = [];

  /**
   * @description 自动清楚loading状态
   */
  _reactionAutoRemoveLoading = () => {
    reaction(
      () => this.currentAsset,
      (current, prev) => {
        if (!current) {
          prev?.setTempData({
            rt_loading: false,
          });
        }
      },
    );
  };

  constructor() {
    makeObservable(this);
    // this._reactionAutoRemoveLoading()
  }

  @computed
  get currentTemplate() {
    return [...this.templates][this.currentTemplateIndex];
  }

  @computed
  get currentAsset() {
    return this.moduleItemActive || this.active;
  }

  @computed
  get currentCamera() {
    return this.editCamera;
  }

  @computed
  get assets() {
    return this.currentTemplate?.assets || [];
  }

  @computed
  get currentTemplateBackground() {
    if (this.currentTemplate) {
      return this.currentTemplate.background;
    }
    return DEFAULT_BACKGROUND;
  }

  @computed
  get currentTemplateVideoInfo() {
    if (this.currentTemplate) {
      const { videoInfo } = this.currentTemplate;
      return videoInfo;
    }

    return DEFAULT_VIDEO_INFO;
  }

  @computed
  get allTemplateVideoTime() {
    let time = 0;
    this.templates.forEach(item => {
      time += Number(item.videoInfo.allAnimationTimeBySpeed);
    });
    return time;
  }

  @computed
  get assetLoaded() {
    if (this.assets) {
      // return this.assets.every(item => item.rt_assetLoadComplete);
    }
    return true;
  }

  @computed
  get watermark() {
    let watermark;

    if (this.assets) {
      watermark = this.assets.find(
        item => item.meta.isWatermark && !item.meta.hidden,
      );
    }
    return watermark;
  }

  @computed
  get logo() {
    let logo;

    if (this.assets) {
      logo = this.assets.find(item => item.meta.isLogo && !item.meta.hidden);
    }
    return logo;
  }

  @computed
  get timeScale() {
    const timeScale = [];
    let startTimeMark = 0;
    // eslint-disable-next-line no-restricted-syntax
    for (const item of this.templates) {
      const { allAnimationTime, allAnimationTimeBySpeed } = item.videoInfo;
      const endTime = startTimeMark + allAnimationTimeBySpeed;
      timeScale.push([startTimeMark, endTime]);
      startTimeMark = endTime;
    }
    return timeScale;
  }

  @action
  setStatus = (data: Partial<CanvasStatus>) => {
    Object.assign(this.status, data);
  };

  @action
  clearAllActive = () => {
    this.assetId = -1;
    this.active = undefined;
    this.textEditActive = undefined;
    this.moveActive = undefined;
    this.hoverActive = undefined;
  };

  @action
  initTemplateStatus = () => {
    this.clearAllActive();
    this.auxiliaryTargetIndex = [];
    this.reloadMarker += 1;
  };

  @action
  setAuxiliaryTargetIndex = (indexList: number[]) => {
    if (!isEqual(this.auxiliaryTargetIndex, indexList)) {
      this.auxiliaryTargetIndex = indexList;
    }
  };

  @action
  setEditActive = (active: AssetClass | undefined) => {
    this.active = active;
    // 如果包含路径动画，开启显示
    if (active?.attribute.stayEffect?.graph) {
      this.status.inAniPath = 2;
    }
  };

  @action
  setModuleItemActive = (active: AssetClass | undefined) => {
    this.moduleItemActive = active;
  };

  @action
  setTextEditActive = (active: AssetClass | undefined) => {
    this.textEditActive = active;
  };

  @action
  setHoverActive = (active: AssetClass | undefined) => {
    this.hoverActive = active;
  };

  @action
  setMoveActive = (active: AssetClass | undefined) => {
    this.moveActive = active;
  };

  @action
  setMoveActiveMask = (active: AssetClass | undefined) => {
    this.moveActiveMask = active;
  };

  @action
  seteditCamera = (active: CameraState | undefined) => {
    this.editCamera = active;
  };

  getAssetIndexById = (assetId: number, templateIndex?: number) => {
    return getAssetIndexById(assetId, templateIndex);
  };

  getTargetAsset = (index: AssetIndex, templateIndex?: number) => {
    return getTargetAsset(index, templateIndex);
  };

  getTargetAssetById = (assetId: number, templateIndex?: number) => {
    return getTargetAssetById(assetId, templateIndex);
  };

  @action
  setHighlightAssets = (assets: AssetClass[]) => {
    this.highlightAssets = assets;
  };

  @action
  setCurrentTemplate = (index: number) => {
    this.currentTemplateIndex = index;
  };

  @action
  setReplaceTemplateLoading = (loading: boolean) => {
    this.replaceTemplateLoading = loading;
  };

  @action
  addTemplate = (templates: RawTemplateData[], index = -1) => {
    this.initTemplateStatus();
    let target = index;
    templates.forEach(item => {
      if (target > -1) {
        // 如果存在指定添加位置，则需要通过插入的方式添加，每次插入，需要将索引指针向后移位
        this.templates.splice(target, 0, new TemplateState(item));
        target += 1;
      } else {
        this.templates.push(new TemplateState(item));
      }
    });
    if (index > -1) {
      return index;
    }
    return this.templates.length - 1;
  };

  @action
  addTemplateClass = (templates: TemplateClass[], index = -1) => {
    this.initTemplateStatus();
    const target = index;

    if (index > -1) {
      this.templates.splice(target, 0, ...templates);
      return index;
    }

    this.templates.push(...templates);

    return this.templates.length - 1;
  };

  @action
  removeTemplate = (index: number) => {
    if (index > -1) {
      this.templates.splice(index, 1);
    }
  };

  @action
  replaceTemplate = (index: number, data: RawTemplateData) => {
    if (index > -1) {
      this.templates.splice(index, 1, new TemplateState(data));
    }
  };

  @action
  replaceAllTemplate = (data: RawTemplateData[]) => {
    this.clearAllActive();
    this.templates.clear();
    this.addTemplate(data);

    return 0;
  };

  @action
  restoreAllTemplate = (data: RawTemplateWithRender[]) => {
    const newTemplate: TemplateClass[] = [];
    data.forEach(template => {
      const target = this.templates.find(i => i.id === template.id);
      if (target) {
        target.restore(template);
        newTemplate.push(target);
      } else {
        const newAsset = deepCloneJson(template);
        newTemplate.push(new TemplateState(newAsset));
      }
    });
    if (newTemplate.length) {
      this.templates.replace(newTemplate);
    }
  };

  @action
  updateEditActiveMask = (asset: AssetClass) => {
    if (asset) {
      this.moveActiveMask = asset;
    }
  };

  @action
  setLogoAsset = (asset: Asset, type: LogoType) => {
    this.logoAsset[type] = asset ? new AssetItemState(asset) : undefined;
  };

  /**
   * 设置违规资源数据
   * @param list
   */
  @action
  setLllegelAssets = (list: any) => {
    this.lllegelAssets = list;
  };
}

export default new AssetHandler();
