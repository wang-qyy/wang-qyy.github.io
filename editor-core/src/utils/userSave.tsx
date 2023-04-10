import { message } from 'antd';
import { stringify } from 'qs';

import { recordHistory, getAllTemplatesWhenSave, toJS } from '@hc/editor-core';
import {
  getTemplate,
  updateDocMd5,
  updateDataInfo,
} from '@/store/adapter/useTemplateInfo';
import { getUserId } from '@/store/adapter/useUserInfo';
import { getGuideInfo } from '@/store/adapter/useGlobalStatus';

import { openLoadError, BtnType, openSaveError } from '@/hooks/useLoadError';
import { windowBeforeUnload } from '@/utils/single';

import { store } from '@/store';

import getUrlProps from '@/utils/urlProps';
import { userSave } from '@/api/pub';
import { designerCreateTemplate, designerUpdateTemplate } from '@/api/template';
import { convertDataForSave } from '@/utils/simplify';
import { draftOpenLimit } from '@/utils/draftOpenLimit';
import { SaveGuide } from '@/pages/Help/Guide/variable';
import { clickActionWeblog, editWebLog } from './webLog';

function formater(payload) {
  const templateInfo = getTemplate();
  const { upicid: userUpicid, ...info } = payload ?? {};

  const allTemplates = convertDataForSave(getAllTemplatesWhenSave());

  const { picId, pram, upicId, redirect, resourceId } = getUrlProps();

  const params = {
    // ...templateInfo,
    id: userUpicid ?? upicId,
    picId,
    pram,
    title: templateInfo.title,
    lastTemplId: picId || templateInfo.picId,
    from_gid: resourceId, // 用户记录来自引用的资源GID
    templ_id:
      templateInfo.templ_id > 0 ? templateInfo.templ_id : templateInfo.picId,
    width: templateInfo.canvasInfo.width,
    height: templateInfo.canvasInfo.height,
    doc_md5: templateInfo.doc_md5,
    template_type: redirect === 'module' ? 41 : 4,
    doc: {
      canvas: templateInfo.canvasInfo,
      ...allTemplates.doc,
    },
    ...info,
  };

  return params;
}

export const getformater = info => {
  const params = formater(info);
  return params;
};
let timer: NodeJS.Timeout | null = null;

// 保存状态
export function changeSaveState(status: number, delay?: number) {
  if (delay) {
    timer = setTimeout(() => {
      store.dispatch({
        type: 'globalStatus/setUserSaveStat',
        payload: status,
      });

      if (status === 2) {
        windowBeforeUnload.close();
      }
    }, delay);
  } else {
    timer && clearTimeout(timer);
    store.dispatch({
      type: 'globalStatus/setUserSaveStat',
      payload: status,
    });
    if (status === 2) {
      windowBeforeUnload.close();
    }
  }
}
// 保存时间
function changeSaveTime(time: number) {
  store.dispatch({
    type: 'globalStatus/setUserSaveTime',
    payload: time,
  });
}
// 保存指引
function openGuideInfo() {
  store.dispatch({
    type: 'globalStatus/setGuidePopover',
    payload: SaveGuide,
  });
}
//  登录弹框
function openLoginModal() {
  store.dispatch({
    type: 'globalStatus/setLoginModal',
    payload: true,
  });
}

//  超限提醒弹框
function openCapacityToRemindModal() {
  store.dispatch({
    type: 'globalStatus/setCapacityToRemindModal',
    payload: true,
  });
}

interface saveInfoParams {
  info?: object;
  onSuccess?: (response: any) => void;
  autoSave?: boolean;
}

// 保存
const saveInfo = async ({ info, onSuccess, autoSave }: saveInfoParams = {}) => {
  const isDesigner = getUrlProps().redirect === 'designer';

  changeSaveState(1);
  const templateInfo = getTemplate();

  const params = formater(info);
  const { renovate_type } = getUrlProps();

  let response = {};

  try {
    if (isDesigner) {
      let res;
      const newParams = JSON.parse(JSON.stringify(params));

      newParams.renovate_type = renovate_type;
      newParams.action_type = templateInfo?.action_type;

      if (params.id) {
        res = await designerUpdateTemplate(newParams);
      } else {
        res = await designerCreateTemplate(newParams);
      }
      // 存储设计师保存时返回的info信息
      updateDataInfo(res.data?.info);
      response = { code: res.code, ...res.data };
    } else {
      response = await userSave(params);
    }

    const { stat, code, msg } = response;

    // console.log('stat', stat);
    if (stat === 1 || code === 0) {
      if (onSuccess) {
        onSuccess(response);
      }

      changeSaveTime(new Date().valueOf()); // 保存时间

      const { picId, redirect, srm } = getUrlProps();
      changeSaveState(3); // 过渡状态 已为您自动保存
      changeSaveState(2, 1000);
      updateDocMd5(response.info.doc_md5);

      // if (picId) {
      draftOpenLimit(response.info.id);

      window.history.replaceState(
        '',
        document.title,
        `?${stringify({ redirect, upicId: response.info.id, srm })}`,
      );

      // }
    } else if (stat === -14) {
      openLoadError('保存失败', '当前模板与登录账号不统一');
      changeSaveState(5);
    } else if (stat === -15) {
      changeSaveState(5);
      openLoadError(
        '保存失败',
        '当前模板已在其他页面修改并保存过啦，请刷新后读取最新草稿保存记录！',
        BtnType.reload,
      );
    } else if (stat === -30) {
      if (!store.getState()?.globalStatus?.downloadTheTransfiniteModal) {
        openCapacityToRemindModal();
      }
      changeSaveState(5);
    } else {
      // message.error('保存失败！请稍后重试');
      openSaveError(msg);
      changeSaveState(5);
    }
    if (stat !== 1 && !isDesigner) {
      clickActionWeblog('save_failed', { action_label: stat });
    }
  } catch (error) {
    if (!isDesigner) {
      clickActionWeblog('save_failed', { action_label: error.type });
    }

    if (error.type === 'Timeout') {
      message.error('保存超时，请检查您的网络');
    } else {
      message.error('保存失败！请稍后重试！');
    }
    // message.error(error);
    changeSaveState(6);
    console.error(error);
    console.log(error.type);
  }
};

