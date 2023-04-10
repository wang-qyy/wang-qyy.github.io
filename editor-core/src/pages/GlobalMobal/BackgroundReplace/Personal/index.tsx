/* eslint-disable no-nested-ternary */
import React, {
  useState,
  useEffect,
  PropsWithChildren,
  CSSProperties,
} from 'react';
import { Button, message, Tabs, Upload, Tooltip } from 'antd';
import { useCheckLoginStatus } from '@/hooks/loginChecker';
import { getUserInfo } from '@/store/adapter/useUserInfo';
import { debounce, differenceBy } from 'lodash-es';
import { useRequest, useSetState } from 'ahooks';
import UploadQrcode from '@/pages/SidePanel/UserSpace/QRcode';
import { stopPropagation } from '@/utils/single';
import {
  getMemoryInfo,
  getUploadFilesByType,
  checkFileState,
  deleteFiles,
  deleteFilesWithinType,
} from '@/api/upload';
import { ItemData, getFileType } from '@/pages/SidePanel/Upload/FileItem/index';
import {
  useAssetReplaceModal,
  useUserBindPhoneModal,
} from '@/store/adapter/useGlobalStatus';
import { FileState } from '@/pages/SidePanel/Upload/typing';

import { clickActionWeblog } from '@/utils/webLog';
import { UploadRemarks, UploadHelpTip } from '@/pages/SidePanel/Upload';
import { XiuIcon } from '@/components';
import List from './List';

import styles from './index.less';

const fileType: {
  key: 'image' | 'video' | 'all';
  name: string;
  request: (params: any) => Promise<any>;
}[] = [
  { key: 'all', name: '全部', request: getUploadFilesByType },
  { key: 'image', name: '图片', request: getUploadFilesByType },
  { key: 'video', name: '视频', request: getUploadFilesByType },
];

const audioType: {
  key: 'audio';
  name: string;
  request: (params: any) => Promise<any>;
}[] = [{ key: 'audio', name: '音频', request: getUploadFilesByType }];

const initFileList = { image: [], video: [], audio: [] };

function formatFile(file: File): ItemData {
  return {
    title: file.name,
    type: 1,
    id: file.uid,
    uid: file.uid,
    fileInfo: {
      state: 0,
      mime_type: file.type,
      file,
    },
  };
}

