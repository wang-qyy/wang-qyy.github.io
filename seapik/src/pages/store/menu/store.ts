import { observable, action, makeObservable, computed } from 'mobx';

class UserInfoStore {
  @observable active: string = 'text';

  @observable open: boolean = true;

  constructor() {
    makeObservable(this);
  }

  @action
  setActive(menu: string) {
    this.active = menu;
  }

  @action
  setOpen(isOpen: boolean) {
    this.open = isOpen;
  }
}

const userInfoStore = new UserInfoStore();
export default userInfoStore;
