import { mainHost } from '@/config/http';
import { stringify } from 'qs';

// 获取素材主列表数据
export function getMaterialList(params = { pageSize: 10 }) {
  return mainHost.get('/creator-api/resource/mix-material', {
    params,
  });
}

interface MaterialListParams {
  type: 'shape' | 'png' | 'lottie' | 'video' | 'gif';
  pageSize: number;
  page: number;
  class_id: number;
}

/**
 * @description 获取素材某个类型数据：`png元素`、`矢量图形`、`lottie动图`、`GIF动图`、`视频动图`
 * @param type
 * @param class_id 分类
 * */
export function getMaterialTypeList(params: MaterialListParams) {
  const { type, ...others } = params;
  return mainHost.get(
    `/creator-api/resource/material-${type}?${stringify(others)}`,
  );
}
// 获取某个类型的分类数据：`png元素`、`矢量图形`、`lottie动图`、`GIF动图`、`视频动图`、`图片`
export function getCatalogList(params: any) {
  switch (params.type) {
    case 'png':
      return mainHost.get('/label-api/material-png');
    case 'lottie':
      return mainHost.get('/label-api/material-lottie');
    case 'video':
      return mainHost.get('/label-api/material-video');
    case 'shape':
      return mainHost.get('/editor/shape-label-list');
    case 'td':
      return mainHost.get('/creator-api/search_labels/1230825');
    default:
      return new Promise(reject => {
        reject(1);
      });
  }
}

// 设计师端元素标签列表
export function getLabelList() {
  return mainHost.get('/designer-editor/asset-label-list');
}

// 元素列表
export function getAssetList(data: {
  page: number;
  pageSize: number;
  type: string;
  class_id: string | number;
}) {
  return mainHost.get(
    `/editor/asset-list?page=${data?.page}&pageSize=${data?.pageSize}&search_type=${data?.type}&class_id=${data?.class_id}`,
  );
}
// 遮罩转场列表
export function getOverlayTransitionList() {
  return mainHost.get(
    `/editor/asset-list?page=1&pageSize=30&class_id=2062&keyword=`,
  );
}
