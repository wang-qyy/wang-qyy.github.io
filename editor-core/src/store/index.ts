import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import {
  globalStatusReducer,
  globalStatusAction,
} from './reducer/globalStatus';
import {
  templateInfoReducer,
  templateInfoAction,
} from './reducer/templateInfo';
import { userInfoReducer, userInfoAction } from './reducer/userInfo';

import {
  couponStatusReducer,
  couponStatusAction,
} from './reducer/couponStatus';

import { musicStatusReducer, musicStatusAction } from './reducer/musicStatus';
import { globalDataReducer, globalDataAction } from './reducer/globalData';

import {
  designerGlobalStatusAction,
  designerGlobalStatusReducer,
} from './reducer/designerGlobalStatus';

import { audioInfoAction, audioInfoReducer } from './reducer/audiosStatus';

import { assetDragReducer, assetDragAction } from './reducer/assetDrag';
import { qrCodeReducer, qrCodeAction } from './reducer/qrCode';

export {
  userInfoAction,
  templateInfoAction,
  globalStatusAction,
  couponStatusAction,
  musicStatusAction,
  globalDataAction,
  designerGlobalStatusAction,
  audioInfoAction,
  assetDragAction,
  qrCodeAction,
};

export const store = configureStore({
  reducer: {
    couponStatus: couponStatusReducer,
    globalStatus: globalStatusReducer,
    templateInfo: templateInfoReducer,
    globalData: globalDataReducer,
    userInfo: userInfoReducer,
    musicStatus: musicStatusReducer,
    designer: designerGlobalStatusReducer,
    audios: audioInfoReducer,

    assetDrag: assetDragReducer,

    qrCode: qrCodeReducer,
  },
});
// Infer the `RootState` and `AppDi
// spatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
