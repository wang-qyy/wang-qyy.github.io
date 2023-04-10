import { stringify } from 'qs';
import { mainHost } from '@/config/http';
import { FileSender, createFormDataNew } from '@/utils/uploader';

export type UploadType = 'frame' | 'source' | 'preview';

/**
 *- start-开始（处理中...）
 *- pulling-从远程拉取文件中（下载中...）
 *- pulled-已经从远程拉去文件（下载结束...）
 *- synthesising-合成视频中（视频合成中...）
 *- synthesised-已经合成视频（合成完成）
 *- done-完成
 */
export type FileStatus =
  | 'start'
  | 'pulling'
  | 'pulled'
  | 'synthesising'
  | 'synthesised'
  | 'fail'
  | 'done';

interface OssFormRequestPayload {
  name: string;
  type: string;
  size: number;
  upload_type: UploadType;
}

/**
 * @descripte 视频文件上传
 * @params name 文件名称
 * @params type 文件类型 如image/png
 * @params size 文件大小
 * @params upload_type上传类型
 * @eg upload_type:frame-视频帧文件上传，限制zip格式；
 * @eg upload_type:source-工程源文件上传，限制zip格式
 * @eg preview-预览图上传，限制png、jpg、jpeg格式
 */
function getUploadOssForm(params: OssFormRequestPayload) {
  return mainHost.get(`/creator-api/upload/video-payload?${stringify(params)}`);
}

/**
 * @descripte 图片文件上传
 * @params name 文件名称
 * @params type 文件类型 如image/png
 * @params size 文件大小
 * @params upload_type上传类型
 * @eg upload_type:sample-预览图，限制png、jpg、jpeg格式；
 * @eg upload_type:source-psd源文件
 */
function getImageUploadOssForm(params: OssFormRequestPayload) {
  return mainHost.get(`/creator-api/upload/image-payload?${stringify(params)}`);
}

interface OssResponseData {
  path: string;
}

/**
 * @eg 1 成功
 * @eg -11 不支持的文件类型
 */
type OssResponseStat = -11 | 1;

interface OssResponse {
  code: 0;
  data: OssResponseData;
  stat: OssResponseStat;
  msg: 'ok';
}

interface useFileUploadOptions {
  onError: (e: any) => void;
  setProgress: (progress: number, file: File) => void;
  onSucceed: (ossInfo: OssResponseData) => void;
  moduleType: 'image' | 'video';
}

export function useFileUpload(options: useFileUploadOptions) {
  const { onError, setProgress, onSucceed, moduleType } = options;

  const handleProgress = (evt: ProgressEvent, file: File) => {
    if (evt.lengthComputable && typeof setProgress === 'function') {
      const progress = Math.round((evt.loaded / evt.total) * 100);
      setProgress(progress < 10 ? 10 : progress, file);
    }
  };

  async function start(file: File, uploadType: UploadType) {
    const { name, size, type } = file;

    try {
      // 获取oss信息
      const ossForm = await (moduleType === 'video'
        ? getUploadOssForm({
            name,
            size,
            type,
            upload_type: uploadType,
          })
        : getImageUploadOssForm({
            name,
            size,
            type,
            upload_type: uploadType,
          }));

      //   setProgress(10, file);

      //stat!==1 数据获取异常
      if (ossForm.code !== 0) {
        onError(ossForm);
        return;
      }

      // 构建上传所需的参数
      const formData = createFormDataNew(file, ossForm.data.payload);
      const ossURl = ossForm.data.host;

      // 上传
      const { send } = FileSender({
        url: ossURl,
        onprogress: evt => handleProgress(evt, file),
      });
      const flag = (await send(formData)) as OssResponse;

      if (flag.code === 0) {
        onSucceed(flag.data);
      } else {
        onError && onError(flag);
      }
    } catch (err) {
      console.error(err);
      onError && onError(err);
    }
  }

  return { start };
}

export function beforeUpload() {
  return {};
}
