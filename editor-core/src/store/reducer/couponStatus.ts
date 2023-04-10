import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  tagKey: '11',
  limitType: '', // 打开充值弹框的事件类型
  upgradeMode: false, // 是否为(个人)升级模式
  upgradePkgId: undefined as undefined | number, // 需要被升级的会员包id
};

export const counterSlice = createSlice({
  name: 'couponStatus',
  initialState: {
    ...initialState,
  },
  reducers: {
    getCouponStatus: (state, action) => {
      Object.assign(state, action.payload);
    },
  },
});

const couponStatusReducer = counterSlice.reducer;
const couponStatusAction = counterSlice.actions;
export { couponStatusReducer, couponStatusAction };
