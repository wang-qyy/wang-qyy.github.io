import { useEffect, memo, useState, useMemo } from 'react';
import { useSetState } from 'ahooks';

import { useAudioUpload } from '@/hooks/useUploadAudio';

import ItemWrap from '../ItemWrap';

function Content({ item, onClick }: any) {
  const [data, setData] = useSetState<any>();

  const { uploadStat } = useAudioUpload({
    onSucceed: (res: any) => {
      // setData({ ...res });
      setTimeout(() => {
        setData({ ...res.data, step: 'done' });
      }, 1000);
    },
    onError: () => {
      setData({ step: 'error' });
    },
    setProgress(progress: number) {
      setData({ progress });
    },
  });

  useEffect(() => {
    if (item.step === 'pending') {
      uploadStat(item.file, 'image');
    }
    setData({ ...item, progress: 0 });
  }, [item]);

  return (
    <ItemWrap
      key={`user-space-upload-video-${item.id}`}
      title={data.title}
      onClick={e => onClick(e, data)}
      step={data.step}
      progress={data.progress || 0}
    >
      <img src={data.preview} alt="user_space_image" height="100%" />
    </ItemWrap>
  );
}

export default Content;
