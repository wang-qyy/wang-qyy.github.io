import { message } from 'antd';
import { useRequest } from 'ahooks';
import { useUserInfo, getUserId } from '@/store/adapter/useUserInfo';
import { getUserInfo } from '@/api/user';
import { useLoginModal } from '@/store/adapter/useGlobalStatus';

interface useCheckLoginStateProps {
  onSuccess?: () => void;
  tip?: boolean;
  loop?: boolean; // 是否开始轮询
}

export function useCheckLoginStatus() {
  const { open: openLoginModal } = useLoginModal();

  const checkLoginStatus = () => {
    const userId = getUserId();
    // todo 排查点击下载无反应
    console.log('loginStatus', userId > -1);

    if (userId < 0) {
      openLoginModal();
      return true;
    }

    return false;
  };

  return { checkLoginStatus };
}
