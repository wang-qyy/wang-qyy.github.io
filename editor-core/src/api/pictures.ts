import { mainHost } from '@/config/http';
import { stringify } from 'qs';

// word: string, p: number, k2: number
export function getShapeList(p: number) {
  return mainHost.get(`/apiv2/search-asset-container?p=${p}`);
}

// 个人图库
export function getUserPictures(p: number) {
  return mainHost.get(`/api/get-user-asset-list-v2?p=${p}`);
}

// 删除个人上传图片
export function delUserPicture(id: string) {
  return mainHost.get(`/api/del-user-asset?id=${id}`);
}

// 云端图片库
export function getPictureList({ p, w }: { p: number; w?: string }) {
  return mainHost.get(`/api/get-asset-list-v2?w=${w || ''}&p=${p}`);
}

// 收藏常见图库
export function setFavAsset(assetId: number) {
  return mainHost.get(`/apiv2/fav-asset?assetId=${assetId}`);
}

// 取消收藏图库
export function unsetFavAsset(assetId: number) {
  return mainHost.get(`/apiv2/del-fav-asset?assetId=${assetId}`);
}

// 获取个人视频列表
export function getUserVideo(p: number) {
  return mainHost.get(`/api/get-user-video-e-list-v2?p=${p}`);
}

// 删除个人上传视频
export function delUserVideo(id: number) {
  return mainHost.post(`/api/del-user-video-e`, {
    body: `id=${id}`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
}

// 视频图片上传
/**
 * @description 用户端 - 视频替换 - 获取上传的路径名称
 * @param filename
 * @returns {Promise<Response>}
 */
export function videoGetCdnName(filename: string) {
  return mainHost.get(
    `/qiniu/cdn-name?filename=${filename}&root=ips_user_video_e`,
  );
}

/**
 * @description 用户端 - 视频替换 - 获取签名
 * @param filename
 * @param cdnName
 * @returns {Promise<Response>}
 */
export function videoUploadOssForm(filename: string, cdnName: string) {
  return mainHost.get(
    `/api/video-upload-oss-form?filename=${filename}&cdnName=${cdnName}`,
  );
}

// 上传图片 获取上传oss的表单信息
export function getUploadOssForm(filename: string, orientationFlag: number) {
  return mainHost.get(
    `/api/upload-oss-form?filename=${filename}&value_hint=${0}&orientationFlag=${orientationFlag}`,
  );
}

// 上传图片 获取logo水印上传oss的表单信息
export function getLogoUploadOssForm(
  filename: string,
  orientationFlag: number,
  file_md5: any,
) {
  return mainHost.get(
    `/file/get-logo-up-params?filename=${filename}&orientationFlag=${orientationFlag}&file_md5=${file_md5}`,
  );
}

// 上传
export function getAliInfo(data) {
  const formData = new FormData();
  Object.keys(data).forEach(item => {
    formData.append(item, data[item]);
  });

  return mainHost.post(`https://xiudodo-pic.oss-cn-shanghai.aliyuncs.com`, {
    data: formData,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

// 获取视频上传 处理状态
export function userVideoUploadStat(key: number) {
  return mainHost.post(`/api/user-video-e-upload-stat`, {
    data: `key=${key}`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
}

// 获取手机上传二维码
export function getPhoneUploadQRcode(type: string) {
  return mainHost.get(`/api/get-phone-upload?upload_type=${type}`);
}

// 获取手机上传二维码
export function getPhoneUploadQRcodeV2(folder_id = '0') {
  return mainHost.get(`/file/get-phone-up-url?folder_id=${folder_id}`);
}

// 查看二维码是否过期
export function checkPhoneUploadQRcode() {
  return mainHost.get(`/api/check-phone-upload`);
}

// 元素标签列表
export function assetLabelList() {
  return mainHost.get(`/editor/asset-label-list`);
}

interface assetListElePramas {
  page: number;
  pageSize: number;
  keyword: string;
  search_type: 'asset' | 'lottie' | 'svg' | 'mask' | 'image' | 'gif';
  class_id?: number;
}
/**
 * 元素列表
 * @param class_id 搜索时不需要传
 * @param keyword 搜索关键词
 * @param search_type 'asset' | 'lottie' | 'svg' | 'mask' | 'image' | 'gif';
 */
export function assetListEle(data: assetListElePramas) {
  if (data?.keyword) {
    return mainHost.get(`/editor/asset-list?${stringify(data)}`);
  }
  return mainHost.get(`/editor/asset-list?${stringify(data)}`);
}

interface AssetListParams {
  page: number;
  pageSize?: number;
  kid?: string;
  keyword?: string; // 搜索关键词
  isHot?: 0 | 1; // 是否热门
  isNew?: 0 | 1; // 是否最新
  isElite: 0 | 1; // 是否精品
  isPortrait: 0 | 1; // 是否人像
  label_id?: string; // 分类标签ID
}
// 图片列表
export function assetList(data: AssetListParams) {
  return mainHost.get(
    `/home-api/asset-list?kid_1=${data.kid || ''}&label_id=${data.labelId || ''
    }&is_portrait=${data.isPortrait || ''}&page=${data.page || 1}&pageSize=${data.pageSize || 30
    }&keyword=${data.keyword || ''}&is_hot=${data.isHot || ''}&is_new=${data.isNew || ''
    }&is_elite=${data.isElite || ''}`,
  );
}
// 添加最近使用
export function addHistoryRecord(data: object) {
  return mainHost.post(`/editor/set-history-record`, {
    body: `asset_id=${data.id}&asset_type=${data.asset_type}`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
}
export function getHistoryRecord(data = { page: 1, pageSize: 3 }) {
  return mainHost.get(`/editor/asset-list?${stringify(data)}&search_type=used`);
}
// 获取草稿列表
export function getUserDrafts() {
  return mainHost.get(`/apiv2/get-user-drafts`);
}

// 获取收藏模板列表
export function getFavTemplate() {
  return mainHost.get(`/apiv2/get-fav-template-v2`);
}

// 获取收藏图片列表
export function getFavImage() {
  return mainHost.get(`/apiv2/get-fav-image-v2`);
}

// 获取蒙版
export function getMaskList(p: number) {
  return mainHost.get(`/editor/mask-list?page=${p}&pageSize=30`);
}

// 获取抠图信息
export function getPkgInfo() {
  return mainHost.get('/matting/get-pkg-info');
}

// 获取抠图结果
export function getCheckMattig(id: string | number) {
  return mainHost.post('/matting/check-matting', {
    data: `ids=${id}`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
}

// 执行抠图
export function getEditorMatting(id: string, u_file_id: string) {
  return mainHost.post('/matting/editor-matting', {
    data: `file_id=${id}&u_file_id=${u_file_id}`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
}
