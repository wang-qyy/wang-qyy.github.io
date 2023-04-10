import { forwardRef, memo, PropsWithChildren, LegacyRef } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { Upload } from 'antd';
import InfiniteLoader, {
  InfiniteLoaderProps,
} from '@/components/InfiniteLoader';
import { showBindPhoneModal } from '@/store/adapter/useGlobalStatus';
import { getUserInfo } from '@/store/adapter/useUserInfo';
import { clickActionWeblog } from '@/utils/webLog';
import { useCheckLoginStatus } from '@/hooks/loginChecker';
import { stopPropagation } from '@/utils/single';

import DragUpload from '../DragUpload';
import FileItem from '../FileItem';

import './index.less';

type UploadFileListType = 'all' | 'image' | 'video' | 'audio';

function EmptyList({ beforeUpload }: any) {
  const { checkLoginStatus } = useCheckLoginStatus();

  return (
    <div className="file-list-empty">
      <Upload multiple showUploadList={false} beforeUpload={beforeUpload}>
        <div
          className="upload-file-drag-icon"
          onClick={e => {
            if (checkLoginStatus()) {
              stopPropagation(e);
              return;
            }
            if (getUserInfo()?.bind_phone !== 1) {
              showBindPhoneModal();
              stopPropagation(e);
            }
          }}
        >
          <PlusOutlined style={{ fontSize: 24 }} />
        </div>
      </Upload>
      <p>拖拽文件到此区域以上传</p>
    </div>
  );
}

interface UploadFileListProps extends InfiniteLoaderProps {
  type: UploadFileListType;
  request: (params: any) => Promise<any>;
  fileList: File[];
  beforeUpload: (file: File, uploadFileList: File[]) => boolean;
  itemProps: {
    selectFile: any[];
    selectedChange: (params: { id: string; checked: boolean }) => void;
    onFolderClick: (id: string) => void;
    onTranscodingFilesChange: (fileId: string) => void;
    selectable: boolean;
  };
  onChange?: (list: any[]) => void;
  dragUploadDeps: any[];
}

function UploadFileList(
  props: PropsWithChildren<UploadFileListProps>,
  listRef: LegacyRef<any>,
) {
  const {
    type,
    beforeUpload,
    fileList,
    itemProps,
    onChange,
    dragUploadDeps,
    ...others
  } = props;
  const { checkLoginStatus } = useCheckLoginStatus();

  function onFinish(files: File[]) {
    clickActionWeblog('action_upload_drag');
    if (checkLoginStatus()) {
      return;
    }
    if (getUserInfo()?.bind_phone !== 1) {
      showBindPhoneModal();
      return;
    }
    beforeUpload(files[0], files);
  }

  return (
    <DragUpload deps={dragUploadDeps} onFinish={onFinish}>
      <InfiniteLoader
        ref={listRef}
        {...others}
        wrapStyle={{ position: 'absolute', top: 0 }}
        isEmpty={false}
        skeleton={{ rows: 3 }}
        onChange={onChange}
      >
        {({ list }) => {
          const newList = [...fileList, ...list];

          if (newList.length < 1) {
            return <EmptyList beforeUpload={beforeUpload} />;
          }

          return (
            <div
              className="user-upload-list"
              style={{ position: 'relative', height: '100%' }}
            >
              {newList.map(item => (
                <FileItem
                  key={`uploader-${type}-${item.uid ?? item.id}`}
                  data={item}
                  selected={
                    itemProps.selectFile?.findIndex(o => o.id === item.id) > -1
                  }
                  {...itemProps}
                />
              ))}
            </div>
          );
        }}
      </InfiniteLoader>
    </DragUpload>
  );
}

export default memo(forwardRef(UploadFileList));
