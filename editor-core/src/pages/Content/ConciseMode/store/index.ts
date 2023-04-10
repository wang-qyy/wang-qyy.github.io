import AssetItemState from '@/kernel/store/assetHandler/asset';
import { action, makeObservable, observable } from 'mobx';

export interface ResAssets {
  resId: string;
  width: number;
  height: number;
  posX: number;
  posY: number;
  endTime: number; // 当前元素最后出现的位置
  replaced: boolean;
  assets: AssetItemState[];
}

class ConciseMode {
  @observable activeIndex = 0;

  @observable resAssets: ResAssets[] = [];

  @observable loading = false;

  constructor() {
    makeObservable(this);
  }

  @action
  setTemplateIndex = (index: number) => {
    this.activeIndex = index;
  };

  @action
  initResAssets = (resAssets: ResAssets[]) => {
    this.resAssets = resAssets;
  };

  @action
  setLoading = (loading: boolean) => {
    this.loading = loading;
  };
}

const conciseModeStore = new ConciseMode();

export default conciseModeStore;
