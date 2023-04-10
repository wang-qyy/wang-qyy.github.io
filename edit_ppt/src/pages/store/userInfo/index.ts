import store from './store';

export function isLogin() {
  return store.isLogin;
}

export function useUserInfo() {
  const { userInfo, isLogin } = store;

  return { userInfo, isLogin };
}
