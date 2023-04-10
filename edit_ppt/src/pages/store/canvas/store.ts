import { observable, flow, makeObservable, computed, action } from 'mobx';

export interface CanvasInfo {
  width: number;
  height: number;
  scale: number;
}

type ExportFileType = 'png' | 'jpg';

const initCanvas = { width: 0, height: 0, scale: 1 };

class CanvasInfoStore {
  @observable canvasInfo: CanvasInfo | undefined = undefined;

  @observable containerSize: { width: number; height: number } | undefined =
    undefined;

  @observable fileType: ExportFileType = 'png';
  @observable url: string = '';

  @observable loaded: boolean = false;

  constructor() {
    makeObservable(this);
  }

  @action
  setLoadStatus(status: boolean): void {
    this.loaded = status;
  }

  @action
  setCanvasSize(canvasInfo: Partial<CanvasInfo>) {
    if (this.canvasInfo) {
      Object.assign(this.canvasInfo, canvasInfo);
    } else {
      this.canvasInfo = canvasInfo;
    }
  }

  @action setUrl(url: string) {
    this.url = url;
  }
}

const canvasInfoStore = new CanvasInfoStore();
(window as any).__canvasInfoStore = canvasInfoStore;
export default canvasInfoStore;
