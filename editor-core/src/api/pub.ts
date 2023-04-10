import { mainHost } from '@/config/http';
import { saveHostName } from '@/config/urls';

export const getPaySkus = () => {
  return mainHost.get('/pay/pay-skus');
};

/**
 * @param pkgId 需要被升级的会员包id
 */
export function getUpgSkus(pkgId?: number) {
  return mainHost.get('/pay/upg-skus', { params: { pkg_id: pkgId } });
}

// eslint-disable-next-line camelcase
export const checkOrder = (order_no: string | number) => {
  return mainHost.get(`/pay/check-order/${order_no}`);
};

export const createPay = (
  sku_code: string | number,
  srm: {
    source_srm?: string;
    focus_srm?: string;
  },
  prams?: {
    cid?: string; // 优惠券参数
    rch_type?: string;
    pkg_id?: number;
  },
) => {
  const data = new FormData();

  data.append('sku_code', sku_code);
  data.append('source_srm', srm?.source_srm || '');
  data.append('focus_srm', srm?.focus_srm || '');
  prams?.cid && data.append('cid', prams?.cid || '');
  prams?.rch_type && data.append('rch_type', prams?.rch_type || '');
  prams?.pkg_id && data.append('pkg_id', String(prams?.pkg_id) || '');
  return mainHost.post('/pay/create-pay', {
    data,
  });
};

export const payNotify = (pay_channel: string | number) => {
  return mainHost.post(`/pay/create-pay/${pay_channel}`);
};
// 获取下载次数
export const downloadInfo = () => {
  return mainHost.get(`/download-api/info`);
};

export const getWeChatQrcode = (linkExtraStr: string) => {
  return mainHost.get(`/auth/wxlogin-code?authclient=official${linkExtraStr}`);
};
export const checkWechatLoginStatus = (wechatNumber: string | number) => {
  return mainHost.post(`/auth/wxlogin-check`, {
    body: `number=${wechatNumber}`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
};
export const wechatOfficialLogin = ({
  weChatNumber,
  login_page,
}: {
  weChatNumber: string | number;
  login_page: string | number;
}) => {
  return mainHost.get(`/site/wechat-official-login`, {
    params: {
      authclient: 'wechat',
      isAjax: 1,
      scope: 'snsapi_login',
      number: weChatNumber,
      refer: '',
      auto_login: '',
      login_page,
    },
  });
};
export const qqLogin = (linkExtraStr: string) => {
  return `//xiudodo.com/auth/auth-login?authclient=qq&isAjax=1${linkExtraStr}`;
};
export const sendTelLoginCode = (phoneNum: string | number) => {
  return mainHost.get(`/site-api/send-tel-login-code?num=${phoneNum}`);
};

export const telLoginCallback = ({
  phoneNum,
  phoneMsgNum,
}: {
  phoneNum: number;
  phoneMsgNum: number;
}) => {
  return mainHost.post(`/auth/code-autologin?isAjax=1`, {
    body: `telCode=${phoneMsgNum}&telNum=${phoneNum}`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
};
export const getUserInfo = () => {
  return mainHost.get(`/api/getuserinfo`);
};

// 下载接口
export const applyExport = ({
  id,
  format,
  pixel_type,
  type,
  data,
}: {
  id: number | string;
  format: string;
  pixel_type: string;
  type?: string;
  data?: any;
}) => {
  return mainHost.post(`/download-api/apply-export`, {
    body: `id=${id}&pixel_type=${pixel_type}&format=${format}&type=${type || ''
      }&nc_sessionId=${data?.sessionId || ''}&nc_sig=${data?.sig || ''
      }&nc_token=${data?.token || ''}`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    // data: {
    //   id,
    //   pixel_type,
    //   format: 'mp4'
    // }
  });
};

export const checkExport = (job_id: string) => {
  return mainHost.get(`/download-api/check-export/${job_id}`);
};

export function userSave(data) {
  return mainHost.post(
    `/api/user-save-templ?startTime=${new Date().getTime()}`,
    {
      body: JSON.stringify(data),
    },
  );
}

export function getShareLink() {
  return mainHost.get('/apiv2/get-invite-link');
}

// 优惠券弹出判断
export function getShowCoupon() {
  return mainHost.get(`/coupon/show-coupon-popup`);
}

// 优惠券过期提示
export function getCouponTips() {
  return mainHost.get(`/coupon/expire-tips`);
}

// 领取优惠券
export function getReceiveCoupon(data: any) {
  const formData = new FormData();
  Object.keys(data).forEach(item => {
    formData.append(item, data[item]);
  });

  return mainHost.post(`/coupon/receive-coupon`, {
    data: formData,
    // headers: {
    //   'Content-Type': 'application/json',
    // },
  });
}

// 特价优惠券是否显示
export function getStatsCloseRecharge() {
  return mainHost.get(`/home-api/stats-close-recharge`);
}

// 特价优惠券关闭
export function getStatsCloseBargainPrice() {
  return mainHost.get(`/home-api/close-bargain-price`);
}

// 获取webm频频帧
export function getWebMVideoFrame({
  frame_file,
  img_count,
  img_step,
}: {
  frame_file: string;
  img_count: number;
  img_step: number;
}) {
  return mainHost.get(
    `/video/small-frame-previews?frame_file=${frame_file}&img_count=${img_count}&img_step=${img_step}`,
  );
}

// 设计师端提交模板
export function submitTemplate(templateId: number, params: any) {
  return mainHost.post(`/creator-api/template/${templateId}/submit`, {
    body: JSON.stringify(params),
  });
}

// 生成邀请链接
export function getTeamCreateInviteLink() {
  return mainHost.get(`/team/create-invite-link`);
}

// 生成邀请注册链接
export function getInviteLink() {
  return mainHost.get(`/user/get-invite-link`);
}

// 开年大吉活动入口是否展示
export function getDisplayJudge() {
  return mainHost.get(`/home-api/act-display-judge?type=oneBuy`);
}

// ### 分享优惠券活动  生成链接
export function getgeneratelink() {
  return mainHost.get(`/activity/generate-link`);
}

// 合成状态接口
export const checkDownloads = (fileIds: string[]) => {
  const formData = new FormData();
  fileIds.forEach((item, index) => {
    formData.append(`download_ids[${index}]`, item);
  });
  return mainHost.post(`/download-api/check-downloads`, {
    data: formData,
  });
};
/**
 * 组件提交分类
 * */
export function getModuleCategory() {
  return mainHost.get(`/editor/module-class-list`);
}

/**
 * 获取侧边菜单
 * */
export function getMenuInfo() {
  return mainHost.get(`/workspace/editor-menu-info`);
}

// 侧边菜单设置
export const editorMenuSet = (menu_mark: string) => {
  const data = {
    menu_mark,
  };
  return mainHost.post(`/workspace/editor-menu-set`, {
    data,
  });
};

// 微信公众号ID二维码识别https://xiudodo.com/qrcode/wx-qrdecode
// gh_3fe6ee52ee0e
export function getWxQrDecode(params: { username: string }) {
  return mainHost.post(`/qrcode/wx-qrdecode`, {
    data: params,
  });
}
