import { mainHost } from '@/config/http';
import { stringify } from 'qs';

// 音乐分类
export function getMusicClassify() {
  return mainHost.get('/video/audio-class-tree');
}

// 音乐列表
export function getMusicList(params: {
  keyword: string;
  class_id: number | null;
  page: number;
}) {
  const { keyword, class_id, page } = params;
  return mainHost.get(`/video/audio-search-v2?${stringify(params)}`);
}
export function uploadAudio(data: {
  name: string;
  type: string;
  size: number;
  source_type?: string;
}) {
  // 默认为上传 source_type参数，1-上传，2-AI文字转语音，3-录音
  const source_type = data.source_type || '1';
  return mainHost.get(
    `/user-upload/audio-payload?name=${data.name}&type=${data.type}&size=${data.size}&source_type=${source_type}`,
  );
}

// 上传音乐列表
export function getUploadMusicList(params: { page: number }) {
  const { page } = params;
  return mainHost.get(`/video/my-audio?p=${page}`);
}
// 上传音乐列表 source_type参数，1-上传，2-AI文字转语音，3-录音
export function getUploadMusicListByType(params: {
  page: number;
  sourceType: string;
}) {
  const { page, sourceType } = params;
  return mainHost.get(`/video/my-audio?p=${page}&source_type=${sourceType}`);
}
// 删除上传音乐
export function getDeleteMyAudio(data: { id: string | number }) {
  const { id } = data;
  return mainHost.post(`/video/del-my-audio`, {
    body: `res_id=${id}`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
}
// 获取AI语音角色
export function getAIVoices() {
  return mainHost.get(`/user-upload/ai-voices`);
}
// 上传AI语音 /user-upload/ai-audio
export function uploadAiAudio(data: {
  type: string; // 类型，0-试听，1-应用
  text: string; // 合成文本，不超300字
  voice_key: string; // 角色key
  speed: number; // 语速 0.5~2之间，默认1
  nc_sessionId: string;
  nc_sig: string;
  nc_token: string;
}) {
  const formData = new FormData();
  Object.keys(data).forEach(item => {
    formData.append(item, data[item]);
  });
  return mainHost.post(`/user-upload/ai-audio`, { data: formData });
}

// 获取我的音乐素材内容 source_type = 1，上传 source_type = 2，AI文字配音 source_type = 3，录音
export function getMyMusicList(params: { page: number; sourceType: string }) {
  const { page, sourceType = '2' } = params;
  return mainHost.get(`/video/my-audio?p=${page}&source_type=${sourceType}`);
}
// 设计设端音乐列表
export function getMaterialAudioList(
  params: {
    page: number;
    pageSize: number;
    keyword?: string;
    class_id?: string | number;
  } = { page: 1, pageSize: 40 },
) {
  return mainHost.get(
    `/creator-api/resource/material-audio?${stringify(params)}`,
  );
}

// 设计设端音乐标签列表
export function getMusicLabel() {
  return mainHost.get(`/label-api/material-audio`);
}

// 设计师端音效列表
export function getMusicEffect(params: {
  filter_id: string;
  page_num: number;
  page_size: number;
  keyword: string;
}) {
  return mainHost.get(`/resource-api/search?${stringify(params)}`);
}

// 设计师端音效分类列表
export function getMusicEffectClassify(params = { filter_id: '1230860' }) {
  return mainHost.get(`/resource-api/sub-filters-tree?${stringify(params)}`);
}

// 获取ai语音下载次数
export function getAudioInfo() {
  return mainHost.get(`/user-upload/audio-info`);
}

// 检测录音是否违规
export function getAudioScan(pram: any) {
  const { ids } = pram;
  const formData = new FormData();
  ids.forEach((item, index) => {
    formData.append(`ids[${index}]`, item);
  });

  return mainHost.post(`/user-upload/audio-scan`, { data: formData });
}

/** ****音乐2.0优化后接口********* */
// 标签音乐列表
export function getTagMusicList(filter_id: string) {
  return mainHost.get(`/resource-api/sub-fronts?filter_id=${filter_id}`);
}
// 音乐-标签列表
export function getTagList(pid: string) {
  return mainHost.get(`/label-api/material-audio?pid=${pid}`);
}
// 搜索列表 音乐-音效
export function getSearchList(params: {
  keyword: string;
  class_id: string;
  resource_flag: string;
  pageSize: number;
  page: number;
  filter_id?: string;
}) {
  const { keyword, class_id, pageSize, page, resource_flag, filter_id } =
    params;
  return mainHost.get(
    `/resource-api/search?resource_flag=${resource_flag}&class_id=${class_id}&page_num=${page}&page_size=${pageSize}&keyword=${keyword}&filter_id=${filter_id}`,
  );
}
export function uploadRecorderAudio(data: {
  filename: string;
  file_md5: string;
  folder_id: string;
  file_type?: string;
}) {
  return mainHost.get(
    `/file/exits?filename=${data.filename}&file_md5=${data.file_md5}&folder_id=${data.folder_id}&source_tag=${data.file_type}`,
  );
}
export function recorderAudioAdd(data: {
  title: string;
  file_md5: string;
  folder_id: string;
  type: string;
  source_tag: string;
}) {
  const formData = new FormData();
  Object.keys(data).forEach(item => {
    formData.append(item, data[item]);
  });
  return mainHost.post(`/file/${data.folder_id}/add`, {
    data: formData,
  });
}
export function getMyAudio(params: { page: number; pageSize: number }) {
  const { page, pageSize } = params;
  return mainHost.get(
    `/file/media-list?type=audio&page=${page}&pageSize=${pageSize}`,
  );
}
// 音乐-子标签列表
export function getSubTagList(filter_id: string) {
  return mainHost.get(`/resource-api/sub-filters?filter_id=${filter_id}`);
}
// 获取搜索的结果总数
export function getSearchListTotal(data: { keyword: string; params: any }) {
  const formData = new FormData();
  Object.keys(data).forEach(item => {
    formData.append(item, data[item]);
  });
  return mainHost.post(`/resource-api/search-count`, {
    body: JSON.stringify(data),
  });
}
