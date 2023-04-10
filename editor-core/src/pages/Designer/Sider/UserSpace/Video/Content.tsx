import { useEffect } from 'react';
import { useSetState } from 'ahooks';

import AutoDestroyVideo from '@/components/AutoDestroyVideo';
import { checkUploadVideoStatus } from '@/api/images';
import {
  useDesignerVideoUpload,
  useCheckFileUploadStatus,
} from '@/hooks/useUploadVideo';
import ItemWrap from '../ItemWrap';

export default function Content({ item, onClick }: any) {
  const [data, setData] = useSetState<any>();

  function setUploadError() {
    setData({ step: 'error' });
  }

  function setUploadProgress(progress: number) {
    setData({ progress });
  }

  // 轮询视频处理状态
  const { run, cancel } = useCheckFileUploadStatus({
    request: checkUploadVideoStatus,
    onSucceed({ res }: any) {
      // console.log(res, res[Object.keys(res)[0]].step);
      if (res[Object.keys(res)[0]].step === 'done') {
        cancel();
        setData({ step: 'done' });
      }
    },
    onError: setUploadError,
  });

  const { uploadStat } = useDesignerVideoUpload({
    onSucceed: (res: any) => {
      setData(res.data);
    },
    onError: setUploadError,
    setProgress: setUploadProgress,
    uploadSucceed(res: any) {
      // 上传成功，轮询处理状态
      run([res.data.id]);
    },
  });

  useEffect(() => {
    if (item.step === 'pending') {
      uploadStat(item.file);
    } else if (item.step !== 'done') {
      // 轮询检查视频状态
    }
    setData({ ...item, progress: 0 });
  }, [item]);

  return (
    <ItemWrap
      title={item.title}
      duration={item.duration}
      onClick={(e: Event) => onClick(e, data)}
      step={data.step}
      progress={data.progress}
    >
      <AutoDestroyVideo
        poster={data.step === 'done' ? item.preview : ''}
        src={item.sample}
      />
    </ItemWrap>
  );
}
