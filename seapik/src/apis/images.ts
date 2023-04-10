import { mainHost } from '@/config/http';
import { BaseListParams } from '@/typings';
import { stringify } from 'qs';

export function getImages(params: BaseListParams) {
  return mainHost.get(`/editor/audio-list`);
}
/**
 * @description 获取图片列表
 * @param
 */
export function getImagesList(params = { p: 1 }) {
  return mainHost.get(`/api/editor/get-list?${stringify(params)}`);
}
