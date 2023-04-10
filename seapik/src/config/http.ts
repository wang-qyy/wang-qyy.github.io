import { message } from 'antd';
import { extend } from 'umi-request';

const codeStatus = {
  0: '请求成功',
  1001: '未登录',
  1002: '参数不合法',
  1003: '请求失败',
  1004: '资源不存在',
  1005: '请求异常，需要手动处理。不做全局拦截',
};

const isDev = process.env.NODE_ENV === 'development';

const baseUrl =
  window.location.host === 'edit.seapik.com'
    ? 'seapik.com'
    : 'ajax.pngtree.com';

export const mainHost = extend({
  prefix: isDev ? '/mainHostApi' : `//${baseUrl}`,
  timeout: 30000,
  credentials: 'include',
});

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
      // @ts-ignore
      message.error(res.msg ?? codeStatus[res.code]);
      return null;
    }
    return res;
  },
};
