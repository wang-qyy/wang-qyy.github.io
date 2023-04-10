import useClipboardPaste from '@/hooks/useClipboardPaste';
import {
  assetBlur,
  getCanvasInfo,
  getCurrentAssetCopy,
  removeAsset,
  useCameraByObeserver,
  useGetCurrentAsset,
  useHistoryRecordByObserver,
} from '@/kernel';
import { copyAndPaste, pasteAsset, stopPropagation } from '@/utils/single';
// import { useHistoryByObserver } from '../../hooks/observer';

export const useToolOption = () => {
  const currentAsset = useGetCurrentAsset();
  const { start, inCamera } = useCameraByObeserver();
  const {
    value: { hasNext, hasPrev },
    goNext,
    goPrev,
  } = useHistoryRecordByObserver();
  const { analyPaste } = useClipboardPaste();

  return [
    {
      key: 'undo',
      text: '上一步',
      icon: 'iconchexiao1',
      show: true,
      isNew: false,
      onclick: goPrev,
      disable: !hasPrev,
    },
    {
      key: 'redo',
      text: '下一步',
      icon: 'iconchexiao1',
      iconStyles: {
        transform: 'rotateY(180deg)',
      },
      disable: !hasNext,
      show: true,
      isNew: false,
      onclick: goNext,
    },
    {
      key: 'copy',
      text: '复制',
      icon: 'icona-Frame6',
      disable: !currentAsset,
      show: true,
      isNew: false,
      onclick: async (e: React.MouseEvent) => {
        stopPropagation(e);
        const asset = getCurrentAssetCopy();
        if (!asset) return;
        copyAndPaste.copy({
          type: 'asset',
          data: asset,
          canvasInfo: getCanvasInfo(),
        });
        const blob = await analyPaste(undefined);
        if (!blob) {
          pasteAsset({ asset: currentAsset });
        }
      },
    },
    {
      key: 'delete',
      text: '删除',
      icon: 'iconicons8_trash',
      disable: !currentAsset,
      show: true,
      isNew: false,
      onclick: () => {
        if (!currentAsset) return;
        currentAsset && removeAsset(currentAsset);
        assetBlur();
      },
    },
    {
      key: 'camera',
      text: '镜头',
      icon: 'jingtou-duijiao',
      choosed: inCamera,
      iconStyles: {
        transform: 'rotateY(180deg)',
      },
      disable: false,
      show: true,
      isNew: true,
      onclick: () => {
        start();
      },
    },
  ];
};