let countNum = 0;

interface SaveParams {
  isChecked?: boolean;
  info?: {};
  autoSave?: boolean;
  onSuccess?: (response: any) => void;
}

export const onSave = async ({
  isChecked,
  info,
  autoSave,
  onSuccess,
}: SaveParams = {}) => {
  const userId = getUserId();
  if (!autoSave) {
    console.log('onSave', store.getState().globalStatus.userSaveStat);
  }
  if (store.getState().globalStatus.userSaveStat === 1) {
    clickActionWeblog('save-loading');
    return;
  }

  // isChecked  登录后立即触发保存
  if (!isChecked && userId <= 0) {
    changeSaveState(4);
    // 未登录情况下，每触发五次自动保存-触发登录一次提醒
    // if (autoSave) {
    //   if (getGuideInfo().visible) return;
    //   console.log('autoSave', countNum);

    //   countNum += 1;
    //   // console.log(countNum);
    //   if (countNum < 5) {
    //     return;
    //   }
    //   openGuideInfo();
    //   countNum = 0;
    //   return;
    // }
    openLoginModal();
    return;
  }

  saveInfo({ info, onSuccess, autoSave });
};

function debounceFn(fn: (params: SaveParams) => void) {
  const wait = 2000;

  let timer: any;

  let flag: any;

  return (params: SaveParams) => {
    // 未登录情况下，每触发五次自动保存-触发登录一次提醒
    if (params.autoSave && getUserId() <= 0 && !params.isChecked) {
      if (getGuideInfo().visible) return;

      countNum += 1;
      if (countNum < 5) {
        return;
      }
      openGuideInfo();
      countNum = 0;
      return;
    }

    // 如果没有创建延迟执行函数（later），就创建一个
    if (!timer) {
      timer = setTimeout(() => {
        // 延迟函数执行完毕，清空缓存的定时器序号
        timer = undefined;
      }, wait);

      fn(params);
    } else {
      // 如果已有延迟执行函数（later），调用的时候清除原来的并重新设定一个
      clearTimeout(timer);
      clearTimeout(flag);
      timer = setTimeout(() => {
        // 延迟函数执行完毕，清空缓存的定时器序号
        fn(params);

        //  保存接口1秒内仅能调用一次
        clearTimeout(flag);
        flag = setTimeout(() => {
          timer = undefined;
        }, wait);
      }, wait);
    }
  };
}

export const handleSave = debounceFn(onSave);

// 用户主动触发保存
export const manualSave = (params: SaveParams = {}) => {
  const success = params.onSuccess;
  const onSuccess = (res: any) => {
    // TODO: 用户首次保存成功状态记录，暂时写在 localStorage，是否存到服务端另讨论
    const saved = localStorage.getItem('saved');
    if (!saved) {
      message.success(
        <span>
          成功上传云端:您可直接访问{' '}
          <a href="https://xiudodo.com/myspace/videos">我的作品</a> 查
        </span>,
      );
      localStorage.setItem('saved', '1');
      return;
    }
    // 判断是否有更改 判断逻辑暂时为 当上一次保存失败时
    const hasEdit = store.getState().globalStatus.userSaveStat === 5;
    if (hasEdit) message.success('保存成功!');
    else message.success('文件已保存!');
    success && success(res);
  };
  params.onSuccess = onSuccess;
  handleSave(params);
};

(window as any).EDITOR_DEBUG.handleSave = handleSave;
(window as any).EDITOR_DEBUG.getSaveParams = formater;
(window as any).EDITOR_DEBUG.copy = (upicid = '') => {
  handleSave({ info: { upicid } });
};

(window as any).EDITOR_DEBUG.getSaveStatus = () => {
  console.log('getSaveStatus', store.getState().globalStatus.userSaveStat);
};
