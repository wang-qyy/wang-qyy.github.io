import { useRequest } from 'ahooks';
import {
  createFormData,
  createFormDataNew,
  buildOssURL,
  FileSender,
  VideoDimension,
  UploadFileType,
} from '@/utils/uploader';
import { uploadVideo } from '@/api/images';

import {
  videoGetCdnName,
  userVideoUploadStat,
  videoUploadOssForm,
} from '@/api/pictures';

export interface OssFormData {
  base64callback_body: string;
  base64policy: string;
  bucket: string;
  endpoint: string;
  id: string;
  key: string;
  signature: string;
}

/**
 * @description 上传完成以后，需要轮询处理状态
 * @param key
 */
export function useCheckFileUploadStatus({
  request = userVideoUploadStat,
  onSucceed,
  onError,
}: any) {
  const checkUploadStatus = useRequest(request, {
    manual: true,
    pollingInterval: 5000,
    onSuccess: (res, params) => {
      if (res.stat === 0) {
        onError && onError(res);
        checkUploadStatus.cancel();
        return true;
      }

      if (res.stat === 1 || !res.code) {
        onSucceed &&
          onSucceed({
            res,
            key: params[0],
            videoURL: params[1],
          });
      }
    },
  });

  return checkUploadStatus;
}

export function useFileUpload({
  setProgress,
  onSucceed,
  onError,
  uploadSucceed,
  setPreview,
}: {
  onSucceed?: ({ key, videoURL }: { key: number; videoURL: string }) => void;
  onError?: (err: Error) => void;
  setProgress?: (process: number, file: UploadFileType) => void;
  uploadSucceed?: (flag: any) => void;
  setPreview?: (video: OssFormData) => void;
}) {
  let videoURL: string;

  const handleProgress = (evt: Event, file: UploadFileType) => {
    if (evt.lengthComputable && typeof setProgress === 'function') {
      const progress = Math.round((evt.loaded / evt.total) * 100);
      // 因为最后还有后台处理的流程，所以上传完成以后，进度保持在99,等待后端处理视频

      setProgress(progress > 99 ? 99 : progress, file);
    }
  };

  /**
   * @description 上传完成以后，需要轮询视频处理状态
   * @param key
   */
  const checkUploadStatus = useCheckFileUploadStatus({
    onError,
    onSucceed: ({ res, key, videoURL }: any) => {
      if (res.stat === 1 && res.msg !== '视频正在处理中') {
        checkUploadStatus.cancel();
        onSucceed && onSucceed({ res, key, videoURL });
      }
    },
  });

  const uploadStat = async (file: UploadFileType) => {
    const { name: filename } = file;

    try {
      // 检查视频大小，是否是浏览器可解析的视频
      const { startGetting } = VideoDimension(file);
      const dimensionInfo = await startGetting();
      // console.log(dimensionInfo);
      // 如果视频宽高为0，说明浏览器无法解析该视频
      if (dimensionInfo.width === 0 || dimensionInfo.height === 0) {
        throw new Error('视频分辨率过高，或上传了不受支持的视频格式！');
      }

      videoURL = dimensionInfo.fileURL;

      // 获取cdnName
      const cndInfo = await videoGetCdnName(filename);

      const { cdnName } = cndInfo.msg;
      // 获取oss信息
      const ossForm = await videoUploadOssForm(filename, cdnName);

      // 构建上传所需的参数
      const formData = createFormData(file, ossForm.msg);
      const ossURl = buildOssURL(ossForm.msg);
      // 上传
      const { send } = FileSender({
        onprogress: evt => handleProgress(evt, dimensionInfo),
        // onprogress: evt => handleProgress(evt, file),
        url: ossURl,
      });
      const flag = (await send(formData)) as {
        [key: string]: number;
      };

      // 上传成功的钩子，如果需要在上传成功处理一些事务，可以传入此函数
      uploadSucceed && uploadSucceed(flag);

      if (flag.stat === 1) {
        checkUploadStatus.run(flag.data, videoURL);

        if (setPreview) {
          setPreview(ossForm);
        }

        // checkUploadStatus.run(flag.data, file.fileURL);
      } else {
        onError && onError(flag);
      }
    } catch (err) {
      console.error(err);
      onError && onError(err);
    }
  };

  return { handleProgress, uploadStat, checkUploadStatus };
}

export function useDesignerVideoUpload({
  setProgress,
  onSucceed,
  onError,
  uploadSucceed,
}: any) {
  const handleProgress = (evt: Event) => {
    if (evt.lengthComputable && typeof setProgress === 'function') {
      const progress = Math.round((evt.loaded / evt.total) * 100);
      // 因为最后还有后台处理的流程，所以上传完成以后，进度保持在99,等待后端处理视频
      setProgress(progress > 99 ? 99 : progress);
    }
  };

  const uploadStat = async (file: UploadFileType) => {
    try {
      const { name, size, type } = file;
      // 获取oss信息
      const ossForm = await uploadVideo(name, type, size);

      // 构建上传所需的参数
      const formData = createFormDataNew(file, ossForm.data.payload);
      const ossURl = ossForm.data.host;

      // 上传
      const { send } = FileSender({
        onprogress: evt => handleProgress(evt),
        // onprogress: evt => handleProgress(evt, file),
        url: ossURl,
      });
      const flag = (await send(formData)) as {
        [key: string]: number;
      };

      if (flag.stat !== 1) {
        // 上传成功的钩子，如果需要在上传成功处理一些事务，可以传入此函数
        uploadSucceed && uploadSucceed(flag);
        onSucceed && onSucceed(flag);
      } else {
        onError && onError(flag);
      }
    } catch (err) {
      console.error(err);
      onError && onError(err);
    }
  };

  return { uploadStat };
}
