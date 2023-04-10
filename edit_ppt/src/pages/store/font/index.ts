import store, { FontItem } from './store';

/**
 * 存储字体列表
 */
export function setFontList(list: FontItem[]) {
  store.setList(list);
}

/**
 * 获取字体列表
 */
export function getFontList() {
  return store.list;
}
