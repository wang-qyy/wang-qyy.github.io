import React, { useEffect, useLayoutEffect } from 'react';
import { customConfig } from '@hc/editor-core';
import getUrlPrams from '@/utils/urlProps';
// import { ErrorBoundary } from '@sentry/react';
import Designer from '@/pages/Designer';
import Watermark from '@/pages/Watermark';
import ClientSide from '@/pages/ClientSide';
import ErrorBoundary from '@/components/ErrorBoundary';
import useSetupSentry from '@/config/sentry';
import { initFontFamily, initUserFontFamily } from '@/utils/fontHandler';

import './index.less';
import { useExternal } from 'ahooks';
import { iconSrc, iconpark } from '@/config/urls';
import {
  setIconfontStatus,
  setIconpartStatus,
} from '@/store/adapter/useGlobalStatus';

const { redirect } = getUrlPrams();

customConfig({
  videoTimerSrc: '//js.xiudodo.com/xiudodo-editor/video/empty_video.mp4',
  hostName:
    process.env.NODE_ENV === 'production' ? '//xiudodo.com' : '/mainHostApi',
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
  backgroundEditable: ['designer', 'module'].includes(redirect),
  autoCalcTemplateEndTime: ['designer', 'module'].includes(redirect),
  container: '.xiudodo-canvas',
  assetHoverTip: !['designer', 'module'].includes(redirect),
});

initFontFamily();
initUserFontFamily();

function MainComponent() {
  const { redirect } = getUrlPrams();
  // useSetupSentry();

  const [iconfontLoaded] = useExternal(iconSrc);
  const [iconparkLoaded] = useExternal(iconpark);

  useEffect(() => {
    setIconfontStatus(iconfontLoaded === 'ready');
  }, [iconfontLoaded]);
  useEffect(() => {
    setIconpartStatus(iconparkLoaded === 'ready');
  }, [iconparkLoaded]);

  function preventDefault(e: MouseEvent) {
    e.preventDefault();
  }
  // 释放右键功能 注释代码
  // useLayoutEffect(() => {
  //   document.addEventListener('contextmenu', preventDefault);
  //   return () => {
  //     document.removeEventListener('contextmenu', preventDefault);
  //   };
  // }, []);

  switch (redirect) {
    case 'watermark':
      return <Watermark />;
    case 'module': // 组件
    case 'designer':
      return <Designer />;
    default:
      return <ClientSide />;
  }
}

export default function IndexPage() {
  if (window.__EDITOR_STOP_RENDER__) {
    return null;
  }
  return (
    <ErrorBoundary>
      <MainComponent />
    </ErrorBoundary>
  );
}
