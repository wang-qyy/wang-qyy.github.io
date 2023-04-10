import { mainHost } from '@/config/http';

export const getUserInfo = () => {
  return mainHost.get(`/api/getuserinfo`);
};

export const getWeChatQrcode = (linkExtraStr: String) => {
  return mainHost.get(`/auth/wxlogin-code?authclient=official${linkExtraStr}`);
};
export const checkWechatLoginStatus = (wechatNumber: String) => {
  return mainHost.post(`/auth/wxlogin-check`, {
    body: `number=${wechatNumber}`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
};
export const wechatOfficialLogin = (params: {
  weChatNumber: String;
  login_page: String;
}) => {
  return mainHost.get(`/site/wechat-official-login`, {
    params: {
      authclient: 'wechat',
      isAjax: 1,
      scope: 'snsapi_login',
      number: params.weChatNumber,
      refer: '',
      auto_login: '',
      login_page: params.login_page,
    },
  });
};
export const qqLogin = (linkExtraStr: String) => {
  return `//xiudodo.com/auth/auth-login?authclient=qq&isAjax=1${linkExtraStr}`;
};
export const sendTelLoginCode = (phoneNum: string) => {
  return mainHost.get(`/site-api/send-tel-login-code?num=${phoneNum}`);
};

export const telLoginCallback = (params: {
  phoneNum: string;
  phoneMsgNum: string;
}) => {
  return mainHost.post(`/auth/code-autologin?isAjax=1`, {
    body: `telCode=${params.phoneMsgNum}&telNum=${params.phoneNum}`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
};

export const checkExport = (job_id: String) => {
  return mainHost.get(`/download-api/check-export/${job_id}`);
};

// 用户收藏-模板列表
export const getUserCollectionTemplate = () => {
  return mainHost.get(`/apiv2/get-fav-template-v2`);
};

// 用户收藏-模板列表
export const getUserCollectionImage = () => {
  return mainHost.get(`/apiv2/get-user-drafts`);
};
