import { uniqBy } from 'lodash-es';
import { useCreation } from 'ahooks';
import {
  templateInfoAction,
  useAppDispatch,
  useAppSelector,
  store,
} from '@/store';

import { getAllTemplates, toJS } from '@hc/editor-core';
import type { WarnAssetItem } from '@/typings/index';

type GlobalStatusType = ReturnType<typeof useGetTemplateStatusReducer>;

function useGetTemplateStatusReducer() {
  const { templateInfo } = useAppSelector(store => ({
    templateInfo: store.templateInfo,
  }));
  return templateInfo;
}

function useFactory(key: keyof GlobalStatusType) {
  const dispatch = useAppDispatch();
  const GlobalStatus = useGetTemplateStatusReducer();

  const actionKey = useCreation(() => {
    const firstWord = key.slice(0, 1).toUpperCase();
    const otherWords = key.slice(1);
    return `update${firstWord}${otherWords}` as keyof typeof templateInfoAction;
  }, [key]);
  // console.log(actionKey);
  function handle(flag: boolean) {
    dispatch(templateInfoAction[actionKey](flag));
  }

  function update(value: any) {
    handle(value);
  }
  return { update, value: GlobalStatus[key] };
}

export function getTemplateInfo() {
  const templates = [...getAllTemplates()];
  const canvas = templates[0]?.canvas || { width: 100, height: 100 };
  const ratio = canvas.width / canvas.height;

  const ratioType = ratio > 1 ? 'w' : ratio === 1 ? 'c' : 'h';

  return { ratioNumber: ratio, ratioType, templates };
}

export function useTemplateInfo() {
  const dispatch = useAppDispatch();

  const {
    templateInfo: state,

    templateScale,
    previewUrl,
  } = useAppSelector(store => {
    const ratio =
      (store.templateInfo.canvasInfo.width || 0) /
      (store.templateInfo.canvasInfo.height || 0);
    return {
      templateInfo: store.templateInfo,
      templateScale: ratio || 1,
      previewUrl: store.templateInfo?.small_url,
    };
  });

  function updateTemplateInfo(templateInfo: any) {
    const { info, assets = [], doc, picId } = templateInfo;

    if (!info.doc_md5) {
      delete info.doc_md5;
    }

    const newAssets = assets.filter(item => item.use_level === 1);

    const newData = {
      picId,
      ...info,
      assets: uniqBy(state.assets.concat(newAssets), 'resId'),
      canvasInfo: doc.canvas,
    };

    dispatch(templateInfoAction.setTemplateInfo(newData));
  }
  function updateApprovalUrl(url: string) {
    dispatch(
      templateInfoAction.setTemplateInfo({
        ...state,
        approval_url: url,
      }),
    );
  }

  return {
    templateInfo: state,
    templateScale,
    updateTemplateInfo,
    previewUrl,
    updateApprovalUrl,
  };
}

export function getReplaceWarn() {
  return store.getState().templateInfo.assets;
}

export function setReplaceWarn(assets: WarnAssetItem[]) {
  store.dispatch(templateInfoAction.updateReplaceWarn(assets));
}

export function useUpdateReplaceWarn() {
  return useFactory('assets');
}

export function useUpdateTitle() {
  return useFactory('title');
}

export function updateCanvasSize(size: { width: number; height: number }) {
  store.dispatch(templateInfoAction.updateCanvasInfo(size));
}

export function useUpdateCanvasInfo() {
  const { canvasInfo } = useAppSelector(state => state.templateInfo);

  return {
    update: updateCanvasSize,
    value: canvasInfo,
  };
}
export function getCanvasInfo() {
  return store.getState().templateInfo.canvasInfo;
}

export function useUpdateDocMd5() {
  return useFactory('doc_md5');
}

export function useUpdate() {
  return useFactory('doc_md5');
}
//  update md5
export function updateDocMd5(doc_md5: string) {
  store.dispatch(templateInfoAction.updateDocMd5(doc_md5));
}
//  update dataInfo
export function updateDataInfo(dataInfo: object) {
  store.dispatch(templateInfoAction.updateDataInfo(dataInfo));
}

//  update md5
export function updatePicId(picId: string) {
  store.dispatch(templateInfoAction.updatePicId(picId));
}
//  update cover_path
export function updateCoverPath(cover_path: string) {
  store.dispatch(templateInfoAction.updateCoverPath(cover_path));
}
//  update cover_time
export function updateCoverTime(cover_time: string) {
  store.dispatch(templateInfoAction.updateCoverTime(cover_time));
}
export function getTemplate() {
  return store.getState().templateInfo;
}
//  update canvasScale
export function updateCanvasScale(scale: number) {
  store.dispatch(templateInfoAction.updateCanvasScale(scale));
}

export function useCanvasScale() {
  return useFactory('canvasScale');
}

export function setLoadFinish() {
  store.dispatch(templateInfoAction.setLoadFinish(true));
}

export function useTemplateLoadStatus() {
  const { loadFinish } = useAppSelector(state => state.templateInfo);
  return loadFinish;
}
