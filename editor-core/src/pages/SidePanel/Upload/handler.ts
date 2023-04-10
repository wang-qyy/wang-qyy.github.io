import SparkMD5 from 'spark-md5';
import { useRef } from 'react';

import {
  FileSender,
  getOrientation,
  createFormData,
  buildOssURL,
} from '@/utils/uploader';

import { checkFileExits, addFile } from '@/api/upload';

interface useFileUploadParams {
  onSucceed: (params: any) => void;
  setProgress?: (params: { status?: string; progress: number }) => void;
  onError?: (
    res: any,
    params?: { isNotAllow?: boolean; bindPhone?: boolean },
  ) => void;
  folder_id?: string;
  source_tag?:
    | 'icon' // 图标
    | 'recording'; // 录音文件
}

export function useFileUpload({
  onSucceed,
  onError,
  setProgress,
  folder_id = '0',
  source_tag,
}: useFileUploadParams) {
  const folder = useRef<{ folderId: string }>();

  const handleProgress = evt => {
    if (evt.lengthComputable && typeof setProgress === 'function') {
      const progress = Math.round((evt.loaded / evt.total) * 100);
      setProgress({ progress: progress > 99 ? 99 : progress });
    }
  };

  // 添加到用户列表
  async function handleAddFile(md5: string, file: File) {
    console.log('handleAddFile', folder.current?.folderId);
    const addFileRes = await addFile({
      file_md5: md5,
      title: file.name,
      folder_id: folder.current?.folderId ?? folder_id,
      type: 'file',
      source_tag,
    });

    if (addFileRes.code === 0) {
      onSucceed(addFileRes.data);
    } else {
      onError && onError(addFileRes);
    }
  }

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
  async function isFileExits(params: { md5: string; file: File }) {
    const { md5, file } = params;
    setProgress && setProgress({ progress: 99 });

    getOrientation(file, async (orientation: number) => {
      let orientationFlag = 0;
      if (orientation > 4 && orientation <= 8) {
        orientationFlag = 1;
      }

      const res = await checkFileExits({
        file_md5: md5,
        filename: file.name,
        orientationFlag,
        folder_id: folder.current?.folderId ?? folder_id,
        source_tag,
      });

      switch (String(res?.code)) {
        case '0': // 文件存在 添加文件
          handleAddFile(md5, file);
          break;
        case '1005':
          {
            const { err } = res.data;

            if (err === 'fileBlock') {
              // 文件涉嫌违规，无法上传
              onError && onError(res, { isNotAllow: true });
            } else if (err === 'fileNotExist') {
              // 上传文件
              executeUploadFile(res, file);
            } else if (err === 'bindPhone') {
              onError && onError(res, { bindPhone: true });
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

  const uploadStat = (file: File, folderId?: string) => {
    if (folderId) {
      folder.current = { folderId };
    }
    try {
      getMD5(file, (md5: string) => {
        isFileExits({ md5, file });
      });
    } catch (err) {
      console.error(err);
      onError && onError(err);
    }
  };

  return { uploadStat, handleProgress };
}
