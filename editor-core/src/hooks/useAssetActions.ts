import {
  removeAsset,
  assetBlur,
  getCurrentAsset,
  removeTemplate,
  getCurrentTemplate,
  useAllTemplateVideoTimeByObserver,
  setCurrentTime,
  getVideoCurrentTime,
  removeAudio,
  AssetClass,
} from '@hc/editor-core';
import { Modal } from 'antd';

export function deleteTemplateModal() {
  Modal.confirm({
    title: '确定要删除片段吗',
    content: '删除片段将清除片段内的所有元素，请谨慎操作',
    okText: '确认',
    cancelText: '我再想想',
    onOk() {
      // 删除元素为背景就将此模板删除
      const currentTemp = getCurrentTemplate();
      setCurrentTime(0, false);
      removeTemplate(currentTemp.id);
    },
  });
}

// 删除元素
export function useRemoveAsset() {
  const [allVideoTime] = useAllTemplateVideoTimeByObserver();

  const handleRemoveAsset = (asset?: AssetClass) => {
    const currentAsset = getCurrentAsset();

    const delAsset = asset || currentAsset;

    const assetMark = delAsset?.parent ?? delAsset;

    if (assetMark) {
      removeAsset(assetMark);
      assetBlur();
      setTimeout(() => {
        if (allVideoTime < getVideoCurrentTime()) {
          setCurrentTime(allVideoTime, false);
        }
      });
    }
  };

  return { handleRemoveAsset };
}

export function handleRemoveAudio(audioId: number) {
  removeAudio(audioId);
}

// 删除配乐
export function useRemoveAudio() {
  return { handleRemoveAudio };
}
