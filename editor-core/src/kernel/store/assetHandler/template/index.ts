import {
  action,
  computed,
  makeObservable,
  observable,
  reaction,
  runInAction,
  toJS,
} from 'mobx';
import type { IObservableArray } from 'mobx';
import AssetItemState from '@kernel/store/assetHandler/asset';
import {
  Asset,
  AssetClass,
  Camera,
  GradientType,
  LogoAsset,
  PageAttr,
  RawTemplateData,
  RawTemplateWithRender,
  RGBA,
  TemplateBackground,
} from '@kernel/typing';
import { calcTemplateTime } from '@kernel/utils/StandardizedTools';
import { newId } from '@kernel/utils/idCreator';
import { buildAssets, loadAssets } from '@kernel/store/assetHandler/utils';
import { createTempModule } from '@kernel/store/assetHandler/asset/utils';
import { isTempModuleType, isValidAssets } from '@/kernel';
import { deepCloneJson } from '@kernel/utils/single';
import CameraState from './camera';

export default class TemplateState {
  @observable.shallow assets: IObservableArray<AssetItemState> =
    observable.array([]);

  @observable.shallow multiSelect: Set<AssetClass> = new Set();

  @observable.shallow tempModule: AssetClass = createTempModule();

  @observable template!: RawTemplateData;

  /**
   * 镜头  todo待确定 .shallow
   */
  @observable cameras: IObservableArray<CameraState> = observable.array([]);

  id = newId();

  @computed
  get assetList() {
    return [this.tempModule, ...this.assets];
  }

  @computed
  get pageAttr() {
    return this.template.pageAttr;
  }

  @computed
  get zIndex() {
    let max = 0;
    let min = 0;

    this.assets.forEach((asset, index) => {
      if (!asset.meta.isLogo) {
        const { zindex } = asset.transform;

        if (this.assets.length === 1) {
          max = zindex;
          min = zindex;
        } else if (!asset.meta.isBackground) {
          // 过滤掉背景层级，否则其他元素无法判断是否为最小层级（不包含背景）
          if (!max && !min) {
            max = zindex;
            min = zindex;
          }
          // if (!min) {
          //   min = zindex;
          // }
          if (asset.transform.zindex > max) {
            max = zindex;
          }
          if (asset.transform.zindex < min) {
            min = zindex;
          }
        }
      }
    });
    return {
      max,
      min,
    };
  }

  @computed
  get minZIndex() {
    return this.zIndex.min;
  }

  @computed
  get maxZIndex() {
    return this.zIndex.max;
  }

  @computed
  get background() {
    const { backgroundColor, backgroundImage } = this.template.pageAttr;
    return {
      backgroundColor,
      backgroundImage,
    };
  }

  @computed
  get endTransfer() {
    return this.assets.find(asset => asset.meta.transferLocation === 'after');
  }

  @computed
  get validAssets() {
    return this.assets.filter(isValidAssets);
  }

  @computed
  get startTransfer() {
    return this.assets.find(asset => asset.meta.transferLocation === 'before');
  }

  @computed
  get effectVideoE() {
    return this.assets.find(asset => asset.meta.isOverlay);
  }

  @computed
  get logo() {
    const logoAsset: LogoAsset = {
      text: undefined,
      image: undefined,
    };
    const logo = this.assets.filter(asset => asset.meta.isLogo);
    logo.forEach(asset => {
      if (asset.meta.type === 'text') {
        logoAsset.text = asset;
      } else if (asset.meta.type === 'image') {
        logoAsset.image = asset;
      }
    });
    return logoAsset;
  }

  @computed
  get watermark() {
    const watermarkAsset: LogoAsset = {
      text: undefined,
      image: undefined,
    };
    const watermark = this.assets.filter(asset => asset.meta.isWatermark);
    watermark.forEach(asset => {
      if (asset.meta.type === 'text') {
        watermarkAsset.text = asset;
      } else if (asset.meta.type === 'image') {
        watermarkAsset.image = asset;
      }
    });
    return watermarkAsset;
  }

  @computed
  get videoInfo() {
    const { pageAttr } = this.template;
    const { pageInfo } = pageAttr;
    const { offsetTime = [0, 0], pageTime = 0, baseTime, speed = 1 } = pageInfo;
    const allAnimationTime = calcTemplateTime(pageTime, offsetTime);
    return {
      startTime: 0,
      endTime: pageTime,
      allAnimationTime,
      allAnimationTimeBySpeed: allAnimationTime * (1 / speed),
      speed,
      offsetTime,
      pageTime,
      baseTime: baseTime || pageTime,
    };
  }

