import {
  PropsWithChildren,
  useEffect,
  useState,
  ReactElement,
  CSSProperties,
} from 'react';
import { Button, message, Tabs, Upload, Tooltip } from 'antd';
import { useRequest, useSetState } from 'ahooks';
import { debounce, differenceBy } from 'lodash-es';
import { getLayerAssets } from '@hc/editor-core';

import SidePanelWrap from '@/components/SidePanelWrap';

import {
  getMemoryInfo,
  getAllUploadFile,
  getUploadFilesByType,
  deleteFiles,
  checkFileState,
  deleteFilesWithinType,
} from '@/api/upload';
import XiuIcon from '@/components/XiuIcon';

import UploadQrcode from '@/pages/SidePanel/UserSpace/QRcode';
import {
  useBottomMode,
  usePasteStatus,
  showBindPhoneModal,
} from '@/store/adapter/useGlobalStatus';
import { getUserInfo } from '@/store/adapter/useUserInfo';
import { stopPropagation } from '@/utils/single';
import { useCheckLoginStatus } from '@/hooks/loginChecker';
import { clickActionWeblog } from '@/utils/webLog';
import { FileState } from './typing';

import { ItemData, getFileType } from './FileItem';

import Selected from './Selected';
import Memory from './Memory';
import List from './List';
import Breadcrumb from './Breadcrumb';

import './index.less';
import classNames from 'classnames';

export const desc = {
  image: { label: '图片', size: 10, accept: ['jpg', 'png'] },
  video: { label: '视频', size: 100, accept: ['mp4', 'mov'] },
  audio: { label: '音频', size: 50, accept: ['mp3', 'm4a'] },
};

export const UploadRemarks = ({ accept }: { accept: string[] }) => {
  const dom = [];

  // eslint-disable-next-line guard-for-in
  for (const i in desc) {
    const item = desc[i];
    if (accept.includes(i)) {
      dom.push(
        <p key={i}>
          {item.label}：可上传
          <span className="upload-tip-size">{item.size}M</span>
          以内的
          {item.accept.join('，')}格式
        </p>,
      );
    }
  }

  return <> {dom}</>;
};

// 上传提示
export const UploadHelpTip = ({
  tip,
  style,
  className,
}: PropsWithChildren<{
  tip: JSX.Element;
  style?: CSSProperties;
  className?: string;
}>) => {
  return (
    <Tooltip
      placement="bottom"
      overlayClassName={classNames('upload-help-tips', className)}
      getTooltipContainer={() =>
        document.getElementById('xiudodo') as HTMLDivElement
      }
      title={tip}
    >
      <div className="upload-help-tips-icon" style={style}>
        <XiuIcon type="iconhelp" />
      </div>
    </Tooltip>
  );
};

const initFileList = { image: [], video: [], audio: [] };

type FileTab = 'image' | 'video' | 'audio' | 'all';

const fileType: {
  key: FileTab;
  name: string;
  request: (params: any) => Promise<any>;
}[] = [
  { key: 'all', name: '全部', request: getAllUploadFile },
  { key: 'image', name: '图片', request: getUploadFilesByType },
  { key: 'video', name: '视频', request: getUploadFilesByType },
  { key: 'audio', name: '音频', request: getUploadFilesByType },
];

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

interface UploadModuleProps {
  type?: 'replace';
  Bottom?: (props: {
    selected: Array<any>;
    onSuccess: () => void;
  }) => ReactElement;
  header?: ReactElement;
}

