import { observable, action, makeObservable, computed, autorun } from 'mobx';
import { Online } from '@/utils/typing';

class TemplateStore {
  @observable draft_id: number | undefined;
  @observable templateInfo: any;
  @observable online: Online | undefined;

  constructor() {
    makeObservable(this);
  }

  @action
  setTemplateInfo(template: { id: number; online?: Online }) {
    Object.assign(this.templateInfo || {}, template);
    console.log('setTemplateInfo template', template);

    if (template.id) {
      this.draft_id = template.id;
    }

    if (template.online !== undefined) {
      this.online = template.online;
    }
  }
}

const templateStore = new TemplateStore();
export default templateStore;
