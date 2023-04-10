import { useEffect, useState } from 'react';
import { InfoCircleFilled } from '@ant-design/icons';
import { message, Checkbox } from 'antd';
import classNames from 'classnames';
import { observer } from '@hc/editor-core';
import { MusicNodeValue } from '@/pages/SidePanel/MusicPanel/componts/SetMusicNode';

import { beforeFileUpload } from '@/utils/uploader';
import { setBindPhoneState } from '@/store/adapter/useUserInfo';

import { useFileUpload } from '@/pages/SidePanel/Upload/handler';
import UploadProgress from '@/pages/SidePanel/Upload/FileItem/Progress';
import { ItemData, getFileType } from '@/pages/SidePanel/Upload/FileItem/index';
import { useAssetReplaceModal } from '@/store/adapter/useGlobalStatus';
import { clickActionWeblog } from '@/utils/webLog';
import MoreDropdown from '../../ElementWrap/MoreDropdown';
import { ElementWrap } from '../../ElementWrap';

import styles from './index.less';
import AudioItem from '../../AudioItem';

export interface ItemProps {
  data: ItemData;
  check: boolean;
  bindCheck: (e: any, id: string) => void;
  setPhoneBindingShow: () => void;
  folderId: string;
  handleReload: () => void;
  onTranscodingFilesChange: (id: string) => void;
  changeFileState: (id: string, fileType: string, info: any) => void;
}

function Item(props: ItemProps) {
  const {
    data,
    check,
    bindCheck,
    onTranscodingFilesChange,
    changeFileState,
    handleReload,
    folderId,
    setPhoneBindingShow,
  } = props;

  const {
    value: { type: replaceModalType },
  } = useAssetReplaceModal();
  const isReplaceAll = replaceModalType === 'replace-batch';
  const isAudio = replaceModalType === 'replace-audio';

  const { fileInfo, scan_flag } = data;

  const fileType = getFileType(fileInfo.mime_type);

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
      setTimeout(() => {
        handleFileStateChange(file);
      }, 1000);
    },

    setProgress({ progress }) {
      handleFileStateChange({ progress, state: 3 });
    },
    onError(res, { isNotAllow, bindPhone } = {}) {
      message.error(res?.msg);
      handleFileStateChange({
        state: isNotAllow ? -2 : -1,
        progress: 100,
      });

      if (bindPhone) {
        setPhoneBindingShow();
        setBindPhoneState(0);
      }
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
            uploadStat(fileInfo.file, folderId);
          } else {
            Object.assign(newFileState, { state: -1, progress: 100 });
          }
          handleFileStateChange(newFileState);
        });
        break;
      case 2: // 转码中
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
      rt_url: fileInfo.transcode?.sd,
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

  const getMusicParams: () => MusicNodeValue = () => ({
    id: `f${data.file_id}`,
    ufsId: `f${data.id}`,
    preview: fileInfo.transcode?.mp3 || '',
    title: data.title,
    total_time: Number(fileInfo.values?.duration) * 1000 || '',
    url: fileInfo.transcode?.mp3 || '',
    source_type: 1,
    status: 1,
  });

  const attribute = fileType === 'image' ? getAddImgParams() : getVideoParams();

  return (
    <>
      <div
        aria-label={fileType}
        className={classNames(styles.fileItem, {
          [styles['file-item-hover']]: fileInfo.state === 1,
        })}
      >
        <div
          className={styles['not-allow']}
          hidden={![3].includes(Number(scan_flag))}
        >
          <InfoCircleFilled style={{ fontSize: 20 }} />
          <span>素材涉嫌违规</span>
        </div>
        {!isReplaceAll && !isAudio && (
          <>
            <div
              className={classNames(styles.checkboxItem, {
                [styles.checkboxItemActive]: check,
              })}
            >
              <Checkbox
                checked={check}
                onChange={e => {
                  bindCheck(e, data.id);
                  clickActionWeblog('concise18');
                }}
              />
            </div>
            <div className={styles.moreDropdown}>
              <MoreDropdown handleReload={handleReload} data={data} />
            </div>
          </>
        )}

        <div className={classNames(styles['file-item-content'])}>
          <UploadProgress
            percent={fileInfo.progress}
            state={fileInfo.state}
            style={{ width: '100%', height: '100%' }}
            hidden={fileInfo.state === 1 || Object.keys(fileInfo).length < 1}
          />

          {fileType === 'audio' ? (
            <AudioItem data={getMusicParams()} type="local" />
          ) : (
            <ElementWrap
              data={attribute}
              type={fileType === 'video' ? 'videoE' : 'image'}
            />
          )}
        </div>
      </div>
    </>
  );
}
export default observer(Item);
