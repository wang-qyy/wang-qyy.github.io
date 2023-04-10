import { useEffect, memo } from 'react';
import { useRequest } from 'ahooks';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { observer } from '@hc/editor-core';

import Layout from '@/pages/Designer/Layout';

import LoginModal from '@/pages/GlobalMobal/LoginModal';

import {
  useUserCheckerStatus,
  useUserLoginModal,
} from '@/store/adapter/useGlobalStatus';
import { getUserInfo } from '@/api/user';

import { useUserInfoSetter } from '@/store/adapter/useUserInfo';
import { windowsLoading } from '@/utils/single';
import { DragLayer } from '@/components/DragLayer';

import Header from './Header';
import Sider from './Sider';
import Bottom from './Bottom';
import KeyPress from './KeyPress';

import Content from './Content';
import './index.less';

// eslint-disable-next-line react/display-name
const DesignerLayout = memo(() => (
  <>
    <Layout
      header={<Header />}
      sider={<Sider />}
      content={<Content />}
      footer={<Bottom />}
    />
    <LoginModal />
  </>
));

function Designer() {
  const { showLoginModal } = useUserLoginModal();

  useEffect(() => {
    windowsLoading.closeWindowsLoading();
  }, []);

  const { loopRun, reLoginTips, stopLoop } = useUserCheckerStatus();

  const updateUserInfo = useUserInfoSetter();

  const getInfo = useRequest(getUserInfo, {
    manual: true,
    pollingInterval: 2000,
    onSuccess: userInfo => {
      updateUserInfo(userInfo);
      // console.log(userInfo.id > 0, !reLoginTips);
      if (userInfo.id > 0) {
        // todo 待讨论是否持续在后台检测登录状态，可以在主站登录以后自动取消登录弹窗
        // closeLoginAlert();
      } else if (!reLoginTips) {
        // console.log('登录状态异常', userInfo);
        // if (!loginAlert) {
        //   showReLogin();
        // }
        showLoginModal();
        stopLoop();
        getInfo.cancel();
      }
    },
    onError: res => {
      console.log(res);
    },
  });

  useEffect(() => {
    if (loopRun) {
      getInfo.run();
    } else {
      getInfo.cancel();
    }
  }, [loopRun]);

  return (
    <DndProvider backend={HTML5Backend}>
      <DesignerLayout />
      <KeyPress />
      <DragLayer />
    </DndProvider>
  );
}

export default observer(Designer);
