// 审批相关
import { mainHost } from '@/config/http';
import getUrlProps from '@/utils/urlProps';
import { message } from 'antd';
/**
 * 发起审批
 * @param params
 * @returns
 */
export function checkShare(upicId: string) {
  const params = {
    // 分享类型
    share_type: 2,
    type: 'video',
    // 分享版本号
    version_id: 0,
    template_id: upicId,
  };
  return mainHost.post('/api/get-edit-share', {
    body: JSON.stringify(params),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
}
/**
 * 获取分享审批链接
 * @returns
 */
export function getShareLink(upicId: string) {
  return mainHost.get(`/api/get-edit-share-link?template_id=${upicId}`);
}
