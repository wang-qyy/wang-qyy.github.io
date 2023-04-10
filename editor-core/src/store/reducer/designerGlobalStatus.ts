import { createSlice } from '@reduxjs/toolkit';

export const counterSlice = createSlice({
  name: 'designerGlobalStatus',
  initialState: {
    asideWidth: 560, // 侧边栏宽度  560~900
    timeRuleScale: 4, // 时间刻度缩放比例 范围1～100
    roleMoreName: null,
    menu: {
      activeMenu: 'background',
      activeSubMenu: '',
      activeOperationMenu: '',
    },

    alignAsset: [
      undefined, // 时间轴-对齐元素startTime
      undefined, // 时间轴-对齐元素endTime
    ],
  },
  reducers: {
    setTimeRuleScale: (state, action) => {
      state.timeRuleScale = action.payload;
    },
    setRoleMoreName: (state, action) => {
      state.roleMoreName = action.payload;
    },

    setMenu: (state, action) => {
      Object.assign(state.menu, action.payload);
    },

    setAlignAsset: (state, action) => {
      state.alignAsset = action.payload;
    },
    setAsideWidth: (state, action) => {
      state.asideWidth = action.payload;
    },
  },
});

const designerGlobalStatusReducer = counterSlice.reducer;
const designerGlobalStatusAction = counterSlice.actions;
export { designerGlobalStatusReducer, designerGlobalStatusAction };
