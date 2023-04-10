import store from './store';

export function getTemplateInfo() {
  return store;
}

export function setTemplateInfo(template: any) {
  store.setTemplateInfo(template);
}
