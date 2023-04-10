import { observable, action, makeObservable, computed } from 'mobx';

class SettingsStore {
  @observable active: string = '';

  @observable open: boolean = false;

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

const settingsStore = new SettingsStore();
export default settingsStore;
