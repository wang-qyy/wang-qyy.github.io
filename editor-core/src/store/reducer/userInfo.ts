import { createSlice } from '@reduxjs/toolkit';

type VIPType =
  | 0 // 非VIP用户
  | 101 // 商用版-月卡
  | 102 // 商用版
  | 103 // 商用版-年卡
  | 104 // 商用版 海量下载
  | 301 // 下载版 - 月会员
  | 302 // 下载版 - 年会员
  | 303 // 下载版 海量
  | 800 // 企业基础会员(新媒体入门版)
  | 801 // 企业中级会员(新媒体标准版)
  | 802; // 企业终极会员(全用途专业版)

interface State {
  userId: number;
  id: number;
  vip: number;
  userType: 'qq' | '';
  username: string;
  created: string;
  DESIGNER_EDITOR_ASSET_USER: boolean;
  PPT_DESIGNER_USER: boolean;
  DESIGNER_WITHOUT_PAGE_INFO: boolean;
  COPY_TEMPLATE_USER: boolean;
  super_designer: number;
  isNewUser: number;
  avatar: string; // 头像
  vip_type: VIPType;
  bind_phone: number; // 是否绑定手机号 1-已绑定 0-未绑定
  downloadInfo: {
    dln_value: number; // 总剩余下载次数
    today_dln_value: number; // 今日可用总次数（包含免费）
    today_vip_dln_value: number; // 今日VIP可用下载次数
    total_dln_value: number; // 总使用次数
    vip_type: number; // 用户类型
    vip_value: number; // vip下载次数
    limited_unit?: 'year' | 'month' | 'day' | 'set'; // set下载次数用尽
    is_upg: number; // 是否升级
    pkg_count: number; // 已开通套餐总数量
  };
  team_id?: string | number;
}

const initialState: State = {
  userId: -1,
  id: -1,
  vip: -1,
  userType: '',
  username: '',
  created: '',
  DESIGNER_EDITOR_ASSET_USER: false,
  PPT_DESIGNER_USER: false,
  DESIGNER_WITHOUT_PAGE_INFO: false,
  COPY_TEMPLATE_USER: false,
  super_designer: 0,
  isNewUser: 0,
  avatar: '',
  vip_type: 0,
  team_id: 0,

  downloadInfo: {
    dln_value: 0, // 总次数
    today_dln_value: 0, // 今日可用次数
    today_vip_dln_value: 0,
    vip_type: 0, // 用户类型
    vip_value: 0, // vip下载次数
    total_dln_value: 0,
  },
};
export const counterSlice = createSlice({
  name: 'userInfo',
  initialState: {
    ...initialState,
  },
  reducers: {
    setUserInfo: (state, action) => {
      if (action.payload.id > 0) {
        Object.assign(state, action.payload);
      } else {
        Object.assign(state, initialState);
      }
    },
    setDownloadInfo: (state, action) => {
      state.downloadInfo = action.payload;
    },
    setBindPhone(state, action) {
      state.bind_phone = action.payload;
    },
  },
});
const userInfoReducer = counterSlice.reducer;
const userInfoAction = counterSlice.actions;
export { userInfoReducer, userInfoAction };
