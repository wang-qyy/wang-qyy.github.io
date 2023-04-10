import { message, RcFile } from 'antd';

export type UploadFileType = string | Blob | RcFile;

export function createFormDataNew(file: Blob, data: any) {
  const formData = new FormData();

  formData.append('OSSAccessKeyId', data.OSSAccessKeyId);
  formData.append('policy', data.policy);
  formData.append('Signature', data.Signature);
  formData.append('key', data.key);
  // formData.append('success_action_redirect', "http://818ps.com/site/oss-form");
  // formData.append('success_action_status', "201");
  formData.append('callback', data.callback);
  formData.append('file', file);
  return formData;
}

export function createFormData(file: UploadFileType, data: any) {
  const formData = new FormData();

  formData.append('OSSAccessKeyId', data.id);
  formData.append('policy', data.base64policy);
  formData.append('Signature', data.signature);
  formData.append('key', data.key);
  // formData.append('success_action_redirect', "http://818ps.com/site/oss-form");
  // formData.append('success_action_status', "201");
  formData.append('callback', data.base64callback_body);
  formData.append('file', file);
  return formData;
}

// oss url
export function buildOssURL(data: { bucket: string; endpoint: string }) {
  return `//${data.bucket}.${data.endpoint}`;
}

export function FileSender({
  onprogress,
  url,
}: {
  onprogress?: (evt: ProgressEvent) => void;
  url: string;
}) {
  const send = (formData: any) => {
    return new Promise((resolve, reject) => {
      const xhr = new window.XMLHttpRequest();
      xhr.onload = () => {
        if (xhr.readyState === xhr.DONE && xhr.status === 200) {
          const res = JSON.parse(xhr.response);
          resolve(res);
        } else {
          reject(xhr);
        }
      };

      xhr.onerror = err => {
        reject(err);
      };

      if (onprogress) xhr.upload.onprogress = onprogress;

      xhr.open('post', url, true);
      xhr.withCredentials = true;

      xhr.send(formData);
    });
  };
  return { send };
}

// 通过读取函数字符串来创建worker
function createWorker(workerCode: Function) {
  if (typeof workerCode !== 'function') {
    throw new Error(
      `workerCode need a function type, but got a ${typeof workerCode}`,
    );
  }

  function funcToCode(workerCode: Function) {
    const stringCode = workerCode.toString();

    const code = stringCode.substring(
      stringCode.indexOf('{') + 1,
      stringCode.lastIndexOf('}'),
    );

    const blob = new Blob([code], { type: 'application/javascript' });

    return URL.createObjectURL(blob);
  }

  return new Worker(funcToCode(workerCode));
}

export class FileToURL {
  file: string;

  URL: any;

  static createURLOnWorker(file: UploadFileType) {
    const workCode = () => {
      self.onmessage = file => {
        const url = self.URL.createObjectURL(file.data);
        self.postMessage(url);
      };
    };

    const worker = createWorker(workCode);

    return new Promise((resolve, reject) => {
      worker.postMessage(file);
      worker.onmessage = e => {
        resolve(e.data);
      };
      worker.onerror = e => {
        reject(e);
      };
    });
  }

  static createURLOnPromise(file: UploadFileType) {
    return new Promise((resolve, reject) => {
      try {
        const URL = window.URL.createObjectURL(file);
        resolve(URL);
      } catch (e) {
        reject(e);
      }
    });
  }

  constructor(file: FileType) {
    this.file = file;
    this.URL = null;
  }

  createURL = async () => {
    const URL = await FileToURL.createURLOnPromise(this.file);
    this.URL = URL;
    return URL;
  };

  clearURL = () => {
    this.URL && window.URL.revokeObjectURL(this.URL);
  };
}

export function VideoDimension(
  file: UploadFileType,
  onErr?: (err: Error) => void,
) {
  const transformFile = () => {
    return new Promise((resolve, reject) => {
      const fileItem = new FileToURL(file);
      fileItem
        .createURL()
        .then(url => {
          resolve(url);
        })
        .catch(err => {
          reject(err);
        });
    });
  };

  const getImageInfo = async () => {
    const fileURL = await transformFile();

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const { width, height } = img;
        // console.log('image onload', { width, height });
        resolve({ fileURL, width, height });
      };
      img.onerror = reject;
      img.src = fileURL;
    });
  };

  async function getAudioInfo() {
    const fileURL = URL.createObjectURL(file);

    return new Promise((resolve, reject) => {
      const audioElement = new Audio(fileURL);

      audioElement.onloadedmetadata = () => {
        resolve({ duration: audioElement.duration, fileURL });
      };

      audioElement.onerror = reject;
    });
  }

  const getDimension = (fileURL: string) => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.onloadedmetadata = evt => {
        resolve({
          width: video.videoWidth,
          height: video.videoHeight,
          duration: video.duration,
        });
      };
      video.onerror = err => {
        reject(err);
      };
      video.src = fileURL;
      video.load();
    });
  };

  const startGetting = async () => {
    try {
      const fileURL = await transformFile();
      const dimension = await getDimension(fileURL);
      return { fileURL, ...dimension };
    } catch (err: Error) {
      onErr && onErr(err);
      return false;
    }
  };

  return {
    transformFile,
    getDimension,
    startGetting,
    getImageInfo,
    getAudioInfo,
  };
}

