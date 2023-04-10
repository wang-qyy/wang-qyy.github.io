import { MouseEvent, useRef, useState, useEffect, RefObject } from 'react';
import { Progress, Spin, message } from 'antd';
import { useClickAway, useHover } from 'ahooks';
import { LoadingOutlined } from '@ant-design/icons';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { observer } from '@hc/editor-core';

import { MediaElementHandler } from '@/pages/SidePanel/MusicPanel/handler';
import { MouseItem } from '@/typings';
import { XiuIcon } from '@/components';
import { useSetActiveAudio } from '@/store/adapter/useAudioStatus';
import { useBottomMode } from '@/store/adapter/useGlobalStatus';

import useCanvasPlayHandler from '@/hooks/useCanvasPlayHandler';

import { clickActionWeblog } from '@/utils/webLog';
import { formatNumberToTime, stopPropagation } from '@/utils/single';
import { useDrag, DragPreviewImage } from 'react-dnd';
import { MUSIC_DRAG } from '@/constants/drag';
import classNames from 'classnames';
import { useGetUnitWidth } from '@/pages/Content/Bottom/handler';

import { getNewAudioDuration, AddAudioParams } from '@/hooks/useSetMusic';

import { deleteFilesWithinType } from '@/api/upload';
import styles from './index.module.less';

/**
 * @description 音频类型
 * @enum 1-上传，2-AI文字转语音，3-录音，undefine-云端音乐
 */
type AudioSourceType = 1 | 2 | 3;

export interface MusicNodeValue {
  gid: string;
  id: MouseItem['id'];
  preview: MouseItem['preview'];
  title: MouseItem['title'];
  total_time: MouseItem['total_time'];
  url: MouseItem['url'];
  status: number;
  ufsId?: string;
  source_type: AudioSourceType;
  file_id?: string;
  cover_url?: string;
  // 解码状态
  fileState?: number;
  // 违规状态
  scan_flag?: number;
  // 上传的进度
  progress?: number;
  // 是否是录音
  is_recording?: number;
}

export interface MusicNodeProps {
  onClip?: (value: MusicNodeValue) => void;
  bindAddAudio?: (value: any) => void;
  bindReplaceAudio?: (value: any, id: number) => void;
  // 播放时，设置当前Id
  setPlayingId?: (id: string | undefined) => void;
  deleteMusicReq?: any;
  reload?: () => void;
  // 当前播放的id 如果id不匹配会自动停止播放
  playingId?: string;
  volume?: number;
  audioList?: any;
  value: MusicNodeValue;
  clickAwayTarget?: HTMLElement | RefObject<HTMLDivElement>;
  className?: string;
  isReplace?: boolean;
}

