import { useEffect, memo, useState } from 'react';
import { useExternal } from 'ahooks';
import {
  observer,
  useTemplateLoadByObserver,
  customConfig,
} from '@hc/editor-core';

import { initFontFamily, initUserFontFamily } from '@/utils/fontHandler';
import { windowsLoading } from '@/utils/single';
import getUrlPrams from '@/utils/urlProps';
import {
  setIconfontStatus,
  setIconpartStatus,
} from '@/store/adapter/useGlobalStatus';
import { iconSrc, iconpark } from '@/config/urls';

import ExamPreview from './ExamPreview';

import { useInitCanvas } from '../Content/handler';

customConfig({
  videoTimerSrc: '//js.xiudodo.com/xiudodo-editor/video/empty_video.mp4',
  hostName: process.env.NODE_ENV === 'production' ? '//xiudodo.com' : '/mainHostApi',
  cdnHost: '//js.xiudodo.com',
  fontsPath: '//js.xiudodo.com/fonts/',
  handImgSrc:
    '//js.xiudodo.com/xiudodo-editor/image/movie-writeText-animation.png',
  apis: {
    // params id
    getSpecificWord: '/apiv2/get-specific-word-info-new',
    getAeAnimationDetail: '/api-video/edit-video-asset-detail',
    getWebmFrameImage: '/video/small-frame-previews',
  },
  // hpMode: getUrlPrams().redirect !== 'designer',
  hpMode: false,
  wholeTemplate: true,
  backgroundEditable: ['designer', 'module'].includes(getUrlPrams().redirect),
  autoCalcTemplateEndTime: ['designer', 'module'].includes(
    getUrlPrams().redirect,
  ),
});
initFontFamily();
initUserFontFamily();

function Exam() {
  // 加载模板数据
  const { loading } = useInitCanvas(false);
  // 内核加载状态
  const { loadComplete } = useTemplateLoadByObserver();

  const [iconfontLoaded] = useExternal(iconSrc);
  const [iconparkLoaded] = useExternal(iconpark);

  useEffect(() => {
    setIconfontStatus(iconfontLoaded === 'ready');
  }, [iconfontLoaded]);
  useEffect(() => {
    setIconpartStatus(iconparkLoaded === 'ready');
  }, [iconparkLoaded]);

  useEffect(() => {
    if (!loading && loadComplete) {
      windowsLoading.closeWindowsLoading();
    }
  }, [loadComplete, loading]);
  return (
    <>
      <ExamPreview onContrls={false} />
    </>
  );
}

export default observer(Exam);
