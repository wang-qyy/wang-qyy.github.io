import { mainHost } from '@/config/http';
import getUrlProps from '@/utils/urlProps';
import { stringify } from 'qs';
import { ReactText } from 'react';
import { getCanvasInfo } from '@/store/adapter/useTemplateInfo';
import { PageAttr } from '@hc/editor-core';
import { WarnAssetItem } from '@/typings/index';

export interface TemplateInfo {
  assets: WarnAssetItem[];
  doc: {
    pageAttr: {
      pageInfo: PageAttr['pageInfo'][];
    };
    work: any[];
  };
  info: any;
}

// 模板详情
export const getTemplateInfo = (params: {
  picId?: ReactText;
  upicId?: ReactText;
  template_type?: number;
  shareId?: string;
  template_version?: string; // 模板版本
}): Promise<TemplateInfo> => {
  const { template_type = 4, ...others } = params;

  return mainHost.get(
    `/api/user-get-templ?${stringify(others)}&template_type=${template_type}`,
  );

  // return mainHost.get(
  //   `/api/user-get-templ?picId=${params.picId}&upicId=${params.upicId}&template_type=${template_type}&shareId=${params?.shareId}`,
  // );
};

// 模板分类
export const getTemplateCategories = () => {
  return mainHost.get(`/video/templ-class`);
};

export interface FilterItem {
  active: number;
  id: number;
  name: string;
  params: any;
  parent_id: number;
}

export interface TemplateClassify {
  classes: Record<'c' | 'g' | 'i', FilterItem[]>;
  shape: FilterItem[];
  tags: {
    st: FilterItem[];
  };
}

// 模板详情（新）级联分类
export const getTemplateClassify = (params = ''): Promise<TemplateClassify> => {
  return mainHost.get(`/api/get-template-filter?params=${params}`);
};

// 模板列表
// export const getTemplateList = (params: {
//   keyword: String;
//   page: number; // 当前页
//   ratio?: number; // -1 | 1 | 2; // -1全部 | 1 横图| 2 竖图
//   class_id: number;
//   sort_type: null;
// }) => {
//   // ?w={$keyword}&p=1&ratioId=-1(-1全部 | 1 横图| 2 竖图 )&class_id=760_{$二级分类}_{$三级分类}*template_type=4
//   return mainHost.get(
//     `/api/get-template-list?w=${params.keyword}&p=${params.page}&ratioId=${params.ratio}&class_id=${params.class_id}&template_type=4&sort_type=${params.sort_type}`,
//   );
// };

export interface TemplateItem {
  id: number;
  template_id: number;
  jump: number;
  title: string;
  width: number;
  height: number;
  preview_url: string;
  imgUrl: string;
  host: string;
  small_url: string;
  pages: number;
  isFav: number;
  duration: number;
  position: number;
}

export interface TemplateList {
  count: number;
  items: TemplateItem[];
  page: number;
  pageTotal: number;
  totalCount: number;
  data: TemplateList; // 兼容非 useRequest
}

// 获取模板列表（新）
export const getTemplateList = (params = { p: 1 }): Promise<TemplateList> => {
  return mainHost.get(`/api/get-template-list-v2?${stringify(params)}`);
};

// 获取场景列表（新）
export const getTemplateSingleList = (
  params = { p: 1 },
): Promise<TemplateList> => {
  return mainHost.get(
    `/api/get-template-single-list?${stringify(getCanvasInfo())}&${stringify(
      params,
    )}`,
  );
};
// 获取收藏列表（新）
export const getFavList = ({ ratio = '', page = 1 }) => {
  return mainHost.get(
    `/template/fav-list?ratio=${ratio}&page=${page}&pageSize=${40}`,
  );
};

// 获取草稿列表（新）
export const getDraftList = ({ ratio = '', page = 1 }) => {
  return mainHost.get(
    `/template/draft-list?ratio=${ratio}&page=${page}&pageSize=${40}`,
  );
};

// 用户 - 获取收藏列表
export const getNormalUserFavList = () => {
  return mainHost.get(`/apiv2/get-fav-template?template_type=4&prep=1`);
};

// 收藏模板
export const setFavTemplate = (templId: number) => {
  return mainHost.get(`/apiv2/add-fav-template?tid=${templId}`);
};

// 取消收藏模板
export const delFavTemplate = (templId: number) => {
  return mainHost.get(`/apiv2/del-fav-template?tid=${templId}`);
};

// 用户 - 获取模板可编辑帧相关
export function getUserEditableDatas(tempId?: number | string) {
  const urlProps = getUrlProps();
  return mainHost.get(
    `/video/get-movie-editable?tid=${tempId}&utid=${urlProps.upicId}`,
  );
}

// 创建模板
export function designerCreateTemplate(params: any) {
  return mainHost.post('/creator-api/template', {
    body: JSON.stringify(params),
    // headers: {
    //   'Content-Type': 'text/plain;charset=UTF-8',
    // },
  });
}
// 保存模板
export function designerUpdateTemplate(params: any) {
  return mainHost.post(`/creator-api/template/${params.id}`, {
    body: JSON.stringify(params),
  });
}
// 获取模板
export function designerGetTemplate(
  templateId: number,
  renovate_type?: 'cover' | 'new',
) {
  return mainHost.get(
    `/creator-api/template/${templateId}?renovate_type=${
      renovate_type ?? ''
    }&time=${Date.now()}`,
  );
}

// 获取模板分类列表
export function designerGetLabelList() {
  return mainHost.get(`/template/label-list`);
}

// 创建文件副本
export function getCopyDraft(params: any) {
  return mainHost.post(`/workspace/copy-draft`, {
    data: params,
  });
}
