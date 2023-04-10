import { mainHost } from '@/config/http';
import { stringify } from 'qs';

// 获取图片主页列表
export function getMixImage() {
  return mainHost.get(`/creator-api/resource/mix-image`);
}

// 获取照片列表
export function getPicImage(data: {
  page: number;
  pageSize: number;
  keyword: string;
  is_portrait: string | number;
}) {
  return mainHost.get(
    `/creator-api/resource/pic-image?page=${data.page}&pageSize=${data.pageSize}&keyword=${data.keyword}&is_portrait=${data.is_portrait}`,
  );
}

// 获取创意背景列表
export function getCreativeImage(data: {
  page: number;
  pageSize: number;
  keyword: string;
}) {
  return mainHost.get(
    `/creator-api/resource/creative-bg-image?page=${data.page}&pageSize=${data.pageSize}&keyword=${data.keyword}`,
  );
}

// 获取插画列表
export function getIllustrationImage(data: {
  page: number;
  pageSize: number;
  keyword: string;
}) {
  return mainHost.get(
    `/creator-api/resource/illustration-image?page=${data.page}&pageSize=${data.pageSize}&keyword=${data.keyword}`,
  );
}

// 设计师端个人图库列表
export function getUserImages(params: { page: number }) {
  return mainHost.get(`/creator-api/my/image?${stringify(params)}`);
}

// 设计师端个人视频列表
export function getUserVideoE(params: {
  page: number;
  scope_type: 'bg' | 'lottie';
}) {
  return mainHost.get(`/creator-api/my/video?${stringify(params)}`);
}

// 用户上传图片
export function uploadImage(name: string, type: string, size: number) {
  return mainHost.get(
    `/creator-api/upload/image-payload?name=${name}&type=${type}&size=${size}`,
  );
}

// 用户上传视频
export function uploadVideo(name: string, type: string, size: number) {
  return mainHost.get(
    `/creator-api/upload/video-payload?name=${name}&type=${type}&size=${size}`,
  );
}

export function checkUploadVideoStatus(ids: Array<string>) {
  return mainHost.post(`/creator-api/my/video-status`, {
    data: JSON.stringify({ ids }),
  });
}