  @computed
  get backgroundAsset() {
    return this.assets.find(asset => asset.meta.isBackground);
  }

  @computed
  get templateCameras() {
    const tempCameras = this.getTemplateCloned();
    return tempCameras.cameras;
  }

  constructor(template: RawTemplateData) {
    this.replaceSelf(template);

    this._reactionMultiSelectToTempModuleChildren();
    makeObservable(this);
  }

  getAssetIndexById = (id?: number) => {
    if (id === undefined) {
      return -1;
    }
    return this.assets.findIndex(item => item.id === id);
  };

  getTemplateCloned = () => {
    const newTemplate = deepCloneJson(this.template);
    newTemplate.assets = this.assets.map(asset => asset.getAssetCloned());
    newTemplate.cameras = this.cameras.map(camera => camera.getCameraCloned());
    return newTemplate;
  };

  getTemplateClonedWithRender = () => {
    const newTemplate = deepCloneJson(this.template);
    newTemplate.id = this.id;
    newTemplate.videoInfo = deepCloneJson(this.videoInfo);
    newTemplate.assets = this.assets.map(asset =>
      asset.getAssetClonedWithRender(),
    );
    newTemplate.cameras = this.cameras.map(camera => camera.getCameraCloned());
    return newTemplate;
  };

  /**
   * @description 根据多选数据，更新缓存组的子元素
   */
  _reactionMultiSelectToTempModuleChildren = () => {
    reaction(
      () => this.multiSelect.size,
      value => {
        if (this.tempModule) {
          this.tempModule.setChildren(Array.from(this.multiSelect));
          this.tempModule.setModuleStyleByChildren();
        }
      },
    );
  };

  checkAssetsTemplate() {
    this.assets.forEach(asset => {
      asset.setTemplatePoint(this);
    });
  }

  buildAssets = (assetList: Asset[]) => {
    const result = buildAssets(assetList);
    loadAssets(result);
    runInAction(() => {
      this.assets.replace(result);
    });
    this.checkAssetsTemplate();
  };

  buildCameras = (camerasList: Camera[]) => {
    camerasList.forEach(item => {
      this.cameras.push(new CameraState(item));
    });
  };

  @action
  addMultiSelect = (asset: AssetClass, clearChildrenParent = true) => {
    if (isTempModuleType(asset)) {
      return;
    }
    this.multiSelect.add(asset);
    if (clearChildrenParent) {
      asset.setParent(this.tempModule);
    }
  };

  @action
  replaceSelf = (template: RawTemplateData) => {
    this.template = {
      ...template,
      assets: [],
    };
    this.buildAssets(template.assets);
    this.buildCameras(template.cameras);
    this.checkAssetsTemplate();
  };

  @action
  restore = (template: RawTemplateWithRender) => {
    this.template = deepCloneJson({
      ...template,
      assets: [],
    });
    const newAssets: AssetClass[] = [];
    const { assets, cameras } = template;
    assets.forEach(item => {
      const target = this.assets.find(i => i.id === item.id);
      if (target) {
        target.restore(item);
        newAssets.push(target);
      } else {
        const { transform, meta, attribute, assets } = item;
        const newAsset = new AssetItemState({
          meta: deepCloneJson(meta),
          transform: deepCloneJson(transform),
          attribute: deepCloneJson(attribute),
          assets,
        });
        newAssets.push(newAsset);
      }
    });
    // if (newAssets.length) {
    //   this.assets.replace(newAssets);
    // }
    const newCameras: CameraState[] = [];
    cameras.forEach(item => {
      const camera = new CameraState(item);
      newCameras.push(camera);
    });
    this.cameras.replace(newCameras);
    this.assets.replace(newAssets);
    this.checkAssetsTemplate();
  };

  @action
  setMultiSelect = (assets: AssetClass[], clearChildrenParent = true) => {
    this.multiSelect = new Set([...assets]);
    if (clearChildrenParent) {
      this.multiSelect.forEach(asset => {
        asset.setParent(undefined);
      });
    }
  };