function MusicNode(props: MusicNodeProps) {
  const {
    bindAddAudio,
    value,
    clickAwayTarget,
    volume,
    playingId,
    setPlayingId,
    deleteMusicReq,
    reload,
    bindReplaceAudio,
    className,
    isReplace,
  } = props;
  // 1-上传，2-AI文字转语音，3-录音，undefine-云端音乐
  const { source_type = 1, scan_flag, fileState, progress } = value;

  const { value: mode } = useBottomMode();
  const { activeAudio } = useSetActiveAudio();
  const unitWidth = useGetUnitWidth();

  const audioWrapper = useRef<HTMLDivElement>(null);

  const [loadAudio, setLoadAudio] = useState(false);

  const [inPlaying, setInPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const videoRef = useRef<HTMLAudioElement>(null);
  const mediaHandler = useRef<MediaElementHandler>(null);
  const totalTime = Number(value.total_time);

  const { isPlaying, pauseVideo } = useCanvasPlayHandler();

  // 拖拽时 鼠标距离拖拽物的位置
  const [mousePosition, setMousePosition] = useState({});

  // 播放/暂停
  const handlePlayAudio = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    clickActionWeblog('action_music_play');
    if (mediaHandler.current) {
      if (inPlaying) {
        mediaHandler.current.pause();
      } else {
        mediaHandler.current.play(currentTime);
        pauseVideo();
      }
      if (setPlayingId && playingId !== value.id) {
        setPlayingId(value.id);
      }
      setInPlaying(!inPlaying);
    }
  };

  function stopPlay() {
    mediaHandler.current?.stop();
    setInPlaying(false);
    setCurrentTime(0);
  }

  useClickAway(e => {
    stopPlay();
  }, clickAwayTarget ?? audioWrapper);

  useEffect(() => {
    if (volume && mediaHandler.current) {
      mediaHandler.current.setVolume(volume);
    }
  }, [volume]);

  useEffect(() => {
    if (setPlayingId && playingId !== value.id) {
      stopPlay();
    }
  }, [playingId]);

  useEffect(() => {
    if (currentTime * 1000 >= totalTime - 1) {
      stopPlay();
    }
  }, [currentTime]);

  useEffect(() => {
    if (isPlaying && inPlaying) {
      stopPlay();
    }
  }, [isPlaying]);

  // 获取当前播放进度
  const getAudioCurrentTime = () => {
    return Math.round(((currentTime * 1000) / totalTime) * 100);
  };

  function onCanPlay() {
    if (videoRef.current) {
      // @ts-ignore
      mediaHandler.current = new MediaElementHandler(
        videoRef.current,
        0,
        totalTime,
        setCurrentTime,
      );
    }
  }

  // 删除音乐
  const bindDeleteMusic = (id: number | string) => {
    deleteFilesWithinType([id]).then((res: any) => {
      if (res.code === 0) {
        message.success('删除成功');
      }
      reload && reload();
    });
  };

  function getParams(): AddAudioParams {
    return {
      rt_title: value.title,
      resId: value.gid,
      type: 2, // bgm:1  其他配乐:2
      rt_url: value.preview,
      volume: 60,
      isLoop: false,
      ufsId: value.ufsId || undefined,
      // 音频时长
      rt_duration: Number(value.total_time),
      rt_sourceType: source_type,
    };
  }

  /**
   * 添加音频
   * */
  const addAudio = (startTime?: number) => {
    const obj = getParams();

    const duration = getNewAudioDuration(source_type, { ...obj, startTime });

    Object.assign(obj, duration);

    bindAddAudio && bindAddAudio(obj);

    stopPlay();
    // canvasHandler.stopVideo();
    pauseVideo();
  };
  const previewOptions = {
    offsetX: 0,
    offsetY: 0,
  };

  const [collected, drag, dragPreview] = useDrag(
    () => ({
      type: MUSIC_DRAG,
      previewOptions,
      item: {
        mousePosition,
        add: (position: { x: number; y: number; relativeX: number }) => {
          const time = (position.relativeX / unitWidth) * 1000;
          addAudio(time);

          // 埋点 drag_add_004 拖拽添加录音 drag_add_005拖拽添加音乐
          clickActionWeblog(
            Number(source_type) === 3 ? 'drag_add_004' : 'drag_add_005',
          );
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

  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;
  const typeList = ['', '【上传】', '【AI语音】', '【录音】'];
  const recordList = ['', '【录音】'];
  const checkButton = () => {
    if (isReplace) {
      return (
        <div
          className={styles['action-btn']}
          onClick={() => {
            addAudio();
          }}
        >
          替换
        </div>
      );
    }
    if (mode === 'simple' && activeAudio) {
      return (
        <div
          className={styles['action-btn']}
          onClick={() => {
            const params = getParams();

            Object.assign(params, {
              startTime: activeAudio.startTime,
              endTime: Math.min(
                activeAudio.endTime,
                activeAudio.startTime + value.total_time,
              ),
            });
            bindReplaceAudio && bindReplaceAudio(params, activeAudio?.rt_id);
          }}
        >
          替换
        </div>
      );
    }
    return null;
  };
  // 点击整体
  const clickAddAudoi = () => {
    if (!isReplace && !(mode === 'simple' && activeAudio)) {
      addAudio();
      clickActionWeblog(source_type === 3 ? 'mike_audio_005' : 'music_mix_add');
    }
  };
  const scanFlag = (color: string, txt: string) => {
    return (
      <div className={styles['music-list-scan_flag']}>
        <div style={{ background: color }} className={styles.scan_flag_icon}>
          !
        </div>
        {txt}
      </div>
    );
  };
  const ProcessDom = () => {
    if (!progress || fileState === 2 || progress === 100) {
      return null;
    }
    const text = progress < 99 ? '上传中...' : '上传成功';
    return (
      <div className={styles['music-list-scan_process']}>
        <div className={styles['process-text']}>{text}</div>
        <Progress percent={progress} />
      </div>
    );
  };
  const currentAudioTime = getAudioCurrentTime();
  return (
    <>
      <Spin indicator={antIcon} spinning={value?.status === 2}>
        <div
          id={value.id}
          ref={drag}
          onMouseDown={e => {
            const node = document.getElementById(value.id);
            const nodeOffset = node?.getBoundingClientRect();
            setMousePosition({ x: nodeOffset?.x, y: nodeOffset?.y });
          }}
          className={classNames(styles['music-list-item'], className)}
          style={{ opacity: collected.isDragging ? 0 : 1 }}
        >
          {/* scan_flag === 0 scan_flag === 3 显示遮罩 */}
          {/* {scan_flag === 0 && scanFlag('#FF3630', '系统正在检测中…')} */}
          {scan_flag === 3 && scanFlag('#FF8A30', '涉嫌违规违纪')}
          {fileState === 2 && scanFlag('#FF8A30', '转码中....')}
          {/* 上传的进度 */}
          <ProcessDom />
          <div
            className={styles['music-list-item-wrap']}
            key={value.id}
            ref={audioWrapper}
            onMouseEnter={() => {
              setLoadAudio(true);
            }}
            onClick={clickAddAudoi}
          >
            {loadAudio && (
              <audio
                ref={videoRef}
                src={value.preview}
                loop={false}
                onCanPlay={onCanPlay}
              >
                糟糕了老铁，你的浏览器不支持audio,请尝试升级
              </audio>
            )}

            <div className={styles['music-list-item-pic']}>
              <Progress
                type="circle"
                className={styles['play-progress']}
                showInfo={false}
                percent={currentAudioTime}
                strokeColor="#5A4CDB"
                trailColor="transparent"
              />
              <div
                className={classNames(styles['play-wrap'], {
                  [styles['play-wrap-playing']]:
                    inPlaying || currentAudioTime > 0,
                })}
                onClick={handlePlayAudio}
              >
                <div className={styles['play-wrap-mask']} />
                {value?.cover_url ? (
                  <img alt="" src={value.cover_url} />
                ) : (
                  <div className={styles['music-list-item-defaultBg']}>
                    <XiuIcon type="yinle-6fejnlmk" />
                  </div>
                )}

                <XiuIcon
                  type={inPlaying ? 'iconzanting' : 'iconbofang'}
                  className={styles['play-icon']}
                />
              </div>
            </div>
            <div className={styles['music-list-item-right']}>
              <div className={styles['music-list-item-top']}>
                <div className={styles['top-left']}>
                  {/* is_recording 1:录音 0：上传 */}
                  {/* source_type参数，1-上传，2-AI文字转语音，3-录音 */}
                  {recordList[value.is_recording || 0]}
                  {/* {typeList[source_type]} */}
                  {RegExp(/mp3/).test(value.title)
                    ? value.title
                    : `${value.title}.mp3`}
                </div>
              </div>
              <div className={styles['music-play-area']}>
                <div className={styles['music-time']}>
                  {formatNumberToTime(Number(value.total_time) / 1000)}
                </div>
              </div>
            </div>
            <div className={classNames(styles['music-list-item-action'])}>
              {deleteMusicReq && (
                <div
                  className={styles['del-btn']}
                  onClick={e => {
                    stopPropagation(e);
                    bindDeleteMusic(value.id);
                  }}
                >
                  <XiuIcon type="iconicons8_trash" />
                </div>
              )}
              {/* 审核通过显示操作按钮 */}
              {scan_flag !== 0 && scan_flag !== 3 && checkButton()}
            </div>
          </div>
        </div>
      </Spin>
    </>
  );
}
export default observer(MusicNode);
