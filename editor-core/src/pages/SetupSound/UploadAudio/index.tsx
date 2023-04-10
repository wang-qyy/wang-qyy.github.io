import react, { FC } from 'react';
import { Upload, message } from 'antd';
import { useSetState } from 'ahooks';

import UploadMusicProgress from '@/pages/SetupSound/UploadAudio/UploadMusicProgress';
import { beforeUpload, useAudioUpload } from '@/hooks/useUploadAudio';

interface Prop {
  children: any;
  gituploadId: any;
}
interface State {
  visible: boolean;
  progress: number;
  name: string;
}

const UploadAudio: FC<Prop> = Props => {
  const { children, gituploadId } = Props;

  const [state, setState] = useSetState<State>({
    visible: false,
    progress: 0,
    name: '',
  });

  const { uploadStat } = useAudioUpload({
    setProgress: (progress: number) => {
      setState({ visible: true, progress });
    },
    onSucceed: (data: any) => {
      setState({ visible: false });
      if (data.code === 0) {
        gituploadId(data.data.id);
      }
    },
    onError: (err: any) => {
      setState({ visible: false });
      message.error(err.msg);
    },
  });

  const props = {
    name: 'file',
    showUploadList: false,
    beforeUpload: (file: Blob) => {
      beforeUpload(file, (info: any) => {
        setState({ name: info.file.name });
        uploadStat(info.file);
      });
    },
  };

  return (
    <>
      <UploadMusicProgress
        visible={state.visible}
        progress={state.progress}
        name={state.name}
      />
      <Upload {...props}>{children}</Upload>
    </>
  );
};

export default UploadAudio;
