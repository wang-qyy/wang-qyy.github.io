import { useEffect, useMemo, useRef, useState } from 'react';
import { Switch, Tabs, Slider, Form } from 'antd';
import {
  usePreviewPlayHandlerByObserver,
  usePreviewHandlerByObserver,
  observer,
  useAllTemplateVideoTimeByObserver,
} from '@hc/editor-core';

import PreviewVideo from '@/pages/Preview/PreviewVideo';
import { XiuIcon } from '@/components';
import { stopPropagation } from '@/utils/single';
import { getTemplate } from '@/store/adapter/useTemplateInfo';
import SliderRange from './SliderRange';

import './index.less';

// 静态封面
const StaticCover = observer(({ value, max, onChange }: any) => {
  const { currentTime, setCurrentTime } = usePreviewHandlerByObserver();

  const sliderRef = useRef();
  function handleSliderBlur() {
    if (sliderRef.current) {
      sliderRef.current?.blur();
    }
  }
  return (
    <Slider
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
      className="designer-slider-wrap"
      tooltipVisible
      onChange={value => {
        setCurrentTime(value);
      }}
      onAfterChange={handleSliderBlur}
      style={{ width: '100%' }}
      tipFormatter={current =>
        current !== value && (
          <div
            style={{ top: 40, color: 'red' }}
            onMouseDown={stopPropagation}
            onClick={e => {
              onChange(current);
              handleSliderBlur();
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
                  onMouseDown={stopPropagation}
                  onClick={() => {
                    onChange();
                    handleSliderBlur();
                  }}
                >
                  取消封面
                </div>
              ),
            }
          : {}
      }
    />
  );
});

/**
 * @description 视频封面设置
 */
function VideoCover({ form, hasDynamic = true }: any) {
  const switchRef = useRef(null);

  const [coverPreview, setCoverPreview] = useState(false);
  const [hasCover, setHasCover] = useState();

  const [activeTab, setActiveTab] = useState('static');

  const [playRange, setPlayRange] = useState<number[]>([]);

  const dataInfo = getTemplate()?.dataInfo;

  const { isPlaying, pauseVideo, playVideo } =
    usePreviewPlayHandlerByObserver();
  const { currentTime, setCurrentTime } = usePreviewHandlerByObserver();
  const [videoTotalTime] = useAllTemplateVideoTimeByObserver();

  const PreviewBtn = ({ disabled }: any) => (
    <div
      style={{
        display: 'flex',
        justifyContent: 'right',
        alignItems: 'center',
        margin: '10px 0',
      }}
    >
      封面预览：
      <Switch
        checked={coverPreview}
        ref={switchRef}
        onChange={checked => {
          setCoverPreview(checked);
          pauseVideo();
          switchRef.current?.blur();
        }}
        disabled={disabled}
      />
    </div>
  );

  const playBtn = (
    <div
      className="designer-submit-play"
      onClick={isPlaying ? pauseVideo : playVideo}
    >
      <XiuIcon type={isPlaying ? 'iconzanting' : 'iconbofang'} />
    </div>
  );

  useEffect(() => {
    const dynamicCover = form.getFieldValue('cover_lives') || [];

    if (!isPlaying && Array.isArray(dynamicCover[playRange[0]])) {
      setCurrentTime(dynamicCover[playRange[0]][0]);
      playVideo();
    }

    if (
      isPlaying &&
      dynamicCover[playRange[0]] &&
      currentTime >= dynamicCover[playRange[0]][1]
    ) {
      pauseVideo();
      setPlayRange([playRange[1], playRange[1] + 1]);
    }
  }, [playRange, currentTime]);

  useEffect(() => {
    let time = 0;
    const { cover_time, cover_lives } = form.getFieldsValue();

    switch (activeTab) {
      case 'static':
        setHasCover(cover_time ?? false);
        if (cover_time) {
          time = cover_time;
        } else {
          setCoverPreview(false);
        }
        break;
      case 'dynamic':
        setHasCover(cover_lives ?? false);

        if (cover_lives) {
          time = cover_lives?.[0][0] ?? 0;
        } else {
          setCoverPreview(false);
        }
        break;
    }

    setCurrentTime(time);
  }, [activeTab, coverPreview]);

  return (
    <div className="designer-video-cover-wrap">
      <Tabs
        destroyInactiveTabPane
        activeKey={activeTab}
        onChange={active => setActiveTab(active)}
      >
        <Tabs.TabPane key="static" tab="静态封面设置" />
        {hasDynamic && <Tabs.TabPane key="dynamic" tab="动态封面设置" />}
      </Tabs>
      <div style={{ height: 300, position: 'relative' }}>
        <PreviewVideo spaceControl={!coverPreview} />
        {activeTab === 'dynamic' && coverPreview && !isPlaying && (
          <div
            className="designer-video-cover-play"
            onClick={() => setPlayRange([0, 1])}
          >
            <XiuIcon type="iconbofang" />
          </div>
        )}
      </div>
      <PreviewBtn disabled={!hasCover} />

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: 20,
          marginTop: 20,
        }}
        hidden={coverPreview}
      >
        {playBtn}

        <Form.Item
          noStyle
          hidden={activeTab !== 'static'}
          name="cover_time"
          messageVariables={{ label: '静态封面' }}
          rules={[{ required: true }]}
          style={{
            display: activeTab === 'static' ? 'inline-block' : 'none',
            width: '100%',
            marginBottom: 0,
          }}
          getValueFromEvent={value => {
            setHasCover(value ?? false);
            return value;
          }}
        >
          <StaticCover max={videoTotalTime} />
        </Form.Item>

        {hasDynamic && (
          <Form.Item
            noStyle
            hidden={activeTab !== 'dynamic'}
            name="cover_lives"
            rules={[{ required: dataInfo?.template_type !== 4 }]}
            messageVariables={{ label: '动态封面' }}
            style={{
              display: activeTab === 'dynamic' ? 'inline-block' : 'none',
              width: '100%',
              marginBottom: 0,
            }}
            getValueFromEvent={value => {
              setHasCover(value ?? false);
              return value;
            }}
          >
            <SliderRange max={videoTotalTime} />
          </Form.Item>
        )}
      </div>
    </div>
  );
}

export default observer(VideoCover);
