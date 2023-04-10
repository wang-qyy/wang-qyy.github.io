const ua = navigator.userAgent.toLowerCase(); // 获取判断用的对象

if (ua.match(/MicroMessenger/i) == 'micromessenger') {
  // 在微信中打开
  // alert('在微信中打开')

  document.addEventListener('click', function () {
    const videos = document.querySelectorAll('video');
    videos.forEach(item => {
      item.play();
    });
  });
}

const fileupload = document.getElementById('fileupload'); // 上传input
const list = document.querySelector('.content-list'); // 列表

const okBtn = document.querySelector('.buttom-ok-btn'); // 确定按钮

let files = []; // 上传列表
let sumAllFileSize = 0; // 已选文件大小总和

const limitFileSize = 1024 * 1024 * 1024;

// 继续添加
function getMoreUpload() {
  fileupload.click();
}

// 确定
function onOk() {
  list.classList.remove('list-visible');
  okBtn.classList.remove('buttom-ok-btn-visible');
  list.innerHTML = '';
  files = [];
}

// 文件操作 （删除）
list.addEventListener('click', e => {
  const { target } = e;
  const actionType = target.getAttribute('aria-label');
  const fileId = target.getAttribute('id');

  if (actionType === 'delete') {
    list.removeChild(target.parentElement);
    files = files.filter(item => `delete-${item.id}` !== fileId);

    if (files.length < 1) {
      onOk();
    }
  }
});

// 创建dom节点
function createElement(type, fileInfo) {
  try {
    const fileItem = document.createElement('div');
    fileItem.className = 'content-list-item';
    fileItem.setAttribute('id', fileInfo.id);

    if (fileInfo.error) {
      const progress = document.createElement('div');
      progress.className = 'uploading-default uploading-error';
      progress.innerHTML = `<div class="upload-progress-text">${fileInfo.error}</div></div>`;
      fileItem.appendChild(progress);
    }

    // 删除按钮
    const closeIcon = document.createElement('div');
    closeIcon.className = 'content-list-item-close';
    closeIcon.innerText = 'X';
    closeIcon.setAttribute('id', `delete-${fileInfo.id}`);
    closeIcon.setAttribute('aria-label', 'delete');
    fileItem.appendChild(closeIcon);

    let content;

    if (type === 'image') {
      content = document.createElement('div');
      content.style = `width:100%;height:100%; background-image:url(${fileInfo.fileURL}); background-repeat:no-repeat;background-size:contain;background-position:center center`;
    } else if (type === 'video') {
      content = document.createElement('video');
      content.src = fileInfo.fileURL;
      content.style = 'width:100%;height:100%';
      // content.controls = true;
      content.autoplay = true;
      content.currentTime = 1000;
      content.id = `video_${fileInfo.id}`;
      content.onplaying = () => {
        content.pause();
      };

      content.setAttribute('x5-playsinline', 'false');
      content.setAttribute('webkit-playsinline', '');
      content.setAttribute('playsinline', '');
      content.setAttribute('x-webkit-airplay', 'allow');

      content.oncanplay = () => {
        const duration = document.createElement('div');
        duration.className = 'file-video-duration';
        duration.innerText = formatNumberToTime(parseInt(content.duration));
        fileItem.appendChild(duration);
      };
    } else if (type === 'audio') {
      content = document.createElement('div');
      content.style = `width: 100 %; height: 100 %; background - image: url(https://js.xiudodo.com/xiudodo-editor/image/mobileUpload/audio.png); background-repeat:no-repeat;background-size:contain;background-position:center center`;
    }

    fileItem.appendChild(content);
    list.appendChild(fileItem);

    fileItem.onclick = () => {
      content.play();
    };
  } catch (error) { }
}

const createObjectURL = function (file) {
  return window[window.webkitURL ? 'webkitURL' : 'URL'].createObjectURL(file);
};

// 获取上传列表
function getUploadFiles(input) {
  if (input.files.length) {
    list.classList.add('list-visible');

    Object.keys(input.files).forEach(async (key, index) => {
      const file = input.files[key];
      const fileType = getFileType(file.type);

      beforeFileUpload(file, fileType, (isAccept, fileInfo) => {
        const fileBaseInfo = {
          fileURL: createObjectURL(file),
          error: isAccept,
          id: `${Date.now()}_${index}`,
        };

        if (!isAccept) {
          sumAllFileSize += file.size;

          if (sumAllFileSize > limitFileSize) {
            fileBaseInfo.error = '添加失败';
            const addBtn = document.querySelector('.bottom-add-file');
            addBtn.disabled = true;
          }
        }

        files.push({ file, ...fileBaseInfo });
        createElement(fileType, fileBaseInfo);
      });
    });
  }
}

// 开始上传
async function startUpload() {
  const { folder_id } = getUrlParams();

  // const memoryRes = await getMemoryInfo();

  // const reader = memoryRes.body.getReader();

  const memoryRes = { data: { useMemoryByte: 0, maxMemoryByte: 1 } };

  let { maxMemoryByte = 0, useMemoryByte = 0 } = memoryRes
    ? memoryRes.data
    : {};

  files.forEach(item => {
    if (item.error) return; // beforeUpload 验证不通过

    const fileItemDom = document.getElementById(item.id);
    const progress = document.createElement('div');
    okBtn.classList.add('buttom-ok-btn-visible');

    useMemoryByte += item.file.size;
    if (false && useMemoryByte > maxMemoryByte) {
      progress.className = 'uploading-default uploading-error ';
      progress.innerHTML = `<div class="upload-progress-text">存储空间已满</div></div>`;
    } else {
      progress.className = 'uploading-default uploading';
      progress.innerHTML = `<div class="upload-progress-text" id="progress_desc_${item.id}">0%上传</div> <div class="upload-progress"> <div id="progress_bar_${item.id}" class="upload-progress-bar" style="width:0" ></div></div>`;

      const { uploadStat } = FileUpload(item, folder_id);

      uploadStat();
    }
    fileItemDom.insertBefore(progress, fileItemDom.childNodes[0]);
  });
}
