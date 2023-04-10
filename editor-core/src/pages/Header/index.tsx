import { useEffect, useState } from 'react';
import { Tooltip, message } from 'antd';
import classnames from 'classnames';

import {
  useHistoryRecordByObserver,
  useAllTemplateVideoTimeByObserver,
  observer,
  assetBlur,
} from '@hc/editor-core';
import { KEY_PRESS_Tooltip } from '@/config/basicVariable';

import XiuIcon from '@/components/XiuIcon';
import Download from '@/pages/Download';
import {
  useRechargeModal,
  useShareModal,
  useUserSave,
  useVideoPreviewModal,
  useUserLoginModal,
  useOneKeyReplace,
} from '@/store/adapter/useGlobalStatus';

import useCanvasPlayHandler from '@/hooks/useCanvasPlayHandler';
import { formatNumberToTime, timeToHour } from '@/utils/single';

import { useCheckLoginStatus } from '@/hooks/loginChecker';

import { getUserId } from '@/store/adapter/useUserInfo';

import CapacityToRemind from '@/components/CapacityToRemind';
import { ossPath } from '@/config/urls';
import { clickActionWeblog, dataActiontype } from '@/utils/webLog';
import ReplaceWarn from './ReplaceWarn';
import OpenMember from './OpenMember';
import Save from './Save';
import ShareVideo from './ShareVideo';
import File from './File';
import entrance from './entrance.png';

import './index.less';
import SwitchMode from './SwitchMode';

const XiudodoHeader = () => {
  const { open: setPreview } = useVideoPreviewModal();
  const { openCloseOneKeyReplace } = useOneKeyReplace();
  const [videoTotalTime] = useAllTemplateVideoTimeByObserver();
  const { isPlaying, pauseVideo } = useCanvasPlayHandler();
  // console.log(videoTotalTime);
  const { value, goNext, goPrev } = useHistoryRecordByObserver();
  // console.log(value);
  const { open: openRechargeModal } = useRechargeModal();
  const { setIsAllowShare } = useShareModal();
  const { checkLoginStatus } = useCheckLoginStatus();
  const { showLoginModal } = useUserLoginModal();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const userId = getUserId();

  const handlePreview = () => {
    clickActionWeblog('header_preview');
    setPreview();
  };

  const onMouseDown = () => {
    if (isPlaying) {
      pauseVideo();
    }
    assetBlur();
  };

  function toggleFullScreen() {
    const el = document.getElementById('xiudodo');
    clickActionWeblog('header_fullScreen');

    const isFullscreen =
      document.fullScreen ||
      document.mozFullScreen ||
      document.webkitIsFullScreen;

    if (!isFullscreen) {
      // 进入全屏,多重短路表达式
      (el.requestFullscreen && el.requestFullscreen()) ||
        (el.mozRequestFullScreen && el.mozRequestFullScreen()) ||
        (el.webkitRequestFullscreen && el.webkitRequestFullscreen()) ||
        (el.msRequestFullscreen && el.msRequestFullscreen());
    } else {
      // 退出全屏
      (document.exitFullscreen && document.exitFullscreen()) ||
        (document.mozCancelFullScreen && document.mozCancelFullScreen()) ||
        (document.webkitExitFullscreen && document.webkitExitFullscreen());
    }
  }

  const bindOpenMember = () => {
    clickActionWeblog('header_recharge');
    if (checkLoginStatus()) {
      return false;
    }

    openRechargeModal();
    setIsAllowShare(false);
  };

  useEffect(() => {
    document.addEventListener('fullscreenchange', e => {
      setIsFullscreen(!!document.fullscreenElement);
    });
  }, []);

  return (
    <>
      <div className="xiudodo-header-wrap" onMouseDown={onMouseDown}>
        <div className="xiudodo-header-left">
          <a href="https://xiudodo.com/hello.html">
            {/* <div className="xiudodo-header-logo" /> */}
            <span className="xiudodo-header-goHome xiudodo-header-item">
              {'<'} 首页
            </span>
          </a>
          <File className="xiudodo-header-item xiudodo-header-item-hover" />
          <Tooltip title="全屏" getTooltipContainer={ele => ele}>
            <div
              className="xiudodo-header-item xiudodo-header-item-hover"
              onClick={toggleFullScreen}
            >
              <XiuIcon
                type={isFullscreen ? 'iconcancel-full-screen' : 'iconquanping1'}
              />
            </div>
          </Tooltip>

          <Tooltip
            title={`上一步 ${KEY_PRESS_Tooltip.undo}`}
            getTooltipContainer={ele => ele}
          >
            <div
              className={classnames(
                'xiudodo-header-item',
                'xiudodo-header-item-hover',
                {
                  'xiudodo-header-item-disabled': !value.hasPrev,
                },
              )}
              onClick={() => {
                if (value.hasPrev) {
                  clickActionWeblog('header_goPrev');
                  goPrev();
                }
              }}
            >
              <XiuIcon type="iconchexiao1" />
            </div>
          </Tooltip>
          <Tooltip
            title={`下一步 ${KEY_PRESS_Tooltip.redo}`}
            getTooltipContainer={ele => ele}
          >
            <div
              className={classnames(
                'xiudodo-header-item',
                'xiudodo-header-item-hover',
                {
                  'xiudodo-header-item-disabled': !value.hasNext,
                },
              )}
              onClick={() => {
                if (value.hasNext) {
                  goNext();
                  clickActionWeblog('header_goNext');
                }
              }}
            >
              <XiuIcon className="xiudodo-header-next" type="iconchexiao1" />
            </div>
          </Tooltip>
          <Save />
        </div>
        <div className="xiudodo-header-center">
          <SwitchMode />
          <div
            onClick={() => {
              openCloseOneKeyReplace(true);
              // 一键替换埋点
              clickActionWeblog('onkeyReplace_001​');
            }}
            className="xiudodo-header-center-replace"
          >
            <XiuIcon type="icontihuan2" style={{ marginRight: 4 }} />
            一键替换
            <div className="newFun animate__animated animate__bounce animate__pulse animate__infinite" />
          </div>
        </div>

        <div className="xiudodo-header-right">
          <div
            onClick={showLoginModal}
            hidden={userId > 0}
            className="right_login_btn"
          >
            <XiuIcon type="huaban1-69i4fm83" className="right_login_btn_icon" />
            登录
          </div>

          {/* 必要替换元素 */}
          {/* <ReplaceWarn className="xiudodo-header-item" /> */}

          <OpenMember bindOpenMember={bindOpenMember}>
            <div
              // className="xiudodo-header-item xiudodo-header-item-hover"
              onClick={bindOpenMember}
              style={{
                marginRight: 16,
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <XiuIcon type="iconzujian11" className="xiudodo-header-icon" />
              开通会员
              {/* <img src={entrance} alt="" height="32px" /> */}
            </div>
          </OpenMember>

          {/* 分享视频 */}
          <ShareVideo />

          <Tooltip title="预览" getTooltipContainer={ele => ele}>
            <div className="xiudodo-header-preview" onClick={handlePreview}>
              <XiuIcon type="iconbofang" className="xiudodo-header-icon" />
              <span className="xiudodo-header-item-desc">
                {formatNumberToTime(parseInt(`${videoTotalTime / 1000}`, 10))}
              </span>
            </div>
          </Tooltip>
          <Download />
        </div>
      </div>
      <CapacityToRemind type="作品" />
      <CapacityToRemind type="草稿" />
    </>
  );
};

export default observer(XiudodoHeader);
