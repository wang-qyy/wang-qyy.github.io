import { createSlice } from '@reduxjs/toolkit';

interface GlobalDataType {
  templateFilter: {
    classes: Record<'c' | 'g' | 'i', object[]>;
    shape: object[];
    tags: {
      st: object[];
    };
  } | null;
  templateFilterLoading: boolean;
}

function getInit(): GlobalDataType {
  return {
    templateFilter: null,
    templateFilterLoading: false,
  };
}
export const counterSlice = createSlice({
  name: 'globalData',
  initialState: getInit(),
  reducers: {
    setTemplateFilter(state, action) {
      state.templateFilter = action.payload;
    },
    setTemplateFilterLoading(state, action) {
      state.templateFilterLoading = action.payload;
    },
    setInfo<T extends keyof GlobalDataType>(
      state: GlobalDataType,
      action: {
        payload: { key: T; data: GlobalDataType[T] };
        type: string;
      },
    ) {
      const { key, data } = action.payload;
      state[key] = data;
    },
  },
});

const globalDataReducer = counterSlice.reducer;
const globalDataAction = counterSlice.actions;
export { globalDataReducer, globalDataAction };