  @action
  removeMultiSelect = (asset: AssetClass, clearChildrenParent = true) => {
    this.multiSelect.delete(asset);
    if (clearChildrenParent) {
      asset.setParent(undefined);
    }
  };

  @action
  clearMultiSelect = (clearChildrenParent = true) => {
    if (clearChildrenParent) {
      this.multiSelect.forEach(asset => {
        asset.setParent(undefined);
      });
    }
    this.multiSelect.clear();
  };

  @action
  addAsset = (asset: Asset, cb?: (asset: AssetClass) => AssetClass) => {
    if (this.assets) {
      // auto 会自动设置一些属性值，但未必符合需求，所以
      asset.transform.zindex = this.zIndex.max + 1;

      let ac = new AssetItemState(asset);
      if (cb) {
        ac = cb(ac);
      }
      this.assets.push(ac);
      const active = this.assets.length - 1;
      this.checkAssetsTemplate();
      return this.assets[active];
    }

    return undefined;
  };

  @action
  addAssets = (assets: AssetClass[]) => {
    const assetList = this.assets.slice();
    this.assets.replace([...assetList, ...assets]);
    this.checkAssetsTemplate();
  };

  @action
  replaceAsset = (asset: Asset, index: number) => {
    if (index < 0) {
      return;
    }
    if (this.assets) {
      Object.assign(this.assets[index], new AssetItemState(asset));
      this.checkAssetsTemplate();
    }
  };

  @action
  replaceAssetClass = (asset: AssetClass, index: number) => {
    if (index < 0) {
      return;
    }
    if (this.assets) {
      Object.assign(this.assets[index], asset);
      this.checkAssetsTemplate();
    }
  };

  @action
  replaceAssetClasses = (assets: AssetClass[]) => {
    if (this.assets) {
      this.assets.replace(assets);
      this.checkAssetsTemplate();
    }
  };

  @action
  removeAsset = (id: number) => {
    if (this.assets) {
      const index = this.getAssetIndexById(id);
      const target = this.assets[index];
      if (index > -1) {
        if (isTempModuleType(target)) {
          this.multiSelect.forEach(item => {
            this.removeAsset(item.id);
          });
          this.clearMultiSelect();
        } else {
          this.assets.splice(index, 1);
        }
      }
    }
  };

  @action
  autoRemoveAsset = (id: number) => {
    if (this.assets) {
      let index = -1;
      let target: AssetClass;
      if (id === this.tempModule.id) {
        target = this.tempModule;
      } else {
        index = this.getAssetIndexById(id);
        target = this.assets[index];
        if (target?.parent) {
          target = target.parent;
          index = this.getAssetIndexById(target.id);
        }
      }

      if (isTempModuleType(target)) {
        // TempModule元素只能删除子元素
        this.multiSelect.forEach(item => {
          this.removeAsset(item.id);
        });
        this.clearMultiSelect();
      } else if (index > -1) {
        this.assets.splice(index, 1);
      }
    }
  };

  @action
  updateTemplate = (data: Partial<RawTemplateData>) => {
    Object.assign(this.template, data);
  };

  @action
  updatePageInfo = (data: Partial<PageAttr['pageInfo']>) => {
    Object.assign(this.pageAttr.pageInfo, data);
  };

  @action
  updateBackgroundColor = (color: RGBA | GradientType) => {
    this.pageAttr.backgroundColor = color;
  };

  @action
  updateBackgroundImage = (data: TemplateBackground['backgroundImage']) => {
    this.pageAttr.backgroundImage = {
      ...data,
    };
  };

  @action
  addCamera = (camera: Camera, index = -1) => {
    if (this.cameras) {
      const ac = new CameraState(camera);
      if (index !== -1) {
        // todo
        this.cameras.splice(index + 1, 0, ac);
      } else {
        this.cameras.push(ac);
      }
      const active = this.cameras.length - 1;
      return this.cameras[active];
    }
    return undefined;
  };

  @action
  addCameraPre = (camera: Camera) => {
    if (this.cameras) {
      const ac = new CameraState(camera);
      this.cameras.unshift(ac);
      return ac;
    }
    return undefined;
  };

  @action
  removeCamera = (index: number) => {
    if (this.cameras) {
      this.cameras.splice(index, 1);
    }
  };

  @action
  removeAllCamera = () => {
    this.cameras = [];
  };
}