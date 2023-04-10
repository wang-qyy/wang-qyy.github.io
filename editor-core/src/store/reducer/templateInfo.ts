import { uniqBy } from 'lodash-es';
import { createSlice } from '@reduxjs/toolkit';
import getProps from '@/utils/urlProps';
import type { Assets, RGBA, PageAttr } from '@hc/editor-core';
import type { WarnAssetItem } from '@/typings/index';

// 保存

/** *
id:"草稿ID",
lastTemplId:"模板ID",
width:1920,
height:1080,
title:'',
doc:{
  pageAttr:{},
  work:[]
}
 * */

const urlProps = getProps();

interface DataInfo {
  class_ids: number[];
  description: string;
  id: number;
  tag_ids: number[];
  template_type: 4 | 41;
  title: string;
}

interface TemplateInfos {
  loadFinish: boolean; // 数据是否加载完成
  id: string;
  picId?: string; // 模板ID
  assets: Array<WarnAssetItem>; // 替换提醒
  title?: string;
  doc_md5: string; // 保存标识
  templateType: string;
  canvasInfo: { width: number; height: number };
  dataInfo: DataInfo | null;
  last_templ_id?: number;
  template_type?: string;
  templ_id: number;
  cover_path?: string; // 封面图片
  cover_time?: number; // 封面帧时间
  cover_url?: string; // 封面图片地址
  canvasScale: number;
  approval_url?: string; // 审批链接
  approval_status?: number; // 审批状态
}

export function getInit(): TemplateInfos {
  const isModule = urlProps.redirect === 'module';
  return {
    loadFinish: false,
    canvasScale: 0.1,
    id: urlProps.upicId ?? -1, // 用户保存后生成的草稿
    // lastTemplateId: urlProps.picId ?? -1, // 模板id
    templateType: '',
    title: '未命名的设计',
    doc_md5: '',
    assets: [],
    canvasInfo: isModule
      ? {
          width: 1920,
          height: 1080,
        }
      : {
          width: 1080,
          height: 1920,
        },
    templ_id: -3,
    dataInfo: null,
  };
}

export const counterSlice = createSlice({
  name: 'templateInfo',
  initialState: getInit(),
  reducers: {
    setTemplateInfo: (state, action) => {
      const data = { ...action.payload };
      if (data.id) {
        data.id = Number(data.id);
      }
      if (data.templateId) {
        data.templateId = Number(data.templateId);
      }
      Object.assign(state, data);
    },
    updateReplaceWarn: (state, action) => {
      state.assets = uniqBy(state.assets.concat(action.payload), 'resId');
    },
    updateTitle: (state, action) => {
      state.title = action.payload;
    },
    updateCanvasInfo: (state, action) => {
      state.canvasInfo = action.payload;
    },
    updateDataInfo: (state, action) => {
      state.dataInfo = action.payload;
    },

    updateDocMd5: (state, action) => {
      state.doc_md5 = action.payload;
    },
    updatePicId: (state, action) => {
      state.picId = action.payload;
    },
    updateCoverPath: (state, action) => {
      state.cover_path = action.payload;
    },
    updateCoverTime: (state, action) => {
      state.cover_time = action.payload;
    },
    updateCanvasScale(state, action) {
      state.canvasScale = action.payload;
    },
    setLoadFinish(state, action) {
      state.loadFinish = action.payload;
    },
  },
});
const templateInfoReducer = counterSlice.reducer;
const templateInfoAction = counterSlice.actions;
export { templateInfoReducer, templateInfoAction };
