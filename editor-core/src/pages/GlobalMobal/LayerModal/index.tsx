import { CSSProperties, PropsWithChildren } from 'react';

import { useLayersVisit } from '@/store/adapter/useGlobalStatus';
import useCanvasPlayHandler from '@/hooks/useCanvasPlayHandler';

import LayerPanel from '../../Content/Main/LayerPanel';

import DragableModal from '../../TopToolBar/DragableModal';

interface DraggableModalProps {
  className?: string;
  style?: CSSProperties;
}

export default function DraggableModal(
  props: PropsWithChildren<DraggableModalProps>,
) {
  const { className, ...others } = props;
  const { value, open, close } = useLayersVisit();

  const { isPlaying } = useCanvasPlayHandler();

  return (
    <DragableModal
      title="图层"
      visible={Boolean(value) && !isPlaying} // 播放的时候隐藏，防止选中元素操作冲突
      onCancel={close}
      style={{
        width: 220,
        height: 615,
        background: '#262E48',
      }}
    >
      <LayerPanel />
    </DragableModal>
  );
}
