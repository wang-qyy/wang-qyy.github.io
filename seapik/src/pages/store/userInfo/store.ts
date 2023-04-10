import { observable, flow, makeObservable, computed } from 'mobx';

import { getUserInfo } from '@/apis/user';

interface UserInfo {
  uid: number;
  username: string;
  head_img: string;
}

class UserInfoStore {
  @observable userInfo: UserInfo = { username: '', uid: -1, head_img: '' };

  constructor() {
    makeObservable(this);

    this.getUserInfo();
  }

  @computed
  get isLogin() {
    return this.userInfo.uid > 0;
  }

  @flow
  *getUserInfo() {
    const res = yield getUserInfo();

    if (res.code == 200) {
      this.userInfo = res.data;
    }
  }
}

const userInfoStore = new UserInfoStore();
(window as any).__userInfoStore = userInfoStore;
export default userInfoStore;
