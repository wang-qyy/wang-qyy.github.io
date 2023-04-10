const baseUrl = 'https://xiudodo.com';
function checkStatus(response) {
  if (response.status >= 200 && request.status < 300) {
    return response;
  }
  const error = new Error(response.statusText);
  error.response = response;
  throw error;
}

function parseJSON(response) {
  return response.json;
}

function request(url, method = 'GET', params) {
  // return fetch(`${baseUrl}${url}`, {
  //   method,
  //   mode: "cors",
  //   headers: {
  //     "Content-Type": "application/json",
  //   },
  // })
  //   .then(checkStatus)
  //   .then(parseJSON)
  //   .then((res) => {
  //     console.log("onsuccess", url, res.json());
  //   })
  //   .catch((error) => {
  //     console.log(error);
  //   });

  return new Promise(function (resolve, reject) {
    const req = new XMLHttpRequest();
    req.withCredentials = true;
    req.open(method, `${baseUrl}${url}`, true);
    // req.open(method, `${url}`, true);

    req.setRequestHeader('x-access-token', getUrlParams().access_token);
    req.onload = function () {
      if (req.status === 200) {
        const data = req.responseText && JSON.parse(req.responseText);
        resolve(data);
      } else {
        reject(new Error(req.statusText));
      }
    };
    req.onerror = function (e) {
      reject(e);
    };
    req.send(params);
  });
}

function createFormData(file, data) {
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
function buildOssURL(data) {
  return `//${data.bucket}.${data.endpoint}`;
}

function getMemoryInfo() {
  return request('/file/memory-info');
}

// 添加文件
function addFile(params) {
  const { folder_id = 0, ...others } = params;
  const formData = new FormData();
  Object.keys(others).forEach(item => {
    formData.append(item, others[item]);
  });
  return request(`/file/${folder_id}/add`, 'POST', formData);
}
// 检测文件是否存在
function checkFileExits({ file_md5, filename, folder_id, orientationFlag }) {
  return request(
    `/file/exits?file_md5=${file_md5}&filename=${filename}&folder_id=${folder_id}&orientationFlag=${orientationFlag}`,
  );
}

// 获取oss信息
function getUploadOssForm(filename, folder_id, orientationFlag) {
  return request(
    `/file/get-base-up-params?filename=${filename}&folder_id=${folder_id}&orientationFlag=${orientationFlag}`,
  );
}

function FileSender({ onprogress, url }) {
  const send = formData => {
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

function FileUpload(fileInfo, folder_id) {
  const { file } = fileInfo;
  const { name: filename } = file;

  // 上传成功
  function onSucceed() {
    const fileDom = document.getElementById(fileInfo.id);
    fileDom.classList.add('content-list-item-upload-success');
  }

  function onError(desc) {
    const progressBar = document.getElementById(`progress_bar_${fileInfo.id}`);
    const progressNum = document.getElementById(`progress_desc_${fileInfo.id}`);
    progressNum.innerHTML = `<div style="color:#FFA134">${desc || '上传失败!'
      }</div>`;
    progressBar.style.width = `${100}%`;
  }

  function setProgress(progress) {
    const progressBar = document.getElementById(`progress_bar_${fileInfo.id}`);
    const progressNum = document.getElementById(`progress_desc_${fileInfo.id}`);

    progressBar.style.width = `${progress}%`;
    progressNum.innerText = `${progress}%上传`;
  }

  // 进度条处理
  const handleProgress = evt => {
    if (evt.lengthComputable && typeof setProgress === 'function') {
      const progress = Math.round((evt.loaded / evt.total) * 100);
      setProgress(progress > 99 ? 99 : progress);
    }
  };

  // 上传
  async function upload(ossForm) {
    try {
      // 构建上传所需的参数
      const formData = createFormData(file, ossForm.data);
      const ossURl = buildOssURL(ossForm.data);

      // 上传
      const { send } = FileSender({
        url: ossURl,
        onprogress: evt => handleProgress(evt, file),
      });
      const flag = await send(formData);
      if (flag.code === 0) {
        onSucceed(flag.data);
      } else {
        onError(flag);
      }
    } catch (error) { }
  }

  // 添加到用户列表
  async function handleAddFile(md5) {
    const addFileRes = await addFile({
      file_md5: md5,
      title: file.name,
      folder_id,
      type: 'file',
    });

    if (addFileRes.code === 0) {
      onSucceed(addFileRes.data);
    } else {
      onError(addFileRes);
    }
  }

  // 判断文件是否存在
  function isFileExits(md5) {
    setProgress(10);

    getOrientation(file, async orientation => {
      let orientationFlag = 0;
      if (orientation > 4 && orientation <= 8) {
        orientationFlag = 1;
      }

      const res = await checkFileExits({
        file_md5: md5,
        filename,
        folder_id,
        orientationFlag,
      });

      switch (String(res?.code)) {
        case '0': // 文件存在 添加文件
          handleAddFile(md5);
          break;
        case '1005':
          {
            const { err } = res.data;

            if (err === 'fileBlock') {
              // 文件涉嫌违规，无法上传
              onError('文件涉嫌违规，无法上传');
            } else if (err === 'fileNotExist') {
              // 上传文件
              upload(res);
            }
          }
          break;
      }
    });
  }

  // 计算MD5
  function getMD5() {
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
        isFileExits(_md5);
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

  const uploadStat = () => {
    try {
      getMD5();
    } catch (err) {
      onError && onError(err);
    }
  };

  return { uploadStat };
}
