import react, { FC, useState } from 'react';
import { Upload, message } from 'antd';
import { useRequest, useSetState } from 'ahooks';

import UploadMusicProgress from '@/pages/SetupSound/UploadAudio/UploadMusicProgress';
import { beforeUpload, useAudioUpload } from '@/hooks/useUploadAudio';
import { getRecorderFolder } from '@/api/upload';
import { UploadFileType } from '@/utils/uploader';
import { clickActionWeblog } from '@/utils/webLog';

interface Prop {
  children: any;
  gituploadId: () => void;
  onChoose: (data: any) => void;
}
interface State {
  visible: boolean;
  progress: number;
  fileState: number;
}

const UploadAudio: FC<Prop> = Props => {
  const { children, gituploadId, onChoose } = Props;
  const [current, setCurrent] = useState();
  const [folder, setFolder] = useState(0);
  // // 获取我的录音文件夹
  // useRequest(getRecorderFolder, {
  //   onSuccess: res => {
  //     setFolder(res.folder_id);
  //   },
  // });
  const [state, setState] = useSetState<State>({
    visible: false,
    progress: 1,
    fileState: 0,
  });

  const { uploadStatRecorder } = useAudioUpload({
    setFileState: (fileState: number, data = null) => {
      setState({ ...state, fileState });
      if (data) {
        onChoose(data);
      } else {
        onChoose({ ...current, progress: 100, fileState });
      }
    },
    setProgress: (progress: number, file: UploadFileType) => {
      setState({ visible: true, progress });
      onChoose({ file, progress, fileState: 0 });
    },
    onSucceed: () => {
      setState({ visible: false });
      gituploadId();
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
        onChoose({ ...info, ...state });
        setCurrent(info);
        uploadStatRecorder(info.file, info.file.name, folder, '');
        clickActionWeblog('action_music_upload​');
      });
    },
  };
  return (
    <Upload {...props} accept={'audio/*'}>
      {children}
    </Upload>
  );
};

export default UploadAudio;
