import { message } from 'antd';
import SparkMD5 from 'spark-md5';
import { getUploadOssForm, getLogoUploadOssForm } from '@/api/pictures';
import { watermarkCdnName, watermarkOss, coverUpload } from '@/api/watermark';
import getUrlPrams from '@/utils/urlProps';
import {
  createFormData,
  FileSender,
  buildOssURL,
  getOrientation,
  createFormDataNew,
} from '@/utils/uploader';

// 图片预览
export function getImagePreview(file: Blob, callback: Function) {
  const reader = new FileReader();
  const path = window.webkitURL.createObjectURL(file);

  reader.onload = e => {
    const data = e.target?.result;
    const img = new Image();
    img.onload = () => {
      const { width, height } = img;

      callback({
        file,
        path,
        width,
        height,
      });
    };
    img.src = data;
  };
  reader.readAsDataURL(file);
}

export function useImgUpload({ onSucceed, onError, setProgress }) {
  const handleProgress = (evt, file: Blob) => {
    if (evt.lengthComputable && typeof setProgress === 'function') {
      const progress = Math.round((evt.loaded / evt.total) * 100);
      setProgress(progress > 99 ? 99 : progress, file);
    }
  };
  const uploadStat = (file: Blob) => {
    const { name: filename } = file;

    try {
      getOrientation(file, async (orientation: number) => {
        let orientationFlag = 0;
        if (orientation > 4 && orientation <= 8) {
          orientationFlag = 1;
        }

        // 获取oss信息
        const ossForm = await getUploadOssForm(filename, orientationFlag);

        // 构建上传所需的参数
        const formData = createFormData(file, ossForm.msg);
        const ossURl = buildOssURL(ossForm.msg);

        // 上传
        const { send } = FileSender({
          url: ossURl,
          onprogress: evt => handleProgress(evt, file),
        });
        const flag = (await send(formData)) as {
          [key: string]: number;
        };

        if (flag.stat === 1) {
          onSucceed(flag.msg.id, flag.msg.picUrl, flag.msg);
        } else {
          onError && onError(flag);
        }
      });
    } catch (err) {
      console.error(err);
      onError && onError(err);
    }
  };
  // 计算MD5
  function getMD5(file: File, callback: () => void) {
    // console.log('getMD5', file);

    const blobSlice =
      File.prototype.slice ||
      File.prototype.mozSlice ||
      File.prototype.webkitSlice;
    const chunkSize = 2097152; // Read in chunks of 2MB
    const chunks = Math.ceil(file.size / chunkSize);
    let currentChunk = 0;
    const spark = new SparkMD5.ArrayBuffer();
    const fileReader = new FileReader();
    function loadNext() {
      const start = currentChunk * chunkSize;
      const end =
        start + chunkSize >= file.size ? file.size : start + chunkSize;

      fileReader.readAsArrayBuffer(blobSlice.call(file, start, end));
    }

    fileReader.onload = e => {
      spark.append(e.target.result); // Append array buffer
      currentChunk += 1;

      if (currentChunk < chunks) {
        loadNext();
      } else {
        const _md5 = spark.end();
        callback(_md5);
      }
    };

    fileReader.onerror = () => {
      console.warn('oops, something went wrong.');
    };

    fileReader.onprogress = e => {
      // console.log('getMD5 fileReader.onprogress', e);
    };

    loadNext();
  }

  const upLogoloadStat = (file: Blob) => {
    const { name: filename } = file;
    getMD5(file, md5 => {
      try {
        getOrientation(file, async (orientation: number) => {
          let orientationFlag = 0;
          if (orientation > 4 && orientation <= 8) {
            orientationFlag = 1;
          }
          // 获取oss信息
          const ossForm = await getLogoUploadOssForm(
            filename,
            orientationFlag,
            md5,
          );

          if (ossForm?.data?.message === 'alreadyExist') {
            onSucceed(ossForm?.data);
            return;
          }
          if (ossForm?.code == 1005 && ossForm?.err === 'bindPhone') {
            onError && onError('bindPhone');
          }
          // 构建上传所需的参数
          const formData = createFormData(file, ossForm.data);
          const ossURl = buildOssURL(ossForm.data);

          // 上传
          const { send } = FileSender({
            url: ossURl,
            onprogress: evt => handleProgress(evt, file),
          });
          const flag = (await send(formData)) as {
            [key: string]: number;
          };

          if (flag.code === 0) {
            onSucceed(flag.data);
          } else {
            onError && onError(flag.msg);
          }
        });
      } catch (err) {
        console.error(err);
        onError && onError(err);
      }
    });
  };

  const uploadWatermarkStat = (file: Blob) => {
    const { name: filename } = file;

    try {
      getOrientation(file, async (orientation: number) => {
        // 获取cdnName
        const cndInfo = await watermarkCdnName(filename);

        const { cdnName } = cndInfo?.data;

        const { params: id } = getUrlPrams();
        // 获取oss信息
        const ossForm = await watermarkOss(filename, cdnName, id);

        // 构建上传所需的参数
        const formData = createFormData(file, ossForm.data);
        const ossURl = buildOssURL(ossForm.data);

        // 上传
        const { send } = FileSender({
          url: ossURl,
          onprogress: evt => handleProgress(evt, file),
        });
        const flag = (await send(formData)) as {
          [key: string]: number;
        };

        if (flag.stat === 1) {
          onSucceed(flag.data);
        } else {
          onError && onError(flag.msg);
        }
      });
    } catch (err) {
      console.error(err);
      onError && onError(err);
    }
  };

  return { uploadStat, handleProgress, uploadWatermarkStat, upLogoloadStat };
}
export function useCoverUpload({ onSucceed, onError, setProgress }) {
  const handleProgress = (evt, file: Blob) => {
    if (evt.lengthComputable && typeof setProgress === 'function') {
      const progress = Math.round((evt.loaded / evt.total) * 100);
      setProgress(progress > 99 ? 99 : progress, file);
    }
  };
  const uploadStat = async (file: Blob) => {
    const { name, size, type } = file;
    // 获取oss信息
    const ossForm = await coverUpload({ name, size, type });
    if (ossForm.code === 0) {
      const { host, payload } = ossForm.data;

      // 上传
      const { send } = FileSender({
        url: host,
        onprogress: evt => handleProgress(evt, file),
      });
      const formData = createFormDataNew(file, payload);
      const flag = (await send(formData)) as {
        [key: string]: number;
      };

      if (flag.code === 0) {
        onSucceed(flag.code, flag.data);
      } else if (flag.code === 1005 && flag.data?.message === 'contentBlock') {
        message.error('系统检测当前图片存在违规嫌疑  无法上传');
      } else {
        onError && onError(flag);
      }
    } else {
      onError && onError(ossForm);
    }
  };
  return { uploadStat, handleProgress };
}
export async function beforeUpload(file: Blob, callback: any) {
  const { size } = file;

  const max_size = 10 * 1024 * 1024;
  if (size > max_size) {
    message.error('请勿上传超过10M的图片!');
    return false;
  }

  if (!['image/png', 'image/jpeg'].some(item => item === file.type)) {
    message.error('上传失败，支持上传10M以下jpg/png本地图片');
    return false;
  }

  await getImagePreview(file, (info: any) => {
    callback({ file, ...info });
  });
}
