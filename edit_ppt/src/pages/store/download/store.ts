import { observable, makeObservable } from 'mobx';

export interface FontItem {
  id: number;
  name: string;
  url: string;
  font: string;
}

class Download {
  @observable polling: boolean = false;
  @observable limit: boolean = false;

  constructor() {
    makeObservable(this);
  }

  setPollingStatus(status: boolean): void {
    this.polling = status;
  }
  setLimitStatus(status: boolean) {
    this.limit = status;
  }
}

const userInfoStore = new Download();
export default userInfoStore;
