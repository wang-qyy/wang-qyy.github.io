import { userInfoAction, useAppDispatch, useAppSelector, store } from '@/store';
import { isEqual } from 'lodash-es';

export function useUserInfoSetter() {
  const dispatch = useAppDispatch();
  const { userInfo: state } = store.getState();

  function updateUserInfo(userInfo: typeof state) {
    if (
      state.id !== userInfo.id ||
      state.vip_type !== userInfo.vip_type ||
      state.bind_phone !== userInfo.bind_phone
    ) {
      dispatch(userInfoAction.setUserInfo(userInfo));
    }
  }

  return updateUserInfo;
}

export function useUserInfo() {
  const { userInfo } = useAppSelector(store => ({
    userInfo: store.userInfo,
  }));

  return userInfo;
}

export function getUserId() {
  return store.getState().userInfo.id;
}

export function getUserInfo() {
  return store.getState().userInfo;
}

export function setDownloadInfo(info) {
  store.dispatch({ type: 'userInfo/setDownloadInfo', payload: info });
}

export function useGetDownloadInfo() {
  const { downloadInfo } = useAppSelector(store => ({
    downloadInfo: store.userInfo.downloadInfo,
  }));

  function update(info) {
    if (!isEqual(downloadInfo, info)) {
      setDownloadInfo(info);
    }
  }

  return { downloadInfo, update };
}

export function setBindPhoneState(params: 0 | 1) {
  store.dispatch(userInfoAction.setBindPhone(params));
}
