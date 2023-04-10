import { message } from 'antd';
import {
  FileSender,
  createFormDataNew,
  createFormData,
  UploadFileType,
  buildOssURL,
} from '@/utils/uploader';
import SparkMD5 from 'spark-md5';
import { useRequest } from 'ahooks';

import {
  uploadAudio,
  getAudioScan,
  uploadRecorderAudio,
  recorderAudioAdd,
} from '@/api/music';
import { uploadImage } from '@/api/images';
import { checkFileState } from '@/api/upload';
import { useState } from 'react';

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
    const end = start + chunkSize >= file.size ? file.size : start + chunkSize;

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
export async function beforeUpload(file: UploadFileType, callback: any) {
  const { size } = file;

  const max_size = 50 * 1024 * 1024;
  if (size > max_size) {
    message.error('请勿上传超过50M的音乐!');
    return false;
  }

  if (
    !['audio/mpeg', 'audio/x-m4a', 'audio/x-ms-wma'].some(
      item => item === file.type,
    )
  ) {
    message.error('上传失败，支持上传50M以下MP3 M4A WMA本地音乐');
    return false;
  }
  callback({ file });
}
export function useAudioUpload({
  onSucceed,
  onError,
  setProgress,
  setFileState,
}: any) {
  // 上传成功，但是还未进行转码的数据
  const [successData, setSuccessData] = useState({});
  const handleProgress = (evt: Event, file: UploadFileType) => {
    if (evt.lengthComputable && typeof setProgress === 'function') {
      const progress = Math.round((evt.loaded / evt.total) * 100);
      setProgress(progress > 99 ? 99 : progress, file);
    }
  };
  const uploadStat = async (file: UploadFileType, fileType = 'audio') => {
    const { name, size, type } = file;

    // 获取oss信息
    let ossForm = {};

    if (fileType === 'audio') {
      ossForm = await uploadAudio({ name, size, type });
    } else if (fileType === 'image') {
      ossForm = await uploadImage(name, type, size);
    }

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
        onSucceed(flag);
      } else {
        onError && onError(flag);
      }
    } else {
      onError && onError(ossForm);
    }
  };
  const { loading, cancel, run } = useRequest(getAudioScan, {
    manual: true,
    pollingInterval: 1000,
    pollingWhenHidden: false,
    onSuccess(res, pram) {
      // scan_flag:  0-待审；1-通过；2-不确定/疑似；3-涉黄恐政/违规；
      if (res[0]?.scan_flag !== 0) {
        pram[0]?.callback();
        cancel();
      }
    },
    onError() {
      message.error('提交失败请稍后重试');
      cancel();
    },
  });
  const { cancel: cancelRecord, run: runRecord } = useRequest(checkFileState, {
    manual: true,
    pollingInterval: 1000,
    pollingWhenHidden: false,
    onSuccess(res, pram) {
      // state  0-创建；1-完成；2-转码中
      if (res[0]?.state === 1) {
        // 更新数据
        setFileState(res[0]?.state, { ...successData, ...res[0] });
        cancelRecord();
        // onSucceed && onSucceed(res[0]?.state);
      } else {
        setFileState(res[0]?.state);
      }
    },
    onError() {
      message.error('提交失败请稍后重试');
      cancelRecord();
    },
  });
  /**
   * 上传录音
   * @param file
   * @param name
   */
  const uploadStatRecorder = async (
    file: UploadFileType,
    filename: string,
    folder_id: string | number,
    file_type: string,
  ) => {
    getMD5(file, async md5 => {
      // 获取oss信息
      const ossForm = await uploadRecorderAudio({
        filename,
        folder_id,
        file_md5: md5,
        file_type,
      });
      // 文件不存在
      const isNoExit =
        ossForm.code === 1005 || ossForm.data.err === 'fileNotExist';
      if (isNoExit) {
        const ossURl = buildOssURL(ossForm.data);
        // 上传
        const { send } = FileSender({
          url: ossURl,
          onprogress: evt => handleProgress(evt, file),
        });
        const formData = createFormData(file, ossForm.data);

        const flag = (await send(formData)) as {
          [key: string]: number;
        };
        if (flag.code === 0) {
          setSuccessData(flag?.data);
          if (setFileState) {
            runRecord([flag?.data?.file_id]);
          } else {
            onSucceed(flag);
          }
        } else {
          onError && onError(flag);
        }
      } else {
        const add = await recorderAudioAdd({
          title: filename,
          folder_id,
          file_md5: md5,
          type: 'file',
          source_tag: file_type,
        });
        if (add.code === 0) {
          onSucceed(add);
        } else {
          onError(add);
        }
      }
    });
  };

  return { uploadStat, uploadStatRecorder, handleProgress, run };
}
