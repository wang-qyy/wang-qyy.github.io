import { mainHost } from '@/config/http';
import { stringify } from 'qs';

// 字体列表
export function getSpecificWordList() {
  return mainHost.get('/apiv2/get-specific-word-list');
}

/**
 * 特效列表
 * @param {number} pageIndex
 * @param {number} pageSize
 * @param {'in' | 'stay' | 'out'} type
 * @returns
 */
export function getAnimationList(
  pageIndex: number,
  pageSize: number,
  type: string, // in-进场动画 、out-出场动画
) {
  // const urlProps = getProps();
  // 判断清除动画列表缓存
  // let prep = '';
  // if (urlProps.prep) {
  //   prep = '&prep=1';
  // }
  return mainHost.get(
    `/api-video/edit-video-asset-v2?page=${pageIndex}&pageSize=${pageSize}&type=${type}`,
  );
}

/**
 * 动画列表
 * */
export function getAnimationListV3() {
  return mainHost.get(`/api-video/edit-video-asset-v6`);
}

/**
 * 元素动画列表
 * */
export function getAnimationListV5() {
  return mainHost.get(`/api-video/edit-video-asset-v6`);
}

/**
 * 获取特效字详情
 */
export function getSpecificWordInfo(id: number) {
  return mainHost.get(`/apiv2/get-specific-word-info-new?id=${id}`);
}
// 获取花字列表
export function getSignatureList() {
  return mainHost.get('/creator-api/config/colorful-presets-v2');
}
