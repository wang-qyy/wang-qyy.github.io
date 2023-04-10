/**
 * @description 给时间不足两位补0
 * @param time
 */
function formatTimeItem(time, covering = false) {
  return `${covering && time < 10 ? '0' : ''}${time}`;
}

/**
 * @description 将秒数转化为 0：00格式
 * @param number
 */
function formatNumberToTime(number) {
  const m = Math.floor(number / 60);
  const s = Number((number % 60).toFixed(1));

  return `${formatTimeItem(m)}:${formatTimeItem(s, true)}`;
}

function getFileType(mime_type) {
  switch (mime_type) {
    case 'image/png':
    case 'image/jpeg':
    case 'image/gif':
      return 'image';
    case 'video/quicktime':
    case 'video/mp4':
      return 'video';
    case 'audio/mpeg':
    case 'audio/x-m4a':
    case 'audio/x-ms-wma':
      return 'audio';
  }
}

let params = {};
let urlCache = '';
const getUrlParams = () => {
  const tempStr = document.location.href;
  if (tempStr !== urlCache) {
    urlCache = tempStr;

    let tempArr;
    params = {};

    tempArr = tempStr.split('?');
    tempArr = tempArr[1] ? tempArr[1] : '';
    tempArr = tempArr.split('&');

    tempArr.forEach(item => {
      const [key, value] = item.split('=');
      if (key) {
        params[key] = value;
      }
    });
  }

  return params;
};

const acceptType = [
  'image/png',
  'image/jpeg',
  'video/mp4',
  'video/quicktime',
  'audio/mpeg',
  'audio/x-m4a',
  'audio/x-ms-wma',
];
const limitSize = { image: 10, video: 1024, audio: 50 }; // mb

/**
 * @description 文件预检
 * @param file
 * @param fileType  'image' | 'video' | 'audio';
 * @param callback 回调函数 isAccept 文件类型通过
 * */
async function beforeFileUpload(file, fileType, callback) {
  let error = '';
  const fileInfo = { file };

  const { size, type } = file;

  const max_size = limitSize[fileType] * 1024 * 1024;

  if (!acceptType.includes(type)) {
    error = '文件类型不支持';
  } else if (size > max_size) {
    error = '文件过大';
  }

  callback && callback(error, { file, ...fileInfo });
}

/**
 * 获取旋转属性
 * @param file
 * @param callback
 */
function getOrientation(file, callback) {
  const reader = new FileReader();

  reader.onload = e => {
    const view = new DataView(reader.result);

    if (view.getUint16(0, false) !== 0xffd8) return callback(-2);
    const length = view.byteLength;
    let offset = 2;
    while (offset < length) {
      const marker = view.getUint16(offset, false);
      offset += 2;
      if (marker === 0xffe1) {
        if (view.getUint32((offset += 2), false) !== 0x45786966)
          return callback(-1);
        const little = view.getUint16((offset += 6), false) === 0x4949;
        offset += view.getUint32(offset + 4, little);
        const tags = view.getUint16(offset, little);
        offset += 2;
        for (let i = 0; i < tags; i++)
          if (view.getUint16(offset + i * 12, little) === 0x0112)
            return callback(view.getUint16(offset + i * 12 + 8, little));
      } else if ((marker & 0xff00) !== 0xff00) {
        break;
      } else {
        offset += view.getUint16(offset, false);
      }
    }
    return callback(-1);
  };

  reader.readAsArrayBuffer(file);
}

const image = {
  /* 将图片（路径）转换为Base64 */
  getBase64FromImageURL(url, callback) {
    let canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      canvas.height = img.height;
      canvas.width = img.width;
      ctx.drawImage(img, 0, 0);
      const base64URL = canvas.toDataURL('image/png');
      callback(base64URL);
      canvas = null;
    };
    img.src = url;
  },
  /* 将base64转换为file类型 */
  getFileFromBase64(base64URL, filename) {
    const arr = base64URL.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    const n = bstr.length;
    let u8arr = new Uint8Array(n);
    while ((n -= 1)) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    // alert(mime)
    return new File([u8arr], filename, { type: 'image/png' });
  },
};

function saveImage(_canvas, _name) {
  const imagebase64 = _canvas
    .toDataURL('image/png')
    .replace('image/png', 'image/octet-stream');
  const imgURL = image.getFileFromBase64(imagebase64, 'imgName');

  return imgURL;
}

function createIMG(name) {
  const scale = 0.35;
  const video = document.getElementById(name);
  const canvas = document.createElement('canvas');

  canvas.width = video.videoWidth * scale;
  canvas.height = video.videoHeight * scale;

  let flag = true;
  for (let flag = true; flag; ) {
    if (canvas.width > 400) {
      canvas.width *= 0.9;
      canvas.height *= 0.9;
    } else {
      flag = false;
    }
  }
  canvas.getContext('2d').drawImage(video, 0.5, 1, canvas.width, canvas.height);
  const imageFile = saveImage(canvas, name);
  const imageURL = createObjectURL(imageFile);
  console.log('imageURL', imageURL);

  const poster = document.createElement('img');
  poster.src = imageURL;
  poster.style = 'width:100%;height:100%';

  video.parentNode.appendChild(poster);
}
