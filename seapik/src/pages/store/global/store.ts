import { observable, action, makeObservable, computed } from 'mobx';

class Global {
  @observable openImgModal: boolean = false;

  constructor() {
    makeObservable(this);
  }

  @action
  setOpenImgModal(open: boolean) {
    this.openImgModal = open;
  }
}

const globalStore = new Global();
export default globalStore;
