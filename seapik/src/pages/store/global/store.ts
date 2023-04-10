import { observable, action, makeObservable, computed } from 'mobx';

import { convertTextToPattern } from '@/utils/draftHandler';

class Global {
  @observable openImgModal: boolean = false;

  @observable draftModal: boolean = false;

  @observable draftData: string = '';

  constructor() {
    makeObservable(this);
  }

  @action
  setOpenImgModal(open: boolean) {
    this.openImgModal = open;
  }

  @action
  openDraftModal(open: boolean) {
    this.draftModal = open;
  }

  @action saveDraftData(text: string) {
    this.draftData = text;
  }
  @computed
  get draftRawData() {
    return convertTextToPattern(this.draftData);
  }
}

const globalStore = new Global();
export default globalStore;
