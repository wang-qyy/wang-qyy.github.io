import { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import { PlusOutlined, InfoCircleFilled } from '@ant-design/icons';
import { Checkbox, message } from 'antd';
import classNames from 'classnames';
import {
  getAbsoluteCurrentTime,
  pauseVideo,
  observer,
  useAllTemplateVideoTimeByObserver,
} from '@hc/editor-core';
import {
  showBindPhoneModal,
  useBottomMode,
} from '@/store/adapter/useGlobalStatus';

import DragBox from '@/components/DragBox';
import { ElementWrap } from '@/CommonModule/ElementActions';
import { ElementAction as AddAction } from '@/CommonModule/ElementActions/Action';

import { useSetActiveAudio } from '@/store/adapter/useAudioStatus';
import {
  useSetMusic,
  getNewAudioDuration,
  AddAudioParams,
} from '@/hooks/useSetMusic';

import {
  beforeFileUpload,
  ACCEPT_FILE_TYPE,
  ACCEPT_AUDIO_TYPE,
  ACCEPT_IMAGE_TYPE,
  ACCEPT_VIDEO_TYPE,
} from '@/utils/uploader';
import { stopPropagation } from '@/utils/single';
import { setBindPhoneState } from '@/store/adapter/useUserInfo';
import { useDrag } from 'react-dnd';
import { MUSIC_DRAG } from '@/constants/drag';
import { useGetUnitWidth } from '@/pages/Content/Bottom/handler';
import { audioMinDuration } from '@/config/basicVariable';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { clickActionWeblog } from '@/utils/webLog';

import Image from './Image';
import Video from './Video';
import Folder from './Folder';
import Audio from './Audio';
import UploadProgress from './Progress';

import { useFileUpload } from '../handler';

import { ScanFlag, FileType, FileInfo } from '../typing';

import './index.less';

function Empty() {
  return <></>;
}

export interface ItemData {
  fileInfo: FileInfo;
  thumbnail?: string[];
  id: string;
  file_id: string;
  type: FileType;
  title: string;
  uid?: string;
  scan_flag?: ScanFlag;
}

export interface ItemProps {
  data: ItemData;
  selectedChange: (params: { file: any; checked: boolean }) => void;
  selected: boolean;
  isTranscoding: boolean; // 转码状态
  onFolderClick?: (folderId: string) => void;
  folderId: string;
  selectable?: boolean; // 是否可以选中
}

export function getFileType(mime_type: string) {
  if (ACCEPT_IMAGE_TYPE.includes(mime_type)) {
    return 'image';
  }
  if (ACCEPT_VIDEO_TYPE.includes(mime_type)) {
    return 'video';
  }
  if (ACCEPT_AUDIO_TYPE.includes(mime_type)) {
    return 'audio';
  }
  return 'all';
}

function useItem(type: string) {
  return useMemo(() => {
    switch (type) {
      case 'image':
        return Image;
      case 'video':
        return Video;
      case 'audio':
        return Audio;
      case 'folder':
        return Folder;

      default:
        return Empty;
    }
  }, [type]);
}

function Item(props: ItemProps) {
  const {
    data,
    selected,
    selectedChange,
    onFolderClick,
    onTranscodingFilesChange,
    changeFileState,
    folderId,
    selectable,
  } = props;

  const [isDragging, setIsDragging] = useState(false);
  const { activeAudio } = useSetActiveAudio();
  const [videoTotalTime] = useAllTemplateVideoTimeByObserver();

  const { bindAddAudio, bindReplaceAudio } = useSetMusic();

  const { fileInfo, title, type, scan_flag } = data;
  const fileType = type === 2 ? 'folder' : getFileType(fileInfo.mime_type);
  const ItemDom = useItem(fileType);
  const unitWidth = useGetUnitWidth();
  // 拖拽时 鼠标距离拖拽物的位置
  const [mousePosition, setMousePosition] = useState({});

  const fileDisable = useMemo(() => {
    return type === 2
      ? false
      : Object.keys(fileInfo).length < 1 ||
          !ACCEPT_FILE_TYPE.includes(fileInfo.mime_type);
  }, [fileInfo.mime_type]);

  function handleFileStateChange(info: any) {
    changeFileState(data.id, fileType, info);
  }

  const { uploadStat } = useFileUpload({
    folder_id: folderId,
    onSucceed: res => {
      let progress = 100;
      if (res.fileInfo.state === 2) {
        progress = 99;
      }

      // 上传成功埋点
      clickActionWeblog('file_uploaded', {
        action_label: res.fileInfo.file_format,
      });

      const file = {
        ...res.fileInfo,
        state: res.fileInfo.state,
        progress,
        id: res.id,
        file_id: res.file_id,
        poster: res.fileInfo.cover_path,
        // duration: res.fileInfo.values?.duration,
        src: res.fileInfo.file_path,
      };
      // console.log(file);

      setTimeout(() => {
        handleFileStateChange(file);
        // setFileState(file);
      }, 1000);
    },

    setProgress({ progress }) {
      handleFileStateChange({ progress, state: 3 });

      // setFileState({ progress });
    },
    onError(res, { isNotAllow, bindPhone } = {}) {
      message.error(res?.msg);
      handleFileStateChange({
        state: isNotAllow ? -2 : -1,
        progress: 100,
      });

      if (bindPhone) {
        showBindPhoneModal();
        setBindPhoneState(0);
      }
      // setFileState({ state: -1 });
    },
  });

  useEffect(() => {
    switch (fileInfo.state) {
      case 0: // 等待上传
        beforeFileUpload(fileInfo.file, fileType, (isAccept, info) => {
          const newFileState = {
            width: info.width,
            height: info.height,
            poster: info.fileURL,
            duration: info.duration,
          };

          if (isAccept) {
            uploadStat(fileInfo.file);

            Object.assign(newFileState, { state: 4 });
          } else {
            Object.assign(newFileState, { state: -1, progress: 100 });
          }
          // setFileState(newFileState);

          handleFileStateChange(newFileState);
        });
        break;
      case 2: // 转码中
        // setFileState({ progress: 99 });
        onTranscodingFilesChange(data.file_id);

        break;
    }
  }, [fileInfo.state]);

  const ids = { resId: `f${data.file_id}`, ufsId: `f${data.id}` };

  function getAddImgParams() {
    return {
      ...ids,
      width: fileInfo.width,
      height: fileInfo.height,
      picUrl: fileInfo.cover_path,
      rt_preview_url: fileInfo.cover_path,
      isUser: true,
    };
  }

  function getVideoParams() {
    return {
      ...ids,
      rt_url: fileInfo.transcode?.hd ?? fileInfo.transcode?.sd,
      rt_preview_url: fileInfo.cover_path,
      rt_frame_url: fileInfo.cover_path,
      rt_total_frame: parseInt(fileInfo.values?.duration) * 30,
      rt_total_time: parseInt(fileInfo.values?.duration) * 1000,
      width: fileInfo.width,
      height: fileInfo.height,
      isUser: true,
      volume: 60,
      voiced: true,
    };
  }

  const { value: mode } = useBottomMode();
  const isReplaceAudio = mode === 'simple' && activeAudio;

  // 添加音频
  const addAudio = (time?: number) => {
    const duration = parseFloat(fileInfo.values?.duration) * 1000;

    const obj: AddAudioParams = {
      ...ids,
      rt_title: title,
      type: 2, // bgm:1  其他配乐:2
      rt_url: fileInfo.transcode?.mp3,
      volume: 60,
      isLoop: false,
      // 音频时长
      rt_duration: duration,
      rt_sourceType: 1,
    };

    const audioDuration = getNewAudioDuration(1, { ...obj, startTime: time });

    Object.assign(obj, audioDuration);

    if (isReplaceAudio) {
      bindReplaceAudio(obj, activeAudio?.rt_id);
    } else {
      bindAddAudio(obj);
    }
    // canvasHandler.stopVideo();
    pauseVideo();
  };

  const attribute = fileType === 'image' ? getAddImgParams() : getVideoParams();
  const [collected, drag, dragPreview] = useDrag(
    () => ({
      type: MUSIC_DRAG,
      canDrag: type === 1,
      item: {
        id: data.id,
        mousePosition,
        add: (position: { x: number; y: number; relativeX: number }) => {
          const time = (position.relativeX / unitWidth) * 1000;
          addAudio(time);
          clickActionWeblog('drag_user-space_add_audio');
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
    <>
      <div
        aria-label={fileType}
        className={classNames('upload-file-item', {
          'upload-file-item-hover': fileInfo.state === 1,
        })}
        style={{ opacity: collected.isDragging || isDragging ? 0 : 1 }}
        onClick={() => {
          if (type === 2) {
            // 文件夹
            onFolderClick && onFolderClick(data.id);
          } else if (fileDisable) {
            message.info(
              `暂不支持该类型（${fileInfo.mime_type}）文件添加到画布`,
            );
          }
        }}
      >
        <div
          hidden={
            !selectable ||
            (mode === 'simple' && ['folder', 'audio'].includes(fileType))
          }
          className={classNames('upload-file-item-action-select', {
            'item-selected': selected,
          })}
          onClick={stopPropagation}
        >
          <Checkbox
            checked={selected}
            onChange={e =>
              selectedChange({
                file: {
                  id: data.id,
                  type: fileType === 'video' ? 'videoE' : 'image',
                  ...attribute,
                },
                checked: e.target.checked,
              })
            }
          />
        </div>
        {/* 文件违规说明 */}
        <div
          className="file-not-allow"
          hidden={![3].includes(Number(scan_flag))}
        >
          <InfoCircleFilled style={{ fontSize: 20 }} />
          <span>文件涉及违规 已下架</span>
          <span>如需恢复 请联系客服</span>
        </div>
        {/*  */}
        <div
          className={classNames('upload-file-item-content', {
            'upload-file-item-disabled': fileDisable,
          })}
        >
          <UploadProgress
            percent={fileInfo.progress}
            state={fileInfo.state}
            hidden={
              type === 2 ||
              fileInfo.state === 1 ||
              Object.keys(fileInfo).length < 1
            }
          />

          {fileType === 'audio' || fileType === 'folder' ? (
            <>
              <AddAction
                tip={isReplaceAudio ? '替换' : '添加'}
                onClick={() => {
                  clickActionWeblog('action_user-space_add_audio');
                  addAudio();
                }}
                hidden={fileType === 'folder'}
                className="element-action-add upload-file-item-action"
                style={{ zIndex: 4 }}
                icon={isReplaceAudio ? 'icontihuan' : ''}
              >
                <PlusOutlined style={{ color: '#fff', fontSize: 12 }} />
              </AddAction>
              <div
                ref={drag}
                id={data.file_id}
                onMouseDown={e => {
                  const node = document.getElementById(data.file_id);
                  const nodeOffset = node?.getBoundingClientRect();
                  setMousePosition({ x: nodeOffset?.x, y: nodeOffset?.y });
                }}
                style={{ height: '100%' }}
              >
                <ItemDom
                  poster={fileInfo.small_cover_path}
                  src={fileInfo.transcode?.sd || fileInfo.transcode?.mp3}
                  duration={fileInfo.values?.duration}
                  width={fileInfo.width}
                  height={fileInfo.height}
                  thumbnail={data.thumbnail}
                  id={data.id}
                  file_id={data.file_id}
                  canEdit={false}
                />
              </div>
            </>
          ) : (
            <DragBox
              data={{
                meta: {
                  type: fileType === 'video' ? 'videoE' : 'image',
                },
                attribute,
              }}
              type={fileType === 'video' ? 'videoE' : 'image'}
              style={{ height: '100%' }}
              canDrag={!fileDisable || type !== 1}
              onDrag={() => {
                setIsDragging(true);
              }}
              onDragEnd={() => {
                setIsDragging(false);
              }}
              onDrop={() => {}}
            >
              <ElementWrap
                data={attribute}
                type={fileType === 'video' ? 'videoE' : 'image'}
              />
            </DragBox>
          )}
        </div>
        <div className="upload-file-item-title" title={title}>
          {title}
        </div>
      </div>
    </>
  );
}
export default observer(Item);
