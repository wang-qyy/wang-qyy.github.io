import { observable, action, makeObservable, computed } from 'mobx';

export interface FontItem {
  id: number;
  name: string;
  url: string;
  font: string;
}

class Font {
  @observable list: FontItem[] = [];

  @observable loaded: boolean = false;

  constructor() {
    makeObservable(this);
  }

  @action
  setList(list: FontItem[]) {
    this.list = list;
  }

  @action
  setLoadStatus(status: boolean) {
    this.loaded = status;
  }
}

const userInfoStore = new Font();
export default userInfoStore;
