import { createSlice } from '@reduxjs/toolkit';

interface TemplateInfos {
  isModalVisible: boolean;
  textToSpeechVisible: boolean; // 文字转语音弹框
  recordModalVisible: boolean; // 录音弹框状态
  audioClipsVisible: boolean; // 剪裁弹框状态
  musicType: string;
  time: number;
  templ_id: number;
  musicItem: any;
}

function getInit(): TemplateInfos {
  return {
    isModalVisible: false,
    textToSpeechVisible: false, // 文字转语音弹框
    recordModalVisible: false, // 录音弹框状态
    audioClipsVisible: false, // 剪裁弹框状态
    musicType: '',
    time: 0,
    templ_id: -3,
    musicItem: null,
  };
}
export const counterSlice = createSlice({
  name: 'musicStatus',
  initialState: getInit(),
  reducers: {
    setMusicStatus(state, action) {
      Object.assign(state, action.payload);
    },
  },
});

const musicStatusReducer = counterSlice.reducer;
const musicStatusAction = counterSlice.actions;
export { musicStatusReducer, musicStatusAction };
