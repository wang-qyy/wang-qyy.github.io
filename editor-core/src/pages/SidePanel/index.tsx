import { useEffect } from 'react';
import {
  useAssetReplaceByObserver,
  useImageClipByObserver,
  useGetCurrentAsset,
  observer,
  toJS,
} from '@hc/editor-core';
import { useUpdateEffect } from 'ahooks';

import LazyLoadComponent from '@/components/LazyLoadComponent';
import {
  useLeftSideInfo,
  closeSubMenu,
  useUserLoginModal,
  useAssetReplaceModal,
} from '@/store/adapter/useGlobalStatus';

import { clickActionWeblog } from '@/utils/webLog';

import { getUserInfo } from '@/store/adapter/useUserInfo';
import Role from '@/CommonModule/Role';
import TemplatePanel from './TemplatePanel';
import MusicPanel from './MusicPanel';
import TextPanel from './TextPanel';

import Upload from './Upload';

import CloudElement from './CloudElement';
import CloudImg from './CloudImg';
import VideoE from './VideoE';
import EffectVideo from './EffectVideo';
import BackgroundElement from './BackgroundElement';
import More from './More';
import MaskModule from './MaskModule';
import QrCodePanel from './QrCodePanel';
import ScenePanel from './ScenePanel';
import LogoWatermark from './LogoPanel';
import Brand from './Brand';

import './index.less';
import AIMusic from './AIMusic';

const SidePanel = () => {
  const { leftSideInfo } = useLeftSideInfo();
  const userInfo = getUserInfo();
  const { showLoginModal } = useUserLoginModal();
  const { menu } = leftSideInfo;

  const asset = useGetCurrentAsset();

  const { inReplacing, asset: replaceAsset } = useAssetReplaceByObserver();
  const { inClipping } = useImageClipByObserver();
  const { open: openAssetReplaceModal } = useAssetReplaceModal();

  useUpdateEffect(() => {
    // 多选功能埋点
    if (asset?.meta.type === '__module') {
      clickActionWeblog('canvas_multiSelect', {
        action_label: replaceAsset?.meta.type,
      });
    }
  }, [asset?.meta.type]);

  useEffect(() => {
    if (inReplacing) {
      if (!(userInfo && userInfo?.id > 0)) {
        showLoginModal();
        return;
      }
      // 双击替换视频、图片
      openAssetReplaceModal('modal-replace');

      clickActionWeblog('canvas_dbClick', {
        action_label: replaceAsset?.meta.type,
      });
    } else if (!inReplacing && !inClipping) {
      // 取消裁剪状态、取消替换关闭左侧边栏
      closeSubMenu();
    }
  }, [inClipping, inReplacing, replaceAsset]);

  return (
    <>
      {/* 模板 */}
      <LazyLoadComponent keyName="templatePanel" visible={menu === 'template'}>
        <TemplatePanel />
      </LazyLoadComponent>

      {/* 片段 */}
      <LazyLoadComponent keyName="scenePanel" visible={menu === 'scene'}>
        <ScenePanel />
      </LazyLoadComponent>

      {/* AI文字转语音 */}
      <LazyLoadComponent
        keyName="AIPanel"
        visible={menu === 'AI' && !leftSideInfo.submenu}
      >
        <AIMusic />
      </LazyLoadComponent>

      {/* 音乐 */}
      <LazyLoadComponent visible={menu === 'music'}>
        <MusicPanel />
      </LazyLoadComponent>

      {/* 视频 */}
      <LazyLoadComponent visible={menu === 'videoE'}>
        <VideoE />
      </LazyLoadComponent>

      {/* 视频特效 */}
      <LazyLoadComponent visible={menu === 'EffectVideo'}>
        <EffectVideo />
      </LazyLoadComponent>

      {/* 背景 */}
      <LazyLoadComponent visible={menu === 'background'}>
        <BackgroundElement />
      </LazyLoadComponent>

      {/* 文字 */}
      <LazyLoadComponent visible={menu === 'text'}>
        <TextPanel />
      </LazyLoadComponent>

      {/* 文件上传 */}
      {menu === 'user-space' && <Upload />}

      {/* 元素 */}
      <LazyLoadComponent visible={menu === 'element'}>
        <CloudElement />
      </LazyLoadComponent>
      {/* 图片 */}
      <LazyLoadComponent visible={menu === 'img'}>
        <CloudImg />
      </LazyLoadComponent>

      {/* 组件 */}
      <LazyLoadComponent visible={menu === 'module'}>
        <MaskModule />
      </LazyLoadComponent>

      {/* 二维码 */}
      <LazyLoadComponent visible={menu === 'qrcode'}>
        <QrCodePanel />
      </LazyLoadComponent>

      {/* 更多 */}
      <LazyLoadComponent visible={menu === 'more'}>
        <More />
      </LazyLoadComponent>

      {/* logo水印 */}
      <LazyLoadComponent visible={menu === 'logo'}>
        <LogoWatermark />
      </LazyLoadComponent>

      {/* 角色 */}
      <LazyLoadComponent visible={menu === 'role'}>
        <Role />
      </LazyLoadComponent>

      {/* 品牌logo */}
      <LazyLoadComponent visible={menu === 'brandLogo'}>
        <Brand />
      </LazyLoadComponent>
    </>
  );
};

export default observer(SidePanel);
