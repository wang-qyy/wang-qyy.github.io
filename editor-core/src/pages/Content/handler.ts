import { useState, useEffect } from 'react';
import { useRequest } from 'ahooks';

import { getUserInfo } from '@/api/user';
import { getVideoInfo } from '@/api/videoE';
import { templateTotalDurationLimit } from '@/config/basicVariable';

import {
  addEmptyTemplate,
  getAllTemplates,
  getAllAudios,
  initAudios,
  setCurrentTime,
  initTemplate,
  setLllegelAssetsHandler,
  setAudioEditStatus,
  addTemplateWithNewAsset,
} from '@hc/editor-core';
import {
  useUpdateCanvasInfo,
  useTemplateLoadStatus,
  setLoadFinish,
} from '@/store/adapter/useTemplateInfo';
import {
  formatRawData,
  getAudioEditStatusFromRowData,
  getAudiosFromRowData,
} from '@/utils/simplify';

import getUrlProps from '@/utils/urlProps';

import useGetTemplate from '@/hooks/useGetTemplate';
import {
  useLeftSideInfo,
  useUserCheckerStatus,
} from '@/store/adapter/useGlobalStatus';
import { useUserInfoSetter } from '@/store/adapter/useUserInfo';

import { draftOpenLimit } from '@/utils/draftOpenLimit';

import { setCurrentTemplate } from '@/kernel/store';
import { handleTimeAxisFitScreen } from './Bottom/handler';
import { initCanvasScale } from './Main/CanvasScale/handler';

const SIZE_ENUM = {
  '1080*1920': { ratio: 1080 / 1920, size: { width: 1080, height: 1920 } },
  '1080*1080': { ratio: 1080 / 1080, size: { width: 1080, height: 1080 } },
  '1920*1080': { ratio: 1920 / 1080, size: { width: 1920, height: 1080 } },
  '750*1000': { ratio: 750 / 1000, size: { width: 750, height: 1000 } },
};

interface Size {
  width: number;
  height: number;
}

function getCanvasSize(data: Size) {
  const ratio = data.width / data.height;
  let size = { width: 1080, height: 1920 };

  let num: number;

  Object.keys(SIZE_ENUM).forEach(key => {
    const item = SIZE_ENUM[key];
    const r = Math.abs(item.ratio - ratio);
    if (num === undefined) {
      num = r;
      size = item.size;
    } else if (r < num) {
      num = r;
      size = item.size;
    }
  });

  return size;
}

function getAssetSize(assetSize: Size, canvasSize: Size) {
  const ratio = assetSize.width / assetSize.height;

  let { width } = canvasSize;

  let height = width / ratio;

  if (height > canvasSize.height) {
    height = canvasSize.height;

    width = height * ratio;
  }

  return { width, height };
}

