import { useEffect, useRef, useState } from 'react';
import { Canvas } from '@hc/editor-core';

import {
  useSize,
  useDebounce,
  useRequest,
  useSetState,
  useUpdateEffect,
} from 'ahooks';
import { watermarkdetail } from '@/api/watermark';
import getUrlParams from '@/utils/urlProps';
import { useUpdateCanvasInfo } from '@/store/adapter/useTemplateInfo';
import { ViolationModal } from '@/components/ViolationModal';
import { useUserInfo } from '@/store/adapter/useUserInfo';
import { getScale } from '@/pages/Content/Main/CanvasScale/handler';
import { setCanvasInfo } from '@/kernel/store';
import { initData } from '../../handler';
import '../index.less';

interface SizeType {
  width: number;
  height: number;
}

export default function CanvasMain() {
  const { update: updateCanvasInfo } = useUpdateCanvasInfo();
  const { id: userId } = useUserInfo();
  const canvasRef = useRef<HTMLDivElement>(null);
  // 获取画布尺寸
  const size = useSize(canvasRef);
  const debouncedSize = useDebounce(size, {
    wait: 100,
  });

  const { run, data: { data } = {} } = useRequest(watermarkdetail, {
    manual: true,
  });

  const [canvas, setCanvas] = useState({
    width: 500,
    height: 500,
    scale: 1,
  });
  useEffect(() => {
    if (data?.video_scan_flag == 3) {
      ViolationModal({
        goHome: () => {
          window.open('https://xiudodo.com/watermark/');
        },
      });
      return;
    }
    if (!data || !debouncedSize.width) return;

    let scale = 1;

    const height = Number(data.height);
    const width = Number(data.width);

    scale = getScale({ width, height }, size as SizeType, 0.9, 110);

    setCanvas({ width, height, scale });

    const { source_path: url, video_time: duration, ...res } = data;

    updateCanvasInfo({ width, height });
    setCanvasInfo({ width, height });

    initData({ duration, url, ...res });
  }, [data, debouncedSize.width]);

  useUpdateEffect(() => {
    if (userId > -1) {
      const { params } = getUrlParams();
      run(params);
    }
  }, [userId]);

  return (
    <div ref={canvasRef} className="xiudodo-tools-canvas">
      <Canvas canvasInfo={canvas} />
    </div>
  );
}
