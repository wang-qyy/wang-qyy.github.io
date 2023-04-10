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

class OneKeyReplace {
  @observable resAssets: ResAssets[] = [];

  @observable quickAssets: Array<AssetItemState[]> = [];

  @observable loading = false;

  constructor() {
    makeObservable(this);
  }

  @action
  initResAssets = (resAssets: ResAssets[]) => {
    this.resAssets = resAssets;
  };

  @action
  initQuickAssets = (quickAssets: Array<AssetItemState[]>) => {
    this.quickAssets = quickAssets;
  };

  @action
  setLoading = (loading: boolean) => {
    this.loading = loading;
  };
}

const oneKeyReplaceStore = new OneKeyReplace();

export default oneKeyReplaceStore;
