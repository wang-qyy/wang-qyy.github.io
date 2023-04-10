import { createSlice } from '@reduxjs/toolkit';
import { RGBA } from '@hc/editor-core';

export interface QrCodeInfo {
  background: RGBA;
  foreground: RGBA;
  text: string;
  textType: string;
}

function getInit(): QrCodeInfo {
  return {
    background: { r: 255, g: 255, b: 255 },
    foreground: { r: 0, g: 0, b: 0 },
    text: '',
    textType: 'text',
  };
}
export const counterSlice = createSlice({
  name: 'globalData',
  initialState: getInit(),
  reducers: {
    setQrCodeInfo(state, action) {
      Object.assign(state, action.payload);
    },

    clear(state) {
      Object.assign(state, getInit());
    },
  },
});

const qrCodeReducer = counterSlice.reducer;
const qrCodeAction = counterSlice.actions;
export { qrCodeReducer, qrCodeAction };
