import { useRef, useState, PropsWithChildren } from 'react';
import { Slider } from 'antd';

import PreviewVideo from '@/pages/Preview/PreviewVideo';
import { XiuIcon } from '@/components';
import {
  usePreviewPlayHandlerByObserver,
  usePreviewHandlerByObserver,
  observer,
  useAllTemplateVideoTimeByObserver,
  toJS,
  getTemplateTimeScale,
  getAllTemplates,
} from '@hc/editor-core';

import { handleSave } from '@/utils/userSave';

import {
  updateCoverPath,
  updateCoverTime,
  useTemplateInfo,
} from '@/store/adapter/useTemplateInfo';
import { stopPropagation } from '@/utils/single';
import { clickActionWeblog } from '@/utils/webLog';

import CoverUploadImg from './coverUpload';
import './index.less';

// 静态封面
const StaticCover = observer(({ value, max, onChange }: any) => {
  const { currentTime, setCurrentTime } = usePreviewHandlerByObserver();
  const { isPlaying, pauseVideo, playVideo } =
    usePreviewPlayHandlerByObserver();
  const sliderRef = useRef();
  function handleSliderBlur() {
    if (sliderRef.current) {
      sliderRef.current.blur();
    }
  }
  const playBtn = (
    <div className="submit-play" onClick={isPlaying ? pauseVideo : playVideo}>
      <XiuIcon type={isPlaying ? 'iconzanting' : 'iconbofang'} />
    </div>
  );

  return (
    <div className="static-video">
      <div className="slider-wrap">
        {playBtn}
        <Slider
          className="slider-wrap-ant"
          handleStyle={{
            background: '#5A4CDB',
            width: 10,
            height: 16,
            borderRadius: 0,
            top: -10,
            borderBottomLeftRadius: '50%',
            borderBottomRightRadius: '50%',
          }}
          ref={sliderRef}
          max={max}
          value={currentTime}
          tooltipVisible
          onChange={value => {
            setCurrentTime(value);
          }}
          onAfterChange={handleSliderBlur}
          style={{ width: '98%' }}
          tipFormatter={current =>
            current !== value && (
              <div
                style={{ top: 30, color: 'red' }}
                onMouseDown={stopPropagation}
                onClick={() => {
                  onChange(current);
                  handleSliderBlur();
                  clickActionWeblog('download_005');
                }}
              >
                设为封面
              </div>
            )
          }
          getTooltipPopupContainer={ele => ele}
          tooltipPlacement="bottom"
          marks={
            value ?? false
              ? {
                  [value]: (
                    <div
                      onClick={() => {
                        onChange();
                        handleSliderBlur();
                        clickActionWeblog('download_006');
                      }}
                    >
                      取消封面
                    </div>
                  ),
                }
              : {}
          }
        />
      </div>
      <div className="static-tip">
        提示：点击播放视频，选择适合的视频帧作为封面
      </div>
    </div>
  );
});

function getRelativeTime(time: number) {
  const timeScale = getTemplateTimeScale();
  const templates = getAllTemplates();

  let relativeCurrentTime = 0;

  let absoluteTime = 0;
  let index = 0;

  for (let i = 0; i < timeScale.length; i++) {
    const [start, end] = timeScale[i];

    if (time >= start && time < end) {
      index = i;
      absoluteTime = time - start;
      break;
    }
  }

  for (let j = 0; j < templates.length; j++) {
    const { allAnimationTime, speed = 1 } = templates[j].videoInfo;

    if (j === index) {
      relativeCurrentTime += absoluteTime / (1 / speed);
      break;
    } else {
      relativeCurrentTime += allAnimationTime;
    }
  }

  return relativeCurrentTime;
}

/**
 * @description 视频封面设置
 */
function PreviewCover({
  watermark,
}: PropsWithChildren<{ watermark?: boolean }>) {
  const { templateInfo } = useTemplateInfo();
  const [coverPreview, setCoverPreview] = useState(false);
  const [currentTime, setCurrentTime] = useState(templateInfo?.cover_time || 0);
  const [videoTotalTime] = useAllTemplateVideoTimeByObserver();

  // 保存模板信息
  const saveTemplateFun = async (fileObject: any, time: number) => {
    setCurrentTime(time);

    const relativeTime = getRelativeTime(time);

    handleSave({
      info: {
        cover_time: relativeTime,
        cover_path: fileObject?.path,
      },
      onSuccess: res => {
        updateCoverPath(fileObject?.url);
        updateCoverTime(relativeTime);
      },
    });
  };
  return (
    <div className="video-cover-wrap">
      <div className="video-cover-preivew-video">
        <PreviewVideo spaceControl={!coverPreview} watermark={watermark} />
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: 20,
          marginTop: 20,
        }}
        hidden={coverPreview}
      >
        <StaticCover
          value={currentTime ?? 0}
          max={Math.floor(videoTotalTime)}
          onChange={val => {
            saveTemplateFun(null, val);
          }}
        />
      </div>
      {/* 封面上传 */}

      <CoverUploadImg
        currentTime={currentTime}
        onchange={val => {
          saveTemplateFun(val, 0);
        }}
      />
      {/* <Button type="primary" className="submit" onClick={saveTemplateFun}>
        确定应用封面
      </Button> */}
    </div>
  );
}

export default observer(PreviewCover);
