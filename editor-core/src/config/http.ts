import { message } from 'antd';
import { extend } from 'umi-request';
import { hostName } from '@/config/urls';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const codeStatus = {
  0: '请求成功',
  1001: '未登录',
  1002: '参数不合法',
  1003: '请求失败',
  1004: '资源不存在',
  1005: '请求异常，需要手动处理。不做全局拦截',
};

export const mainHost = extend({
  prefix: `//${hostName}`,
  timeout: 30000,
  credentials: 'include',
});

// request.interceptors.response.use(response => {
//   const codeMaps = {
//     502: '网关错误。',
//     503: '服务不可用，服务器暂时过载或维护。',
//     504: '网关超时。',
//   };
//   message.error(codeMaps[response.status]);
//   return response;
// })
// todo 错误code统一处理
// mainHost.use(
//   async (ctx, next) => {
//     const {req} = ctx;
//     const {code, msg} = req
//     if (code !== 0) {
//       message.error(msg ?? codeStatus[code]);
//     }
//     next()
//     return;
//   },
//   {global: true}
// );

export const useRequestGlobalConfig = {
  formatResult: (res: any) => {
    // 兼容旧版本
    if (res.code !== undefined) {
      if (res.code === 0) {
        return res.data;
      }
      if (res.code === 1005) {
        return res;
      }
      message.error(res.msg ?? codeStatus[res.code]);
      return null;
    }
    return res;
  },
};
