import {
  useCurrentTemplate,
  getCurrentTemplate,
  useTemplateClip,
  getTemplateIndexById,
  getRelativeCurrentTime,
} from '@hc/editor-core';

import { useSetState } from 'ahooks';
import { handleAddAsset } from '@/utils/assetHandler';

export function useExpandPageTime() {
  const { template } = useCurrentTemplate();
  const currentTempIndex = template ? getTemplateIndexById(template.id) : 0;

  const [value, update] = useTemplateClip(currentTempIndex);

  function check(cut: Cut) {
    const cutDuration = cut.cet - cut.cst;

    const shouldExpandTime =
      cutDuration -
      (getCurrentTemplate().videoInfo.allAnimationTime -
        getRelativeCurrentTime());

    if (shouldExpandTime > 0) {
      update([value[0], -shouldExpandTime + value[1]]);
    }
  }

  return [check];
}

interface Cut {
  cst: number;
  cet: number;
}

export function useBeforeAddVideo({
  data = {},
  attribute,
  meta = { type: 'videoE', isBackground: false },
}: {
  isBackground?: boolean;
  type?: 'video' | 'videoE';
  data: any;
  onOk?: (attribute: any) => void;
  attribute?: {
    resId?: string;
    ufsId?: string;
    isUser?: boolean;
    voiced?: boolean;
    volume: number;
  };
  meta?: {
    type: 'video' | 'videoE';
    isBackground?: boolean;
  };
}) {
  const [expandPageTime] = useExpandPageTime();

  const [state, setState] = useSetState({
    visible: false,
  });

  const { preview, sample, total_frame, height, width, frame_file, duration } =
    data;
  const assetAttribute = {
    resId: data.id,
    rt_url: sample,
    rt_preview_url: preview,
    rt_frame_url: preview,
    rt_total_frame: total_frame,
    rt_frame_file: frame_file,
    rt_total_time: duration,
    height,
    width,
    ...attribute,
  };

  function openClipModal() {
    setState({ visible: true });
  }

  function closeClipModal() {
    setState({ visible: false });
  }

  function onAdd(cut: Cut) {
    const currentTime = getRelativeCurrentTime();

    Object.assign(assetAttribute, {
      ...cut,
      startTime: currentTime,
      endTime: currentTime + (cut.cet - cut.cst),
    });

    expandPageTime(cut);

    setTimeout(() => {
      handleAddAsset({ meta, attribute: assetAttribute });
      closeClipModal();
    });
  }

  function check() {
    openClipModal();
  }

  return { check, openClipModal, closeClipModal, state, onAdd };
}
