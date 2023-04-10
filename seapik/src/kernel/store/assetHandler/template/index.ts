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
  GradientColor,
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
import { isTempModuleType } from '@/kernel';
import { deepCloneJson } from '@kernel/utils/single';

export default class TemplateState {
  @observable.shallow assets: IObservableArray<AssetItemState> =
    observable.array([]);

  @observable.shallow multiSelect: Set<AssetClass> = new Set();

  @observable.shallow tempModule: AssetClass = createTempModule();

  @observable template!: RawTemplateData;

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

        if (asset.transform.zindex > max) {
          max = zindex;
        }
        if (asset.transform.zindex < min) {
          min = zindex;
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
      offsetTime,
      pageTime,
      baseTime: baseTime || pageTime,
    };
  }

  @computed
  get backgroundAsset() {
    return this.assets.find((asset) => asset.meta.isBackground);
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
    return this.assets.findIndex((item) => item.id === id);
  };

  getTemplateCloned = () => {
    const newTemplate = deepCloneJson(this.template);
    newTemplate.assets = this.assets.map((asset) => asset.getAssetCloned());

    return newTemplate;
  };

  getTemplateClonedWithRender = () => {
    const newTemplate = deepCloneJson(this.template);
    newTemplate.id = this.id;
    newTemplate.videoInfo = deepCloneJson(this.videoInfo);
    newTemplate.assets = this.assets.map((asset) =>
      asset.getAssetClonedWithRender(),
    );

    return newTemplate;
  };

  /**
   * @description 根据多选数据，更新缓存组的子元素
   */
  _reactionMultiSelectToTempModuleChildren = () => {
    reaction(
      () => this.multiSelect.size,
      (value) => {
        if (this.tempModule) {
          this.tempModule.setChildren(Array.from(this.multiSelect));
          this.tempModule.setModuleStyleByChildren();
        }
      },
    );
  };

  checkAssetsTemplate() {
    this.assets.forEach((asset) => {
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
    this.checkAssetsTemplate();
  };

  @action
  restore = (template: RawTemplateWithRender) => {
    this.template = deepCloneJson({
      ...template,
      assets: [],
    });
    const newAssets: AssetClass[] = [];
    const { assets } = template;
    assets.forEach((item) => {
      const target = this.assets.find((i) => i.id === item.id);
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

    this.assets.replace(newAssets);
    this.checkAssetsTemplate();
  };

  @action
  setMultiSelect = (assets: AssetClass[], clearChildrenParent = true) => {
    this.multiSelect = new Set([...assets]);
    if (clearChildrenParent) {
      this.multiSelect.forEach((asset) => {
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
      this.multiSelect.forEach((asset) => {
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
          this.multiSelect.forEach((item) => {
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
        this.multiSelect.forEach((item) => {
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
  updateBackgroundColor = (color: RGBA | GradientColor) => {
    this.pageAttr.backgroundColor = color;
  };

  @action
  updateBackgroundImage = (data: TemplateBackground['backgroundImage']) => {
    this.pageAttr.backgroundImage = {
      ...data,
    };
  };
}
