import { mainHost } from '@/config/http';
/**
 * type 动画类型：in-进场动画；out-出场动画；stay-驻场动画；free-自由动画
 * title 动画名称
 * json_ae 原始lottile动画数据 string类型
 * json_kw 动画路径数据 string类型
 */
export function saveAnimation(params: {
  type: string;
  title: string;
  json_ae: string;
  json_kw: string;
}) {
  return mainHost.post(`/creator-api/my/save-animation`, {
    data: params,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
// 获取我的动画列表
export function getMyAnimation({ page, type }: { page: number; type: string }) {
  return mainHost.get(`/creator-api/my/animations?page=${page}&type=${type}`);
}
// 删除单个
export function deleteAnimation(id: string) {
  return mainHost.post(`/creator-api/my/delete-animation`, {
    data: { id },
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
