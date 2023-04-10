import { useEffect, useRef } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import classNames from 'classnames';

import {
  useGetCurrentAsset,
  assetBlur,
  useAssetReplaceByObserver,
  useTemplateLoadByObserver,
  observer,
  recordHistory,
  getAllTemplates,
} from '@hc/editor-core';
import { setActiveAudioInCliping } from '@/store/adapter/useAudioStatus';
import getUrlProps from '@/utils/urlProps';
import useCanvasPlayHandler from '@/hooks/useCanvasPlayHandler';
import GlobalModal from '@/pages/GlobalMobal';

import {
  useSettingPanelInfo,
  useGuideInfo,
  useTimelineMode,
  useEditMode,
  useReferenceLine,
  useOneKeyReplace,
} from '@/store/adapter/useGlobalStatus';

import { DragLayer } from '@/components/DragLayer';
import CanvasSkeleton from '@/components/Skeleton/CanvasSkeleton';
import TimeLineSkeleton from '@/components/Skeleton/TimeLineSkeleton';
import { getLocalStorage, setLocalstorageExtendStorage } from '@/utils/single';
import ShortcutKey from '@/pages/Help/ShortcutKey';
import Question from '@/pages/Help/Question';

import Scale from './Main/CanvasScale';

import KeyPress from './KeyPress';

import Panel from './Panel';
import Bottom from './Bottom';

import Guide from '../Help/Guide';
import Aside from './Aside';
import Main from './Main';
import TopBar from './Main/TopBar';
import { useInitCanvas, useUserInfo } from './handler';

import './index.less';
import PhoneBinding from '../GlobalMobal/PhoneBinding';
import { BottomDragLayer } from './Bottom/Drag/bottomLayer';
import PasteTip from '../GlobalMobal/PasteTip';
import { NoviceGuide } from '../Help/Guide/variable';
import ConciseMode from './ConciseMode';
import OnekeyRepalce from './OnekeyRepalce';

const XiudodoContent = observer(() => {
  const { isPlaying, pauseVideo, playVideo } = useCanvasPlayHandler();
  const asset = useGetCurrentAsset();
  const { loading } = useInitCanvas();
  const { loadComplete } = useTemplateLoadByObserver();
  const { close: closeSettingPanel } = useSettingPanelInfo();
  const { endClip } = useAssetReplaceByObserver();
  const { open: openAssetHandlerGuide } = useGuideInfo();
  // 一键替换
  const { isOneKeyReplace } = useOneKeyReplace();
  const { timeLinePartKey } = useTimelineMode();
  const { isConcise } = useEditMode();

  const { referenceLineShow } = useReferenceLine();

  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (asset && isPlaying) {
      pauseVideo();
    }
  }, [asset]);

  useEffect(() => {
    if (loading || !loadComplete) return;
    const localStorage = getLocalStorage('guide');
    if (!localStorage?.novice) {
      const urlProps = getUrlProps();
      if (urlProps?.picId) {
        // 模板创建新手引导
        openAssetHandlerGuide(NoviceGuide[0][0]);
        setLocalstorageExtendStorage('guide', { novice: true });
      }
    }
  }, [loading, loadComplete]);

  useEffect(() => {
    if (loadComplete && getAllTemplates().length) {
      // 模板加载结束后，储存当前状态，以便用户可以回退到最初操作记录
      recordHistory();
      // handleSave({ autoSave: true });
    }
  }, [loadComplete]);

  useUserInfo();

  // if (isConcise) return <ConciseMode />;
  return (
    <>
      <DndProvider backend={HTML5Backend}>
        {isConcise ? (
          <ConciseMode />
        ) : (
          <div
            className="xiudodo-content"
            onContextMenu={e => {
              e.preventDefault();
            }}
          >
            <Aside />

            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  flex: 1,
                  height: 0,
                  display: 'flex',
                  width: '100%',
                  position: 'relative',
                  zIndex: 2,
                }}
              >
                <Panel />
                <div
                  aria-label="canvas"
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    width: 0, // 防止被子元素撑开
                    zIndex: 8,
                  }}
                >
                  <TopBar />
                  <div
                    ref={canvasRef}
                    className={classNames('xiudodo-main', {
                      'xiudodo-main-grid': referenceLineShow,
                    })}
                    onMouseDown={e => {
                      if (
                        (e.target as HTMLDivElement)?.className !==
                        'hc-core-canvas-handler'
                      ) {
                        assetBlur();
                        endClip();
                        closeSettingPanel();
                      }

                      setActiveAudioInCliping(-1);
                    }}
                  >
                    <CanvasSkeleton loading={loading}>
                      <Main />
                    </CanvasSkeleton>
                  </div>
                </div>
              </div>

              {timeLinePartKey === null && (
                <TimeLineSkeleton loading={loading} className="xiudodo-bottom">
                  {/* 画布缩放导航器 */}
                  {canvasRef.current && (
                    <Scale
                      container={canvasRef.current}
                      style={{ position: 'absolute', right: 131, top: -50 }}
                    />
                  )}
                  {/* 快捷键目录 */}
                  <ShortcutKey style={{ top: -50 }} />
                  {/* 问题帮助 */}
                  <Question style={{ top: -50 }} />

                  <Bottom />
                </TimeLineSkeleton>
              )}
            </div>
            <Guide />
            <DragLayer />
            <BottomDragLayer />
            <PasteTip />
          </div>
        )}
        {isOneKeyReplace && <OnekeyRepalce />}
        <GlobalModal />
        <PhoneBinding />
      </DndProvider>
      <KeyPress />
    </>
  );
});
export default XiudodoContent;