function Personal() {
  const refreshRef = {};
  const { checkLoginStatus } = useCheckLoginStatus();
  const userInfo = getUserInfo();
  const {
    value: { type: replaceType },
  } = useAssetReplaceModal();

  const isAudio = replaceType === 'replace-audio';
  const tabsList = isAudio ? audioType : fileType;

  const [fileList, setFileList] = useSetState({ ...initFileList });

  const [activeTab, setActiveTab] = useState<
    'image' | 'video' | 'all' | 'audio'
  >('all');

  useEffect(() => {
    if (isAudio) {
      setActiveTab('audio');
    } else {
      setActiveTab('all');
    }
  }, [isAudio]);

  const allFiles = [].concat(fileList.image, fileList.video);

  function clearFileList() {
    setFileList({ image: [], video: [] });
  }
  const [transcodingFiles, setTranscodingFiles] = useState<
    { file_id: string; state: FileState }[]
  >([]); // 转码中的文件
  const { showBindPhoneModal } = useUserBindPhoneModal();
  // const [phoneBindingShow, setPhoneBindingShow] = useState(false);

  const { data = {}, run: getMemory } = useRequest(getMemoryInfo, {
    manual: true,
  });
  const handleFilesChange = debounce((uploadFiles: File[]) => {
    const temp = differenceBy(uploadFiles, allFiles, 'uid');

    const { maxMemoryByte = 0 } = data;
    let { useMemoryByte = 0 } = data;

    const uploadTypes = {};

    setFileList(prev => {
      const newState = prev;
      for (let i = 0; i < temp.length; i++) {
        const item = temp[i];

        useMemoryByte += item.size;

        if (useMemoryByte > maxMemoryByte) {
          // message.config({ maxCount: 1 });
          message.info({ content: '存储空间已满', maxCount: 1 });
          break;
        } else {
          const fileType = getFileType(item.type);

          if (fileType === 'all') {
            message.info(`不支持该格式${item.type}文件类型`);
            break;
          }

          // 暂时屏蔽音频上传
          // if (fileType === 'audio') {
          //   message.info(`暂不支持音频${item.type}文件上传`);
          //   break;
          // }

          Object.assign(uploadTypes, { [fileType]: fileType });

          const newItem = formatFile(item);

          newState[fileType] = [newItem].concat(newState[fileType]);
        }
      }

      return newState;
    });

    const types = Object.keys(uploadTypes);
    if (types.length > 1) {
      setActiveTab('all');
    } else if (types[0]) {
      setActiveTab(types[0]);
    }
  }, 200);

  function handleReload() {
    clearFileList();
    Object.keys(refreshRef).forEach(item => {
      refreshRef[item]?.reload();
    });
    getMemory();
  }

  useEffect(() => {
    const unLogin = checkLoginStatus();

    if (!unLogin) {
      getMemory();
    }
  }, []);

  // 检测文件转码状态
  const { run, cancel } = useRequest(checkFileState, {
    manual: true,
    pollingInterval: 1000,
    onSuccess(res) {
      const newFiles: any = [];

      res.forEach(item => {
        if (item.state === 2) {
          newFiles.push(item);
        }
      });

      setFileList(prevState => {
        Object.keys(prevState).forEach(item => {
          prevState[item].forEach((file: any) => {
            res.forEach((temp: any) => {
              if (temp.file_id === file.file_id && temp.state === 1) {
                Object.assign(file.fileInfo, { state: 1, ...temp.fileInfo });
              }
            });
          });
        });
        return prevState;
      });

      setTranscodingFiles(newFiles);
      if (!newFiles.length) {
        cancel();
      }
    },
  });

  function runCheckFileState(file_id: string) {
    cancel();

    setTranscodingFiles(prevState => {
      const newState = prevState.concat([{ file_id, state: 2 }]);

      const newFileIds: string[] = [];

      const files = newState.filter(item => {
        if (item.state === 2) {
          newFileIds.push(item.file_id);

          return item;
        }
      });

      if (newFileIds.length) {
        run(newFileIds);
      }

      return files;
    });
  }
  function changeFileState(fileId: string, type: string, info: any) {
    setFileList(prevState => {
      const files = prevState[type];

      const index = files.findIndex(item => item.id === fileId);

      if (files[index]) {
        if (info.duration) {
          Object.assign(files[index].fileInfo, {
            values: { duration: info.duration },
          });
        }
        // 上传状态
        if (info.state) {
          Object.assign(files[index].fileInfo, { state: info.state });
        }

        if (info.width) {
          Object.assign(files[index].fileInfo, {
            height: info.height,
            width: info.width,
          });
        }

        if (info.poster) {
          Object.assign(files[index].fileInfo, {
            cover_path: info.poster,
            small_cover_path: info.poster,
          });
        }

        if (info.progress) {
          Object.assign(files[index].fileInfo, {
            progress: info.progress,
          });
        }

        if (info.src) {
          Object.assign(files[index].fileInfo, {
            transcode: { sd: info.src },
          });
        }

        if (info.transcode) {
          Object.assign(files[index].fileInfo, {
            transcode: info.transcode,
          });
        }

        if (info.values) {
          Object.assign(files[index].fileInfo, {
            values: info.values,
          });
        }

        if (info.file_id) {
          Object.assign(files[index], { file_id: info.file_id, id: info.id });
        }

        Object.assign(prevState, { [type]: files });
      }
      return prevState;
    });
  }

  // 文件上传前的一些操作
  function beforeUpload(file: File, uploadFiles: File[]) {
    if (!checkLoginStatus()) {
      if (userInfo?.bind_phone !== 1) {
        showBindPhoneModal();
      } else {
        handleFilesChange(uploadFiles);
      }
    }
    return false; // 手动上传
  }

  // 批量删除文件
  async function handleDelete(ids: string[]) {
    let res = {};

    if (activeTab === 'all') {
      res = await deleteFiles(ids);
    } else {
      res = await deleteFilesWithinType(ids);
    }
    if (res.code === 0) {
      message.success('删除成功');
      clearFileList();
      handleReload();
    }
  }

  const clickUpload = (e: React.SyntheticEvent<Element, Event>) => {
    if (checkLoginStatus()) {
      stopPropagation(e);
    } else if (userInfo?.bind_phone !== 1) {
      stopPropagation(e);
      showBindPhoneModal();
    }
  };
  const operations = (
    <div className={styles.personalWarpTabRight}>
      {!isAudio && (
        <UploadQrcode
          onSuccess={() => {
            handleReload();
          }}
          folderId="0"
        >
          <Button
            className={styles['upload-button-item']}
            onClick={() => {
              clickActionWeblog('concise13');
            }}
            style={{ margin: 12 }}
          >
            手机上传
            <UploadHelpTip
              className={styles['upload-button-item-icon']}
              tip={<UploadRemarks accept={['video', 'image']} />}
              style={{ backgroundColor: '#5A4CDB', color: '#fff' }}
            />
          </Button>
        </UploadQrcode>
      )}
      <Upload multiple showUploadList={false} beforeUpload={beforeUpload}>
        <Button
          type="primary"
          className={styles['upload-button-item']}
          onClick={e => {
            clickUpload(e);
            clickActionWeblog('concise14');
          }}
        >
          电脑上传
          <UploadHelpTip
            className={styles['upload-button-item-icon']}
            tip={
              <UploadRemarks
                accept={isAudio ? ['audio'] : ['video', 'image']}
              />
            }
          />
        </Button>
      </Upload>
    </div>
  );

  return (
    <div className={styles.personalWarp}>
      <Tabs
        activeKey={activeTab}
        destroyInactiveTabPane
        onChange={avtive => {
          clearFileList();
          setActiveTab(avtive);
        }}
        tabBarExtraContent={operations}
      >
        {tabsList.map(item => {
          return (
            <Tabs.TabPane key={item.key} tab={item.name}>
              <List
                ref={ref => {
                  if (ref) {
                    refreshRef[item.key] = ref;
                  }
                }}
                type={item.key}
                request={item.request}
                params={{
                  folderId: 0,
                  type: item.key === 'all' ? 'image,video' : item.key,
                  pageSize: 40,
                  filter_format: 'gif',
                }}
                beforeUpload={beforeUpload}
                fileList={activeTab === 'all' ? allFiles : fileList[activeTab]}
                itemProps={{
                  transcodingFiles,
                  changeFileState,
                  onTranscodingFilesChange: runCheckFileState,
                  folderId: 0,
                  handleReload,
                }}
                setPhoneBindingShow={showBindPhoneModal}
                clickUpload={clickUpload}
                handleDelete={handleDelete}
                dragUploadDeps={[data?.maxMemoryByte]}
              />
            </Tabs.TabPane>
          );
        })}
      </Tabs>
    </div>
  );
}

export default Personal;
