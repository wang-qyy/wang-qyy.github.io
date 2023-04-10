import { mainHost } from '@/config/http';
import { stringify } from 'qs';

export function getMemoryInfo() {
  return mainHost.get('/file/memory-info');
}

interface GetAllUploadFileParams {
  page: number;
  folderId?: number;
  pageSize: number;
}
/**
 * @description 获取全部上传文件列表
 */
export function getAllUploadFile(params?: GetAllUploadFileParams) {
  const { folderId = 0, ...others } = params || {
    page: 1,
    pageSize: 20,
  };

  return mainHost.get(
    `/file/${folderId}/lists?${stringify(others)}&type=editor`,
  );
}

interface GetUploadFilesByTypeParams {
  page: number;
  pageSize: number;
  type: 'video' | 'audio' | 'image' | 'font';
  folder_id?: string;
}
/**
 * 单个类型文件列表
 * */
export function getUploadFilesByType(params: GetUploadFilesByTypeParams) {
  return mainHost.get(`/file/media-list?${stringify(params)}`);
}

/**
 * @description 获取二维码上传图片的文件夹ID
 */
export function getFolderIdByTitle(title: string) {
  return mainHost.get(`/file/get-system-folder?title=${title}`);
}
/**
 * @description 文件类型
 * @type icon 图标
 * @type recording 录音文件
 */
type UploadSourceTag = 'icon' | 'recording';

interface CheckFileExitsParams {
  file_md5: string;
  filename: string;
  folder_id?: string;
  orientationFlag?: number;
  source_tag?: UploadSourceTag;
}
/**
 * @description 判断文件是否存在
 */
export function checkFileExits(params: CheckFileExitsParams) {
  return mainHost.get(`/file/exits?${stringify(params)}`);
}

interface AddFileParams {
  folder_id?: string;
  type?: string;
  title: string;
  file_md5: string;
  source_tag?: UploadSourceTag;
}
/**
 * @description 添加文件
 */
export function addFile(params: AddFileParams) {
  const { folder_id = 0, ...others } = params;

  const formData = new FormData();
  Object.keys(others).forEach(item => {
    formData.append(item, others[item]);
  });

  return mainHost.post(`/file/${folder_id}/add`, { data: formData });
}

export function getUploadOssForm(params: {
  filename: string;
  folder_id: string;
  orientationFlag: number;
}) {
  return mainHost.get(`/file/get-base-up-params?${stringify(params)}`);
}

// 全部分类里 删除文件
export function deleteFiles(fileIds: string[], folderId = '0') {
  const formData = new FormData();
  fileIds.forEach((item, index) => {
    formData.append(`ids[${index}]`, item);
  });

  return mainHost.post(`/file/${folderId}/del`, { data: formData });
}

// 删除文件
export function deleteFilesWithinType(fileIds: string[]) {
  const formData = new FormData();
  fileIds.forEach((item, index) => {
    formData.append(`ids[${index}]`, item);
  });
  return mainHost.post(`/file/multi-del`, { data: formData });
}

// 面包屑
export function getBreadNav(folder_id: string) {
  return mainHost.get(`/file/bread-nav?id=${folder_id}`);
}

// 检测文件转码状态
export function checkFileState(fileIds: string[]) {
  const formData = new FormData();
  fileIds.forEach((item, index) => {
    formData.append(`file_ids[${index}]`, item);
  });

  return mainHost.post(`/file/check-transcode-state`, { data: formData });
}

// 字体列表
export function getFontList(params: {
  page: number | string;
  pageSize: number | string;
}) {
  return mainHost.get(
    `/font/lists?page=${params.page}&pageSize=${params.pageSize}`,
  );
}

// 文件详情
export function getFontDetail(id: number | string) {
  return mainHost.get(`/file/info?file_id=${id}`);
}

// 获取录音文件夹
export function getRecorderFolder() {
  return mainHost.get(`/file/get-system-folder?title=我的录音`);
}

/**
 * @descript 视频文件上传提交表单
 * @param scope_type 'bg'-背景视频 | 'lottie'-内嵌视频
 */
export function videoFileUploadSubmit(params: any) {
  return mainHost.post('/creator-api/resource/video-submit', { data: params });
}

/**
 * @descript 视频文件上传提交表单
 * @param scope_type 'bg'-背景视频 | 'lottie'-内嵌视频
 */
export function imageFileUploadSubmit(params: any) {
  return mainHost.post('/creator-api/resource/image-submit', { data: params });
}

/**
 * @descript 检查视频文件的合成状态
 */
export function getVideoFileStatus(ids: string[]) {
  return mainHost.post('/creator-api/my/video-status', { data: { ids } });
}
