import { useRequest } from 'ahooks';
import { Modal } from 'antd';
import { getImageInfo } from '@/apis/global';

export function openErrorModal() {
  Modal.confirm({
    title: "Something wen't wrong",
    content: 'This template cannot be loaded',
    okText: 'Search more images',
    cancelText: 'Try again',
    onCancel: refresh,
    onOk() {
      window.open('https://pngtree.com/free-backgrounds', '_blank');
    },
  });
}

function refresh() {
  window.location.reload();
}

// 获取初始化信息
export function useGetImage({
  onSuccess,
  onError,
}: {
  onSuccess: (res: any, params: any) => void;
  onError?: (e: Error) => void;
}) {
  return useRequest(getImageInfo, {
    manual: true,
    onSuccess(res, params) {
      if (res.code === 200) {
        onSuccess(res.data, params[0]);
      } else {
        openErrorModal();
      }
    },
    onError(err) {
      onError?.(err);
    },
  });
}
