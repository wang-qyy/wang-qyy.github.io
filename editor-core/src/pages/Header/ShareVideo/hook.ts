import { handleSave } from '@/utils/userSave';

import { useCheckLoginStatus } from '@/hooks/loginChecker';
import { useUserBindPhoneModal } from '@/store/adapter/useGlobalStatus';
import { getUserInfo } from '@/store/adapter/useUserInfo';
import { checkShare, getShareLink } from '@/api/checkShare';
import { useTemplateInfo } from '@/store/adapter/useTemplateInfo';
import urlProps from '@/utils/urlProps';
import { message } from 'antd';

export function useCheckShare(callback?: () => void) {
  // 链接生成中的提示信息key值
  const messageKey = 'approval_doing';
  const { checkLoginStatus } = useCheckLoginStatus();
  const userInfo = getUserInfo();
  const { showBindPhoneModal } = useUserBindPhoneModal();
  const { templateInfo, updateApprovalUrl } = useTemplateInfo();
  const hide = () => {
    message.destroy(messageKey);
  };
  const approvalShare = (upicId: string) => {
    checkShare(upicId).then(res => {
      if (res?.stat === 1) {
        updateApprovalUrl(res.url);
        window.open(`https://pre.xiudodo.com${res.url}`);
        hide();
      } else {
        message.error(res?.msg);
        hide();
      }
    });
  };
  const getApprovalLink = (upicId: string) => {
    getShareLink(upicId).then(res => {
      if (res?.stat === 1) {
        hide();
        // status=1为doc对比不相同，重新请求审批链接
        if (res.data.status === 1) {
          approvalShare(upicId);
        } else {
          window.open(`https://pre.xiudodo.com${templateInfo.approval_url}`);
        }
      } else {
        message.error(res?.msg);
        hide();
      }
    });
  };

  const toApprovel = () => {
    if (!checkLoginStatus()) {
      if (userInfo?.bind_phone !== 1) {
        showBindPhoneModal();
      } else {
        message.loading({
          content: '正在生成分享链接',
          key: messageKey,
          duration: 0,
        });
        handleSave({
          onSuccess: res => {
            // approvalUrl为空表示没有审批过，直接请求审批链接
            if (
              !templateInfo.approval_url ||
              templateInfo.approval_url === ''
            ) {
              approvalShare(res.info.id);
            } else {
              getApprovalLink(res.info.id);
            }
          },
        });
      }
    }
  };
  return { toApprovel };
}
