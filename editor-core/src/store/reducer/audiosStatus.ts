import { MultipleAudio } from '@hc/editor-core';
import { createSlice } from '@reduxjs/toolkit';

export interface ActiveAudio extends MultipleAudio {
  trackIndex?: number;
}

interface AudioState {
  activeAudio: ActiveAudio | undefined; // 当前选中音频
  inCliping: Number; // 选中音频所在的轨道
  volumeController: boolean;
  speedController: boolean;
}

const initialState: AudioState = {
  activeAudio: undefined,
  inCliping: -1,
  volumeController: false,
  speedController: false,
};

export const counterSlice = createSlice({
  name: 'audioInfo',
  initialState: {
    ...initialState,
  },
  reducers: {
    setActiveAudio(state, action) {
      state.activeAudio = action.payload;
    },
    setAudioInfo(state, action) {
      if (state.activeAudio) {
        Object.assign(state.activeAudio, action.payload);
      }
    },

    setInCliping(state, action) {
      state.inCliping = action.payload;
    },
    setVolumeController(state, action) {
      state.volumeController = action.payload;
    },
    setSpeedController(state, action) {
      state.speedController = action.payload;
    },
    clear(state) {
      Object.assign(state, initialState);
    },
  },
});
const audioInfoReducer = counterSlice.reducer;
const audioInfoAction = counterSlice.actions;
export { audioInfoReducer, audioInfoAction };
