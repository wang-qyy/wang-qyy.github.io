import { mainHost } from '@/config/http';
import { stringify } from 'qs';

// 视频推荐数据
export function getRecommendMask() {
  return mainHost.get(`/editor/module-label-list`);
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
 *
 * @description 转场class_id=2021
 * */
export function getMask(params: GetVideoEProps) {
  return mainHost.get(`/editor/module-list?${stringify(params)}`);
}
