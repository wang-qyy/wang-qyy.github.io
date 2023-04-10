import store from './store';

export function openImgModal(open: boolean): void {
  store.setOpenImgModal(open);
}

// 图片列表Modal
export function getImgModalStatus() {
  return store.openImgModal;
}

export function useImgModal() {
  return {
    openFn: openImgModal,
    open: store.openImgModal,
  };
}

// ppt 编辑草稿
export function openDraftModal(open: boolean): void {
  store.openDraftModal(open);
}

export function getDraftModalStatus() {
  return store.draftModal;
}

export function useDraftModal() {
  return {
    openFn: openDraftModal,
    open: store.draftModal,
  };
}

// 输入内容
export function changeDraftData(text: string) {
  return store.saveDraftData(text);
}

export function getDraftData() {
  return store.draftData;
}

// 输入内容格式化
export function changeDraftRawData(data: {}) {
  return store.draftRawData;
}
