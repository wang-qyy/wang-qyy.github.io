import { stringify } from 'qs';
import { mainHost } from '@/config/http';
import { Online } from '@/utils/typing';

/**
 * @description 获取字体列表
 */
export function getFontList() {
  return mainHost.get('/api/editor/get-fonts');
}

/**
 * @description 获取图片
 */
export function getImageInfo(
  params: { pid: string; source_from: 'pngtree' | string; token?: string } = {
    pid: '1935412',
    source_from: 'pngtree',
  },
) {
  return mainHost.get(`/api/editor/get-content?${stringify(params)}`);
}

/**
 * @description 获取图片滤镜了表
 */
export function getImageFilters() {
  return mainHost.get('/api/editor/get-filters');
}

/**
 * @description 图片合成
 */
export function submitDoc(data: {
  doc: any;
  source_from?: string;
  pid?: string;
  format: 'jpg' | 'png';
  draft_id?: number;
  online?: Online;
  is_designer?: 0 | 1;
}) {
  return mainHost.post(`/api/editor-download/down-file`, { data });
}

/**
 * @description 合成状态轮询
 * */
export function downloadPolling(jobId: string) {
  return mainHost.get(`/api/editor-download/down-status?jobId=${jobId}`);
}

/**
 * @description 获取草稿列表
 * @params draft_id 草稿ID 有值获取单个草稿详情，无值获取草稿列表
 * */
export function getDraft(
  params: { draft_id?: number; is_designer?: 0 | 1 } = { is_designer: 0 },
) {
  return mainHost.get(`/api/editor/get-design-content?${stringify(params)}`);
}
