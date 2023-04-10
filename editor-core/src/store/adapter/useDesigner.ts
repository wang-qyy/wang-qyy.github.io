import {
  designerGlobalStatusAction,
  useAppDispatch,
  useAppSelector,
  store,
} from '@/store';
import { isEqual } from 'lodash';

export function getTimeScale() {
  return store.getState().designer.timeRuleScale;
}

export function useSetTimeScale() {
  const { timeRuleScale } = useAppSelector(state => state.designer);

  const dispatch = useAppDispatch();

  function update(scale: number) {
    dispatch(designerGlobalStatusAction.setTimeRuleScale(scale));
  }

  return { timeRuleScale, update };
}

export function useSetRoleMoreName() {
  const { roleMoreName } = useAppSelector(state => state.designer);

  const dispatch = useAppDispatch();

  function updateRoleMoreName(scale: any) {
    dispatch(designerGlobalStatusAction.setRoleMoreName(scale));
  }

  return { roleMoreName, updateRoleMoreName };
}

/**
 * 设置当前菜单
 */
export function setActiveMenu(activeMenu: string) {
  store.dispatch(
    designerGlobalStatusAction.setMenu({
      activeMenu,
      activeSubMenu: '',
      activeOperationMenu: '',
    }),
  );
}

/**
 * 设置当前子菜单
 */
export function setActiveSubMenu(activeMenu: string) {
  store.dispatch(
    designerGlobalStatusAction.setMenu({
      activeSubMenu: activeMenu,
      activeOperationMenu: '',
    }),
  );
}

/**
 * 当前操作面板
 * */
export function setActiveOperationMenu(activeMenu: string) {
  store.dispatch(
    designerGlobalStatusAction.setMenu({
      activeOperationMenu: activeMenu,
    }),
  );
}

export function getMenu() {
  return store.getState().designer.menu;
}

//
export function useSetActiveMenu() {
  const { menu } = useAppSelector(state => state.designer);

  return {
    ...menu,
    setActiveMenu,
    setActiveSubMenu,
    setActiveOperationMenu,
  };
}

export function getAlignAsset() {
  return store.getState().designer.alignAsset;
}
export function updateAlignAsset(
  payload: [number | undefined, number | undefined],
) {
  if (!isEqual(getAlignAsset(), payload)) {
    store.dispatch({
      type: 'designerGlobalStatus/setAlignAsset',
      payload,
    });
  }
}

export function clearAlignAsset() {
  store.dispatch({
    type: 'designerGlobalStatus/setAlignAsset',
    payload: [],
  });
}

export function useAsideWidth() {
  const { asideWidth } = useAppSelector(state => state.designer);

  const dispatch = useAppDispatch();

  function update(width: number) {
    dispatch(designerGlobalStatusAction.setAsideWidth(width));
  }

  return { width: asideWidth, update };
}
