import {
  assetDragAction,
  useAppDispatch,
  useAppSelector,
  store,
} from '@/store';

/**
 * @description 拖拽状态
 */
export function setAssetInDragging(inDragging: boolean): void {
  store.dispatch(assetDragAction.setInDragging(inDragging));
}

export function setDragging(dragId: Array<string | number>): void {
  store.dispatch(assetDragAction.setDragging(dragId));
}

export function setDragOffset(offset: { x: number; y: number }) {
  store.dispatch(assetDragAction.setOffset(offset));
}

// 获取拖拽信息
export function useAssetDragStatus() {
  const assetDrag = useAppSelector(state => state.assetDrag);
  return assetDrag;
}

// 清除拖拽状态
export function clearDragStatus() {
  store.dispatch(assetDragAction.clearDragStatus());
}
