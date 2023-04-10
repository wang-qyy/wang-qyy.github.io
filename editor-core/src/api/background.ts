import { mainHost } from '@/config/http';
import { stringify } from 'qs';

// 获取背景主页列表
export function getMixBackground() {
  return mainHost.get(`/creator-api/resource/mix-background`);
}

// 获取背景视频列表
export function getBackgroundVideo(data: {
  page: number;
  pageSize: number;
  keyword: string;
  class_id: string | number;
  w?: number;
  h?: number;
}) {
  return mainHost.get(
    `/creator-api/resource/background-video?${stringify(data)}`,
  );
}

interface GetBackgroundImageParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  class_id?: string | number;
  tag_id?: string | number;
  ratio?: string | number;
  type?: 'module';
}
// 获取背景图片列表
export function getBackgroundImage(data: GetBackgroundImageParams) {
  const { page = 1, pageSize = 8, ...others } = data;
  return mainHost.get(
    `/creator-api/resource/background-image?page=${page}&pageSize=${pageSize}&${stringify(
      others,
    )}`,
  );
}

// 获取图片背景标签
export function getBgImage() {
  return mainHost.get(`/label-api/bg-image`);
}

// 获取视频背景标签
export function getBgVideo() {
  return mainHost.get(`/label-api/bg-video`);
}

// 背景搜索
export function getSearchBack(params: any) {
  const {
    resource_flag,
    keyword = '',
    filter_id = '',
    page = '1',
    pageSize = 30,
    shape = 'w',
  } = params;
  return mainHost.get(
    `/resource-api/search?resource_flag=${resource_flag}&keyword=${keyword}&filter_id=${filter_id}&page_num=${page}&page_size=${pageSize}&shape=${shape}`,
  );
}
// 背景标签
export function getSubFronts(filter_id: string) {
  return mainHost.get(`/resource-api/sub-fronts?filter_id=${filter_id}`);
}

// 背景分类标签
export function getSubFilter(filter_id: string) {
  return mainHost.get(`/resource-api/sub-filters?filter_id=${filter_id}`);
}
