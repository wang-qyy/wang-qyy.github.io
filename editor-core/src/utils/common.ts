import getUrlProps from '@/utils/urlProps';
// import { editorPageLog } from './webLog';

// 进入页面埋点
// 放在 webLog 目录中存在循环引用问题
export function editorPageLog(action_type: string): void {
  const params = { action_type };
  window?.xa?.track('editor_page', {
    extra: JSON.stringify(params),
  });
}

export const getCookieByName = (name: string) => {
  const str = document.cookie.split(`${name}=`)[1];

  if (!str) return;
  return str.split(';')[0];
};

export const getDefaultEditMode = () => {
  // 暂时默认只跳转专业版
  return 'professional';
  // const { blankSize } = getUrlProps();

  // // sessionId 和 sessionIsDay 同时存在为新用户
  // const sessionId = getCookieByName('track_session_id');
  // const sessionIsDay = getCookieByName('track_session_is_day');
  // const isNew = sessionId && sessionIsDay;

  // let defaultEditMode = 'concise';

  // const editMode = localStorage.getItem('editMode');

  // // 如果是空白模板，则默认打开专业版
  // if (blankSize) {
  //   localStorage.setItem('editMode', 'professional');
  //   defaultEditMode = 'professional';
  // } else if (editMode) {
  //   defaultEditMode = editMode;
  // } else {
  //   // 老用户 或者 新用户一半概率 默认进入专业版
  //   if (!isNew || Math.random() < 0.5) {
  //     defaultEditMode = 'professional';
  //   }
  // }
  // // editorPageLog(defaultEditMode);
  // localStorage.setItem('editMode', defaultEditMode);
  // return defaultEditMode;
};
