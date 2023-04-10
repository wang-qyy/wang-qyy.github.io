import { mainHost } from '@/config/http';
import { stringify } from 'qs';

// 视频推荐数据
export function getRecommendVideoE() {
  return mainHost.get(`/label-api/video`);
}
/**
 * @description 转场数据
 * @description 转场class_id=2021
 * */
export function getVideoETransition() {
  return mainHost.get(`/editor/material-video?class_id=2021&page=1`);
}
interface GetVideoEProps {
  page: number;
  pageSize?: number;
  class_id?: number;
  keyword?: string;
  ratio?: string;
}
/**
 * @description 视频搜索数据
 * */
export function getVideoE(params: GetVideoEProps) {
  return mainHost.get(`/editor/material-video?${stringify(params)}`);
}
/**
 * 获取视频特效标签页数据
 * @returns
 */
export function getVideoEEffect() {
  return mainHost.get(`/resource-api/sub-fronts?filter_id=1230854`);
}
/**
 * 获取视频特效标签页数据
 * @returns
 */
export function getVideoEEffectList(params: {
  keyword: string;
  page: number;
  pageSize: number;
  class_id: number;
}) {
  return mainHost.get(
    `/resource-api/search?keyword=${params.keyword || ''}&filter_id=${
      params.class_id
    }&page_num=${params.page}&page_size=${params.pageSize}`,
  );
}
/**
 * 视频特效最近使用保存
 * @param params
 * @returns
 */
export function saveVideoEHistory(asset_id: string) {
  return mainHost.post(`/editor/set-history-record`, {
    data: {
      module_type: 'effect',
      asset_id,
    },
  });
}
export function getVideoEHistory(params: { page: number; pageSize: number }) {
  return mainHost.get(
    `/editor/get-history-record?module_type=effect&&page_num=${params.page}&page_size=${params.pageSize}`,
  );
}

// 获取视频信息
export function getVideoInfo(gid: string) {
  return mainHost.get(`/resource-api/info?gid=${gid}`);
}
