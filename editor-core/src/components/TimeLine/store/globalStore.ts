import { action, computed, makeObservable, observable } from 'mobx';
import { GlobalProps } from '../types';

// 使用 context 存在性能问题，所以将 global 数据同步到mobx中
class GlobalStore {
  // 每个刻度表示的时间 毫秒
  @observable scaleTime = 100;

  // 刻度宽度
  @observable scaleWidth = 15;

  // 左偏移量
  @observable paddingLeft = 0;

  // 时间轴最外层容器
  timeLineWrapper: HTMLDivElement | null;

  // 滚动容器得到滚动距离
  // @observable scroll: Position = {
  //   left: 0,
  //   top: 0,
  // };

  constructor() {
    makeObservable(this);
    this.timeLineWrapper = null;
  }

  @action
  initOptions = (params: GlobalProps) => {
    const { scaleTime, scaleWidth, paddingLeft } = params;
    this.scaleTime = scaleTime;
    this.scaleWidth = scaleWidth;
    this.paddingLeft = paddingLeft;
  };

  // 1像素表示的宽度
  @computed
  get metaScaleWidth(): number {
    return this.scaleTime / this.scaleWidth;
  }

  initTimeLineWrapper = (timeLineWrapper: HTMLDivElement) => {
    this.timeLineWrapper = timeLineWrapper;
  };
}

const globalStore = new GlobalStore();

export default globalStore;