export function useInitCanvas(needDraftLimit = true) {
  const { openSidePanel } = useLeftSideInfo();

  const { update: updateCanvasInfo } = useUpdateCanvasInfo();

  const isLoaded = useTemplateLoadStatus();

  /**
   * @description 数据加载完成后初始化一些交互数据
   * */
  function initFinish() {
    handleTimeAxisFitScreen();
    setTimeout(() => {
      setLoadFinish();
      const container = document.querySelector('.xiudodo-main');
      if (container) {
        initCanvasScale(container);
      }
    });
  }

  // 获取模板
  const getTemplate = useGetTemplate(response => {
    const rawData = formatRawData(response);
    // const newData = divider(rawData[0]);
    if (!window.__EDITOR_PERFORMANCE__.completed) {
      // 资源加载结束
      window.__EDITOR_PERFORMANCE__.user_template_get_ended =
        new Date().getTime();
    }
    if (rawData.length > 0) {
      setLllegelAssetsHandler(response.assets);
      initTemplate(rawData);
      // 默认选中第一个
      // setCurrentTime(0, false);

      // todo 待优化config.wholeTemplate配置后，更换为setTemplateByIndex
      setCurrentTemplate(0);

      const audios = getAllAudios();
      // console.log(bgm);
      // 初次加载，如果不存在音轨，则需要初始化音轨
      if (!audios?.length) {
        const audio = getAudiosFromRowData(response);
        initAudios(audio);

        const replaced = getAudioEditStatusFromRowData(response);
        replaced && setAudioEditStatus(replaced);
      }
      if (!window.__EDITOR_PERFORMANCE__.completed) {
        // 资源加载开始
        window.__EDITOR_PERFORMANCE__.user_resorce_post_start =
          new Date().getTime();
      }
    }

    initFinish();
  });

  // 获取资源
  const getSourceInfo = useRequest(getVideoInfo, {
    manual: true,
    onSuccess(res) {
      if (res) {
        const canvasSize = getCanvasSize(res);

        const assetSize = getAssetSize(res, canvasSize);
        updateCanvasInfo(canvasSize);

        addTemplateWithNewAsset({
          assets: [
            {
              type: 'videoE',
              isBackground: false,
              resId: res.gid,
              rt_url: res.url,
              rt_total_time: res.duration,
              ...assetSize,
            },
          ],
          pageTime: Math.min(res.duration, templateTotalDurationLimit),
          index: 0,
          canvasSize,
        });
        initFinish();
      }
    },
  });

  useEffect(() => {
    // 阻止开发环境热更新重复添加
    if (getAllTemplates().length) return;

    const urlParams = getUrlProps();
    const { template_version } = urlParams;
    if (needDraftLimit) {
      draftOpenLimit();
    }

    // 创建空白模板
    if (urlParams.blankSize) {
      const blankSize = urlParams.blankSize.split('*');
      addEmptyTemplate(5000);
      setCurrentTime(0, false);
      updateCanvasInfo({
        width: Number(blankSize[0]),
        height: Number(blankSize[1]),
      });
      openSidePanel({ menu: 'template' });

      initFinish();
    } else if (urlParams.resourceId) {
      getSourceInfo.run(urlParams.resourceId);
    } else {
      getTemplate.run({
        picId: urlParams.picId,
        upicId: urlParams.upicId,
        shareId: urlParams?.shareId,
        template_version,
      });
      if (!window.__EDITOR_PERFORMANCE__.completed) {
        // 资源加载开始
        window.__EDITOR_PERFORMANCE__.user_template_get_start =
          new Date().getTime();
      }
    }
  }, []);

  return {
    loading: !isLoaded,
  };
}

const loopObject = {
  count: 0,
};

export const useUserInfo = () => {
  const updateUserInfo = useUserInfoSetter();

  const [loaded, setLoaded] = useState(false);
  const [inDeedLoop, setInDeedLoop] = useState(false);

  const {
    loginAlert,
    showReLogin,
    closeReLoginTips,
    loopRun,
    reLoginTips,
    stopLoop,
    closeLoginAlert,
    openLoginAlert,
  } = useUserCheckerStatus();

  const getInfo = useRequest(getUserInfo, {
    manual: true,
    pollingInterval: 5000,
    onSuccess: userInfo => {
      updateUserInfo(userInfo);
      setLoaded(true);
      loopObject.count += 1;
      if (userInfo.id > 0) {
        // todo 待讨论是否持续在后台检测登录状态，可以在主站登录以后自动取消登录弹窗
        closeLoginAlert();
      } else if (!reLoginTips) {
        // console.log('登录状态异常', userInfo);
        // if (!loginAlert && loaded) {
        //   showReLogin();
        // }

        if (!loaded) {
          openLoginAlert();
        } else {
          if (!loginAlert) {
            showReLogin();
          }
        }

        stopLoop();
        getInfo.cancel();
      }
    },
    onError: res => {
      console.log(res);
    },
  });

  useEffect(() => {
    if (inDeedLoop) {
      throw new Error(`userinfo in dead loop,loopCount:${loopObject.count}`);
    }
  }, [inDeedLoop]);

  useEffect(() => {
    if (loopRun) {
      getInfo.run();
    } else {
      getInfo.cancel();
    }
  }, [loopRun]);

  useEffect(() => {
    // 死循环检测，如果进入死循环则触发页面崩溃
    const timer = setInterval(() => {
      if (loopObject.count > 20) {
        loopObject.count = 0;
        setInDeedLoop(true);
      } else {
        loopObject.count = 0;
      }
    }, 30000);
    return () => {
      clearTimeout(timer);
    };
  }, []);
};
