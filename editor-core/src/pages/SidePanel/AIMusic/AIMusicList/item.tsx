import { useEffect, useState } from 'react';
import { Tooltip, Popover, Button, message } from 'antd';
import { PlusOutlined, EllipsisOutlined } from '@ant-design/icons';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { useDrag } from 'react-dnd';

import {
  useSetMusic,
  getNewAudioDuration,
  AddAudioParams,
} from '@/hooks/useSetMusic';

import { getInitFontAttribute } from '@/utils/assetHandler/assetUtils';
import { getNewAssetDuration } from '@/utils/assetHandler/init';
import { clickActionWeblog } from '@/utils/webLog';
import { handleAddAsset } from '@/utils/assetHandler';

import { getDeleteMyAudio } from '@/api/music';

import { MUSIC_DRAG } from '@/constants/drag';
import { useGetUnitWidth } from '@/pages/Content/Bottom/handler';

import AIItem from '../component/AIItem';

import './index.less';

interface AIMusicItemProps {
  data: any;
  onChange: Function;
  playingId: number | undefined;
  setPlayingId: (playingId: number) => void;
}

const AIMusicItem = (props: AIMusicItemProps) => {
  const { data, onChange, playingId, setPlayingId } = props;
  const unitWidth = useGetUnitWidth();
  const { bindAddAudio } = useSetMusic();

  // 拖拽时 鼠标距离拖拽物的位置
  const [mousePosition, setMousePosition] = useState({});
  // 添加录音
  const add = (time?: number) => {
    const obj: AddAudioParams = {
      rt_title: data.title,
      resId: data.id,
      type: 2, // bgm:1  其他配乐:2
      rt_url: data.preview,

      volume: data.ai_audio.volume,
      isLoop: false,
      rt_duration: data.total_time, // 音频时长
      rt_sourceType: 2,
    };

    const duration = getNewAudioDuration(2, { ...obj, startTime: time });

    bindAddAudio({ ...obj, ...duration });
  };
  // 删除录音
  const remove = async () => {
    const res = await getDeleteMyAudio({ id: data.id });
    if (res.code === 0) {
      message.success('删除成功!');
      // 回调列表页面
      onChange();
    }
    // 单条文字转语音的操作埋点
    clickActionWeblog('ai_audio_009');
  };
  // 添加文本
  const addText = () => {
    const duration = getNewAssetDuration(data.total_time);
    handleAddAsset({
      meta: { type: 'text', addOrigin: 'text' },
      attribute: {
        ...getInitFontAttribute('text'),
        text: [data.ai_audio.text],
        ...duration,
      },
    });
  };
  // 同步添加文本
  const addTextAudoi = () => {
    addText();
    add();
    // 单条文字转语音的操作埋点
    clickActionWeblog('ai_audio_008');
  };
  const [collected, drag, dragPreview] = useDrag(
    () => ({
      type: MUSIC_DRAG,
      item: {
        id: data.id,
        mousePosition,
        add: (position: { x: number; y: number; relativeX: number }) => {
          const time = (position.relativeX / unitWidth) * 1000;
          add(time);
          clickActionWeblog('drag_add_006');
        },
      },
      collect: monitor => {
        return {
          isDragging: !!monitor.isDragging(),
        };
      },
    }),
    [mousePosition, unitWidth],
  );
  useEffect(() => {
    // 隐藏默认的拖拽样式
    dragPreview(getEmptyImage(), { captureDraggingState: true });
  }, [mousePosition]);
  return (
    <div
      className="ai-list-item"
      ref={drag}
      style={{ opacity: collected.isDragging ? 0 : 1 }}
      id={data.id}
      onMouseDown={e => {
        const node = document.getElementById(data.id);
        const nodeOffset = node?.getBoundingClientRect();
        setMousePosition({ x: nodeOffset?.x, y: nodeOffset?.y });
      }}
    >
      <div
        className="ai-item-add"
        onClick={() => {
          add();
          // 单条文字转语音的操作埋点
          clickActionWeblog('ai_audio_005');
        }}
      >
        {/* 添加 */}
        <Tooltip title="添加">
          <PlusOutlined />
        </Tooltip>
      </div>
      <div className="ai-item-dec">
        <Popover
          placement="rightTop"
          title=""
          content={
            <div className="ai-item-dec-done">
              <Button type="text" onClick={addTextAudoi}>
                同步添加文本
              </Button>
              <Button type="text" onClick={remove}>
                删除
              </Button>
            </div>
          }
          trigger="hover"
          getPopupContainer={() =>
            document.getElementById('xiudodo') as HTMLElement
          }
        >
          <EllipsisOutlined />
        </Popover>
      </div>
      <div className="ai-item-title">{data?.title}</div>
      <div className="ai-item-show">
        <div className="triangle" />
        <AIItem
          data={{ ...data, total_time: data?.total_time / 1000 }}
          playingId={playingId}
          setPlayingId={setPlayingId}
        />
      </div>
    </div>
  );
};
export default AIMusicItem;
