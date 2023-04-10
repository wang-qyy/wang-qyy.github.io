import AssetItemState from '@/kernel/store/assetHandler/asset';
import { createSlice } from '@reduxjs/toolkit';

export interface ResAssets {
  resId: string;
  width: number;
  height: number;
  posX: number;
  posY: number;
  endTime: number; // 当前元素最后出现的位置
  replaced: boolean;
  assets: AssetItemState[];
}
function getInit() {
  return {
    resAssets: [],
    quickAssets: [],
    loading: false,
  };
}
export const OneKeyReplaceSlice = createSlice({
  name: 'oneKeyReplace',
  initialState: getInit(),
  reducers: {
    setMusicStatus(state, action) {
      Object.assign(state, action.payload);
    },
    setResAssets(state, action) {
      Object.assign(state.resAssets, action.payload);
    },
    setLoading(state, action) {
      Object.assign(state.loading, action.payload);
    },
    setQuickAssets(state, action) {
      Object.assign(state.quickAssets, action.payload);
    },
  },
});

const oneKeyReplaceReducer = OneKeyReplaceSlice.reducer;
const oneKeyReplaceAction = OneKeyReplaceSlice.actions;
export { oneKeyReplaceReducer, oneKeyReplaceAction };
