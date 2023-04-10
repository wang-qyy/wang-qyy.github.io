import { getFileType } from '@/pages/SidePanel/Upload/FileItem';
import { useFileUpload } from '@/pages/SidePanel/Upload/handler';
import {
  usePasteModal,
  usePasteStatus,
  useUserBindPhoneModal,
} from '@/store/adapter/useGlobalStatus';
import { handleAddAsset } from '@/utils/assetHandler';
import { message } from 'antd';
import { getMemoryInfo } from '@/api/upload';
import { getInitFontAttribute } from '@/utils/single';
import getUrlParams from '@/utils/urlProps';

const useClipboardPaste = () => {
  // 上传中的提示信息key值
  const messageKey = 'clipboardPaste';
  const { showBindPhoneModal } = useUserBindPhoneModal();
  const { setPasteStatus } = usePasteStatus();
  const { open } = usePasteModal();
  const buildAddImg = (data: any) => {
    const ids = { resId: `f${data.file_id}`, ufsId: `f${data.id}` };
    return {
      meta: {
        isUser: true,
        type: getFileType(data.fileInfo.mime_type),
      },
      attribute: {
        ...ids,
        width: data.fileInfo.width,
        height: data.fileInfo.height,
        picUrl: data.fileInfo.cover_path,
        rt_preview_url: data.fileInfo.cover_path,
      },
    };
  };
  const analyPaste = async e => {
    try {
      const data = await navigator.clipboard.read();
      let blob: Blob;
      if (e) {
        const dataTransferItemList = e.clipboardData.items;
        // 过滤非图片类型
        const items = [].slice
          .call(dataTransferItemList)
          .filter(function (item) {
            return item.type.indexOf('image') !== -1;
          });
        if (items.length > 0) {
          const dataTransferItem = items[0];
          blob = dataTransferItem.getAsFile();
        }
      }
      if (!blob && !e) {
        const data = await navigator.clipboard.read();
        if (data.length > 0) {
          const clipboardItem = data[0];
          // 过滤非图片类型
          const items = clipboardItem.types.filter(item => {
            return ['image/png', 'image/jpeg'].includes(item);
          });
          if (items.length > 0) {
            blob = await clipboardItem.getType('image/png');
          }
        }
      }
      if (blob && !['designer', 'module'].includes(getUrlParams().redirect)) {
        // 粘贴剪切板的内容
        clipboardPaste(blob);
        return true;
      }
      return false;
    } catch (err) {
      if (err.message.indexOf('Read permission denied') > -1) {
        open();
        return true;
      }
      return false;
    }
  };
  const buildFileName = (type: 'image/png' | 'image/jpeg') => {
    if (type === 'image/png') {
      return `image${Date.now()}.png`;
    }
    return `image${Date.now()}.jpeg`;
  };
  const clipboardPaste = async (blob: Blob) => {
    const file = new File([blob], buildFileName(blob.type), {
      type: blob.type,
    });
    // 获取用户空间数据
    const memory = await getMemoryInfo();
    if (memory.data.maxMemoryByte - memory.data.useMemoryByte >= file.size) {
      message.info({
        content: '文件资源上传中…',
        key: messageKey,
        duration: 0,
      });
      setPasteStatus(1);
      uploadStat(file);
    } else {
      message.info({ content: '存储空间已满', maxCount: 1 });
    }
  };
  const { uploadStat } = useFileUpload({
    onSucceed: res => {
      // 关闭上传中弹窗
      message.destroy(messageKey);
      handleAddAsset(buildAddImg(res));
      message.success('上传成功!');
      setPasteStatus(2);
      // 刷新用户的上传列表
    },
    onError(res, { isNotAllow, bindPhone } = {}) {
      // 关闭上传中弹窗
      message.destroy(messageKey);
      message.error(res?.msg);
      setPasteStatus(-1);
      if (bindPhone) {
        showBindPhoneModal();
      }
    },
  });
  return { clipboardPaste, analyPaste };
};
export default useClipboardPaste;
