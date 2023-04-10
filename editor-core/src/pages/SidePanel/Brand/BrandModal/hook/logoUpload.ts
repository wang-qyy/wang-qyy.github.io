import SparkMD5 from 'spark-md5';

import {
  FileSender,
  getOrientation,
  createFormData,
  buildOssURL,
} from '@/utils/uploader';

import { getAddLogo } from '@/api/brand';

interface useFileUploadParams {
  onSucceed: (params: any) => void;
  setProgress?: (params: { status?: string; progress: number }) => void;
  onError?: (
    res: any,
    params?: { isNotAllow?: boolean; bindPhone?: boolean },
  ) => void;
  folder_id?: string;
}

export function useFileUpload({
  onSucceed,
  onError,
  setProgress,
}: useFileUploadParams) {
  const handleProgress = evt => {
    if (evt.lengthComputable && typeof setProgress === 'function') {
      const progress = Math.round((evt.loaded / evt.total) * 100);
      setProgress({ progress: progress > 99 ? 99 : progress });
    }
  };

  // 执行上传
  async function executeUploadFile(ossForm: any, file: File) {
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
      onError && onError(flag);
    }
  }

  // 判断文件是否存在
  async function isFileExits(params: {
    md5: string;
    file: File;
    brand_id: string;
  }) {
    const { md5, file, brand_id } = params;

    setProgress && setProgress({ progress: 99 });

    getOrientation(file, async (orientation: number) => {
      let orientationFlag = 0;
      if (orientation > 4 && orientation <= 8) {
        orientationFlag = 1;
      }
      const res = await getAddLogo({
        brand_id,
        file_md5: md5,
        filename: file.name,
        orientationFlag,
      });

      switch (String(res?.code)) {
        case '0': // 文件存在 直接返回
          onSucceed(res?.data);
          break;
        case '1005':
          {
            const { message } = res?.data;
            if (message === 'fileBlock') {
              // 文件涉嫌违规，无法上传
              onError && onError(res.data, { isNotAllow: true });
            } else if (message === 'fileNotExist') {
              // 上传文件
              executeUploadFile(res, file);
            } else if (message === 'bindPhone') {
              onError && onError(res.data, { bindPhone: true });
            }
          }
          break;
      }
    });
  }

  // 计算MD5
  function getMD5(file: File, callback: (md5: string) => void) {
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

  const uploadStat = (file: File, brand_id) => {
    try {
      getMD5(file, (md5: string) => {
        isFileExits({ md5, file, brand_id });
      });
    } catch (err) {
      console.error(err);
      onError && onError(err);
    }
  };

  return { uploadStat, handleProgress };
}
