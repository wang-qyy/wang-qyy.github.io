import { Button, Tooltip } from 'antd';
import classNames from 'classnames';
import { useState, useEffect, useRef } from 'react';
import { useRequest, useFullscreen } from 'ahooks';
import { cdnHost, hostName, fontsPath } from '@/config/urls';
import { globalLink } from '@/config/urls';
import getUrlParams from '@/utils/urlProps';
import Icon from '@/components/Icon';

import DraftInput from './draft';

import {
  CanvasInfo,
  initTemplate,
  StaticTemplate,
  recordHistory,
  Canvas,
  customConfig,
  useTemplateLoadByObserver,
  observer,
  getTemplateTimeScale,
  getCurrentTemplateIndex,
  setCurrentTime,
  getCurrentAsset,
  useMaskClipByObserver,
  removeAsset,
  assetBlur,
  useHistoryRecordByObserver,
  removeTemplate,
  getAllTemplates,
} from '@hc/editor-core';

import { getScale, stopPropagation } from '@/utils';

import usePPtShortcuts from '@/hooks/useShortcuts/ppt';
import { textToPPT } from '@/utils/draftHandler';

import { setTemplateInfo, getTemplateInfo } from '@/pages/store/template';
import { config } from '@/config/constants';

import {
  openImgModal,
  openDraftModal,
  getDraftData,
} from '@/pages/store/global';
import IconFont from '@/components/Icon';
import './index.less';

customConfig({
  hostName,
  cdnHost,
  fontsPath,
  handImgSrc:
    '//js.xiudodo.com/xiudodo-editor/image/movie-writeText-animation.png',
  apis: {
    // params id
    getSpecificWord: '/apiv2/get-specific-word-info-new',
    getAeAnimationDetail: '/api-video/edit-video-asset-detail',
    getWebmFrameImage: '/video/small-frame-previews',
  },
  hpMode: false,
  wholeTemplate: true,
  videoTimerSrc: '//js.xiudodo.com/xiudodo-editor/video/empty_video.mp4',
  backgroundEditable: true,
  autoCalcTemplateEndTime: false,
  container: '.xiudodo-canvas',
  assetHoverTip: true,
});

function PPTHome() {
  const { loadComplete } = useTemplateLoadByObserver();
  const { value, goNext, goPrev } = useHistoryRecordByObserver();

  usePPtShortcuts();
  const previewRef = useRef(null);

  const [isFullScreen, { enterFullscreen }] = useFullscreen(previewRef);
  const { startMask } = useMaskClipByObserver();

  const [size, setSize] = useState<CanvasInfo>();

  function getDraftInfo(type: string) {
    const canvasSize = {
      width: 1920,
      height: 1080,
    };

    const calcScale = getScale(canvasSize);

    setSize({ ...canvasSize, scale: calcScale });

    const transition = require(`@/mock/ppt/${type}`).default;
    setTemplateInfo(transition);

    initTemplate(transition);
    setCurrentTime(0);
    recordHistory();
  }

  useEffect(() => {
    const { template_type } = getUrlParams();

    if (template_type) getDraftInfo(template_type);
  }, []);

  useEffect(() => {
    if (loadComplete) {
      recordHistory();
    }
  }, [loadComplete]);

  function renderPreview() {
    return (
      <>
        {getTemplateTimeScale().map((range, index) => {
          return (
            <div
              key={`static-${index}`}
              className={classNames('preview-static', {
                active: getCurrentTemplateIndex() === index,
              })}
              onClick={() => setCurrentTime(range[0], false)}
            >
              <StaticTemplate
                canvasInfo={{
                  width: 1920,
                  height: 1080,
                  scale: getScale(
                    { width: 1920, height: 1080 },
                    { width: 192, height: 108 },
                    1,
                  ),
                }}
                currentTime={0}
                templateIndex={index}
              />

              <div
                className="remove-action"
                onClick={(e) => {
                  stopPropagation(e);
                  removeTemplate(getAllTemplates()[index].id);
                }}
              >
                <IconFont type="iconshanchu1"></IconFont>
              </div>

              <div className="static-order">
                {index + 1 > 9 ? '' : '0'}
                {index + 1}
              </div>
            </div>
          );
        })}
      </>
    );
  }
  return (
    <>
      <div id="ppt_editor">
        <header
          onMouseDown={() => {
            assetBlur();
          }}
        >
          <div>
            <a href={globalLink.home}>
              <img
                src={globalLink.logo}
                height="30px"
                style={{ marginRight: 16, cursor: 'pointer' }}
              />
            </a>
            <Tooltip title="undo">
              <Button
                disabled={!value.hasPrev}
                type="text"
                className="undo"
                icon={<Icon type="iconchexiao1" />}
                onClick={goPrev}
              />
            </Tooltip>
            <Tooltip title="redo">
              <Button
                disabled={!value.hasNext}
                type="text"
                className={classNames('redo')}
                icon={
                  <Icon
                    type="iconchexiao1"
                    style={{ transform: 'rotateY(180deg)' }}
                  />
                }
                onClick={goNext}
              />
            </Tooltip>
          </div>
          <div>
            {getDraftData() && (
              <Button style={{ marginRight: 16 }} onClick={() => textToPPT()}>
                切换风格
              </Button>
            )}
            <Button
              style={{ marginRight: 16 }}
              onClick={() => openDraftModal(true)}
            >
              草稿
            </Button>

            <Button type="primary" onClick={enterFullscreen}>
              Preview
            </Button>
          </div>
        </header>

        <section ref={previewRef}>
          <aside
            onMouseDown={() => {
              assetBlur();
            }}
          >
            {renderPreview()}
          </aside>

          <main id="canvas_container">
            <div
              className="actionBar"
              style={{
                visibility: ['image', 'mask'].includes(
                  getCurrentAsset()?.meta.type ?? '',
                )
                  ? 'visible'
                  : 'hidden',
              }}
            >
              <Button onClick={() => openImgModal(true)}>替换图片</Button>

              <Button onClick={startMask} style={{ marginLeft: 16 }}>
                裁剪
              </Button>

              <Button
                onClick={() => {
                  removeAsset(getCurrentAsset());
                  assetBlur();
                }}
                style={{ marginLeft: 16 }}
              >
                删除
              </Button>
            </div>

            {size && (
              <Canvas
                canvasInfo={size}
                onChange={() => {
                  recordHistory();
                }}
              />
            )}
          </main>
        </section>
      </div>

      <DraftInput />
    </>
  );
}

export default observer(PPTHome);