export default function UploadModule({
  type,
  Bottom,
}: PropsWithChildren<UploadModuleProps>) {
  const refreshRef = {};
  const { checkLoginStatus } = useCheckLoginStatus();

  const userInfo = getUserInfo();
  const { value: mode } = useBottomMode();

  const { data = {}, run: getMemory } = useRequest(getMemoryInfo, {
    manual: true,
  });

  useEffect(() => {
    const unLogin = checkLoginStatus();

    if (!unLogin) {
      getMemory();
    }
  }, [userInfo.id]);
  const { pasteStatus, setPasteStatus } = usePasteStatus();

  const [folderId, setFolderId] = useState('0'); // 文件夹ID
  const [transcodingFiles, setTranscodingFiles] = useState<
    { file_id: string; state: FileState }[]
  >([]); // 转码中的文件
  const [selectFile, setSelectFile] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<FileTab>('all');

  const [loadedList, setLoadedList] = useState<any[]>([]);

  const [fileList, setFileList] = useSetState({ ...initFileList });

  const allFiles = [].concat(fileList.image, fileList.video, fileList.audio);

  // 清除上传列表（比如删除文件后刷新列表）
  function clearFileList() {
    setFileList({ image: [], video: [], audio: [] });
  }

  const handleFilesChange = debounce((uploadFiles: File[]) => {
    const temp = differenceBy(uploadFiles, allFiles, 'uid');

    const { maxMemoryByte = 0 } = data;
    let { useMemoryByte = 0 } = data;

    const uploadTypes = {};

    const result = { ...initFileList };

    for (let i = 0; i < temp.length; i++) {
      const item = temp[i];

      if (!item.uid) {
        item.uid = `timeStamp-${item.lastModified}`;
      }

      useMemoryByte += item.size;

      if (useMemoryByte > maxMemoryByte) {
        message.info({ content: '存储空间已满', maxCount: 1 });
        break;
      } else {
        const fileType = getFileType(item.type);
        // console.log(fileType, item.type, item);
        if (fileType === 'all') {
          message.info(`不支持该格式${item.type}文件类型`);
          break;
        }

        Object.assign(uploadTypes, { [fileType]: fileType });
        const newItem = formatFile(item);

        result[fileType] = [newItem].concat(result[fileType]);
      }
    }

    // 文件夹不做tab跳转
    if (folderId === '0') {
      const types = Object.keys(uploadTypes);
      if (types.length > 1) {
        setActiveTab('all');
      } else if (types[0]) {
        setActiveTab(types[0]);
      }
    }

    setTimeout(() => {
      setFileList(prev => {
        const newState = prev;
        Object.keys(result).forEach(tab => {
          newState[tab] = result[tab].concat(newState[tab]);
        });

        return newState;
      });
    });
  }, 200);

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

  function handleReload() {
    Object.keys(refreshRef).forEach(item => {
      refreshRef[item]?.reload();
    });
    getMemory();
  }
  /**
   * 批量删除文件
   * */
  async function handleDelete() {
    let res = {};

    if (activeTab === 'all') {
      res = await deleteFiles(
        selectFile.map(i => i.id),
        folderId,
      );
    } else {
      res = await deleteFilesWithinType(selectFile.map(i => i.id));
    }
    if (res.code === 0) {
      message.success('删除成功');
      setSelectFile([]);
      clearFileList();
      handleReload();
    }
  }

  // 选中文件
  function handleSelectFileChange({
    file,
    checked,
  }: {
    file: any;
    checked: boolean;
  }) {
    const { id } = file;
    let newSelected = selectFile;

    if (!checked) {
      newSelected = selectFile.filter(o => o.id !== id);
    } else {
      if (mode === 'simple') {
        const canReplace = getLayerAssets().filter(
          item =>
            ['image', 'pic', 'video', 'videoE'].includes(item.meta.type) &&
            !item.meta.isBackground,
        );

        if (selectFile.length >= canReplace.length) {
          message.info('不能再选啦');
          return;
        }
      }
      newSelected = newSelected.concat([file]);
    }

    setSelectFile(newSelected);
  }

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

  /**
   * 检测视频转码状态
   * */
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
            transcode: { sd: info.src, mp3: info.src },
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

  // 点击访问文件夹
  function changeFolderId(id: string) {
    clearFileList();
    setFolderId(id);
  }

  useEffect(() => {
    if (pasteStatus === 2) {
      handleReload();
      setPasteStatus(-1);
    }
  }, [pasteStatus]);

  function onSelectAll(isAll: boolean) {
    if (isAll) {
      setSelectFile([
        ...(activeTab === 'all' ? allFiles : fileList[activeTab]),
        ...refreshRef[activeTab].getData(),
      ]);
    } else {
      // 取消全选
      setSelectFile([]);
    }
  }

  return (
    <SidePanelWrap
      refresh
      wrapClassName="upload-wrap"
      bottom={
        Bottom ? (
          <Bottom selected={selectFile} onSuccess={() => setSelectFile([])} />
        ) : (
          <>
            <Selected
              amount={selectFile.length}
              onDelete={() => handleDelete()}
              onCancel={() => setSelectFile([])}
              onSelectAll={onSelectAll}
              isSelectedAll={
                [
                  ...loadedList,
                  ...(activeTab === 'all' ? allFiles : fileList[activeTab]),
                ].length === selectFile.length
              }
            />
            {!selectFile.length && <Memory data={data} />}
          </>
        )
      }
    >
      <div className="upload-buttons">
        <Upload beforeUpload={beforeUpload} multiple showUploadList={false}>
          <Button
            className="upload-button-item"
            type="primary"
            onClick={e => {
              clickActionWeblog('action_upload');
              if (checkLoginStatus()) {
                stopPropagation(e);
              } else if (userInfo?.bind_phone !== 1) {
                stopPropagation(e);
                showBindPhoneModal();
              }
            }}
          >
            电脑上传
            <UploadHelpTip
              tip={<UploadRemarks accept={['video', 'audio', 'image']} />}
            />
          </Button>
        </Upload>

        <UploadQrcode onSuccess={() => handleReload()} folderId={folderId}>
          <Button
            className="upload-button-item"
            onClick={() => clickActionWeblog('action_upload_mobile')}
          >
            手机上传
            <UploadHelpTip
              tip={<UploadRemarks accept={['video', 'image']} />}
              style={{ backgroundColor: '#5A4CDB', color: '#fff' }}
            />
          </Button>
        </UploadQrcode>
      </div>

      <Tabs
        activeKey={activeTab}
        destroyInactiveTabPane
        onChange={avtive => {
          clearFileList();
          setActiveTab(avtive);
          setSelectFile([]);
          setFolderId('0');
        }}
      >
        {fileType.map(item => {
          return (
            <Tabs.TabPane key={item.key} tab={item.name}>
              {item.key === 'all' && folderId !== '0' && (
                <Breadcrumb folderId={folderId} onChange={changeFolderId} />
              )}
              <List
                ref={ref => {
                  if (ref) {
                    refreshRef[item.key] = ref;
                  }
                }}
                type={item.key}
                request={item.request}
                params={{
                  folderId: item.key === 'all' ? folderId : 0,
                  type: item.key,
                }}
                beforeUpload={beforeUpload}
                fileList={activeTab === 'all' ? allFiles : fileList[activeTab]}
                itemProps={{
                  selectable: type !== 'replace',
                  selectFile,
                  selectedChange: handleSelectFileChange,
                  onFolderClick: changeFolderId,
                  onTranscodingFilesChange: runCheckFileState,
                  changeFileState,
                  folderId,
                }}
                onChange={setLoadedList}
                dragUploadDeps={[data?.maxMemoryByte]}
              />
            </Tabs.TabPane>
          );
        })}
      </Tabs>
    </SidePanelWrap>
  );
}
