import { createSlice } from '@reduxjs/toolkit';

type DragId = string | number;

interface DragOffset {
  x: number;
  y: number;
}

interface DragState {
  isDragging: boolean;
  offset: DragOffset;
  dragging: DragId[]; // 正在拖动的元素
  dragInfo: {};
  dropInfo: {};
}

function getInitState(): DragState {
  return {
    isDragging: false,
    offset: { x: 0, y: 0 },
    dragging: [], // 正在拖动的元素
    dragInfo: {},
    dropInfo: {},
  };
}

export const counterSlice = createSlice({
  name: 'designerGlobalStatus',
  initialState: getInitState(),
  reducers: {
    setInDragging(state, action) {
      state.isDragging = action.payload;
    },
    setDragging(state, action) {
      state.dragging = action.payload;
    },

    setDragInfo(state, action) {
      state.dragInfo = action.payload;
    },
    setDopInfo(state, action) {
      state.dropInfo = action.payload;
    },

    setOffset(state, action) {
      state.offset = action.payload;
    },

    clearDragStatus(state) {
      Object.assign(state, getInitState());
    },
  },
});

export const assetDragReducer = counterSlice.reducer;
export const assetDragAction = counterSlice.actions;