// 支持上传的图片文件类型
export const ACCEPT_IMAGE_TYPE = ['image/png', 'image/jpeg', 'image/gif'];
// 支持上传的视频文件类型
export const ACCEPT_VIDEO_TYPE = ['video/mp4', 'video/quicktime'];
// 支持上传的音频文件类型
export const ACCEPT_AUDIO_TYPE = [
  'audio/mpeg',
  'audio/x-m4a',
  // 'audio/x-ms-wma',// 谷歌浏览器不支持
  'audio/mp3', // qq浏览器解析的MP3文件类型
  'audio/wav', // 录音
];

export const ACCEPT_FILE_TYPE = [
  ...ACCEPT_IMAGE_TYPE,
  ...ACCEPT_VIDEO_TYPE,
  ...ACCEPT_AUDIO_TYPE,
];

const fileLimit = {
  image: {
    title: '图片',
    limitSize: 10,
    acceptType: ACCEPT_IMAGE_TYPE,
    errorTip: 'jpg / png',
  },
  video: {
    title: '视频',
    limitSize: 100,
    acceptType: ACCEPT_VIDEO_TYPE,
    errorTip: 'mp4 / MOV',
  },
  audio: {
    title: '音频',
    limitSize: 50,
    acceptType: ACCEPT_AUDIO_TYPE,
    errorTip: 'MP3 / M4A / WMA',
  },
  all: {
    title: '全部',
    limitSize: 1024,
    acceptType: ACCEPT_FILE_TYPE,
    errorTip: '',
  },
};

type FileType = 'image' | 'video' | 'audio';

/**
 * @description 文件预检
 * @param file
 * @param fileType  'image' | 'video' | 'audio';
 * @param callback 回调函数 isAccept 文件类型通过
 * */
export async function beforeFileUpload(
  file: UploadFileType,
  fileType: FileType,
  callback?: (isAccept: boolean, params: any) => void,
) {
  let result = true;
  const fileInfo = { file };

  const { size, type } = file;

  const { title, limitSize, acceptType, errorTip } = fileLimit[fileType];
  const max_size = limitSize * 1024 * 1024;
  const { startGetting, getImageInfo, getAudioInfo } = VideoDimension(file);

  if (!acceptType.includes(type)) {
    message.error(`上传失败，支持上传${100}M以下${errorTip}格式的本地${title}`);
    result = false;
  } else if (size > max_size) {
    result = false;
    message.error(`请勿上传超过${limitSize}M的${title}`);
  } else if (fileType === 'video') {
    // 检测视频格式
    const dimensionInfo = await startGetting();

    Object.assign(fileInfo, dimensionInfo);

    // 如果视频宽高为0，说明浏览器无法解析该视频
    if (
      dimensionInfo.width === 0 ||
      dimensionInfo.height === 0 ||
      !dimensionInfo
    ) {
      result = false;
      message.error('视频分辨率过高，或上传了不受支持的视频格式！');
      // throw new Error('视频分辨率过高，或上传了不受支持的视频格式！');
    }
  } else if (fileType === 'image') {
    const imgInfo = await getImageInfo();
    Object.assign(fileInfo, imgInfo);
  } else if (fileType === 'audio') {
    const audioInfo = await getAudioInfo();
    Object.assign(fileInfo, audioInfo);
  }

  callback && callback(result, { file, ...fileInfo });
  return result;
}

/**
 * 获取旋转属性
 * @param file
 * @param callback
 */
export function getOrientation(file: Blob, callback: Function) {
  const reader = new FileReader();

  reader.onload = e => {
    const view = new DataView(reader.result);

    if (view.getUint16(0, false) !== 0xffd8) return callback(-2);
    const length = view.byteLength;
    let offset = 2;
    while (offset < length) {
      try {
        const marker = view.getUint16(offset, false);
        offset += 2;
        if (marker === 0xffe1) {
          if (view.getUint32((offset += 2), false) !== 0x45786966) {
            return callback(-1);
          }
          const little = view.getUint16((offset += 6), false) === 0x4949;

          offset += view.getUint32(offset + 4, little);
          const tags = view.getUint16(offset, little);
          offset += 2;
          for (let i = 0; i < tags; i++)
            if (view.getUint16(offset + i * 12, little) === 0x0112) {
              return callback(view.getUint16(offset + i * 12 + 8, little));
            }
        } else if ((marker & 0xff00) !== 0xff00) {
          break;
        } else {
          offset += view.getUint16(offset, false);
        }
      } catch (error) {
        console.error(error);
        return callback(-1);
      }
    }
    return callback(-1);
  };

  reader.readAsArrayBuffer(file);
}
