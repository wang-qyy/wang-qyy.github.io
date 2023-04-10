import store from './store';

/**
 * 存储字体列表
 */
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
