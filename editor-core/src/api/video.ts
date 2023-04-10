import { stringify } from 'qs';
import { mainHost } from '@/config/http';

// 获取图片主页列表
export function getMixVideo() {
  return mainHost.get(`/creator-api/resource/mix-video`);
}

interface getVideoListParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  is_portrait?: string | number;
  type?: 'bg' | 'sp' | 'tx'; // bg-背景、sp-实拍视频、tx-特效
  class_id?: number; // 分类id
  ratio?: 0 | 1 | 2; // 0=方，1=横，2=竖
}

// 获取视频列表
export function getVideo(data: getVideoListParams = { pageSize: 40 }) {
  return mainHost.get(
    `/creator-api/resource/video-${data.type}?${stringify(data)}`,
  );
}

interface getVideoClassifyParams {
  type?: 'bg' | 'sp'; // bg-背景、sp-实拍视频
}
export function getVideoClassify(params: getVideoClassifyParams) {
  return mainHost.get(`/label-api/designer-video-label?${stringify(params)}`);
}
