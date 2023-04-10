import { forwardRef, memo, PropsWithChildren, useState } from 'react';
import { Button, Checkbox, Modal, Tooltip, Upload } from 'antd';
import XiuIcon from '@/components/XiuIcon';
import classNames from 'classnames';
import { ossEditorPath } from '@/config/urls';
import { clickActionWeblog } from '@/utils/webLog';

import DragUpload from '@/pages/SidePanel/Upload/DragUpload';
import {
  showBindPhoneModal,
  useAssetReplaceModal,
} from '@/store/adapter/useGlobalStatus';
import { getUserInfo } from '@/store/adapter/useUserInfo';
import InfiniteLoader, {
  InfiniteLoaderProps,
} from '@/components/InfiniteLoader';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { useCheckLoginStatus } from '@/hooks/loginChecker';
import FileItem from './Item';
import styles from './index.less';

type UploadFileListType = 'image,video' | 'image' | 'video';

interface UploadFileListProps extends InfiniteLoaderProps {
  type: UploadFileListType;
  request: (params: any) => Promise<any>;
  fileList: File[];
  beforeUpload: (file: File, uploadFileList: File[]) => boolean;
  setPhoneBindingShow: () => void;
  itemProps: {
    transcodingFiles: { fileId: string; state: 1 | 2 }[];
    onTranscodingFilesChange: (fileId: string) => void;
    selectable: boolean;
  };
  dragUploadDeps: any[];
  clickUpload: (e: any) => void;
  handleDelete: (ids: Array<string>) => void;
}

function List(props: PropsWithChildren<UploadFileListProps>, listRef) {
  const {
    type,
    beforeUpload,
    fileList,
    setPhoneBindingShow,
    itemProps,
    clickUpload,
    handleDelete,
    dragUploadDeps,
    ...others
  } = props;
  const [checkArr, setCheckArr] = useState([]);
  const { checkLoginStatus } = useCheckLoginStatus();
  const {
    value: { type: replaceModalType },
  } = useAssetReplaceModal();

  const onDelete = () => {
    clickActionWeblog('concise17');
    handleDelete(checkArr);
    setCheckArr([]);
  };

  const onChange = (e: CheckboxChangeEvent, newList: File[]) => {
    if (e.target.checked) {
      const ids = newList.map(item => {
        return item.id;
      });
      setCheckArr(ids);
    } else {
      setCheckArr([]);
    }
    clickActionWeblog('concise16');
  };

  const bindCheck = (e: { target: { checked: any } }, id: string) => {
    const arr = JSON.parse(JSON.stringify(checkArr));
    if (e.target.checked) {
      arr.push(id);
      setCheckArr(arr);
    } else {
      const newArr = arr.filter((item: string) => {
        return item !== id;
      });
      setCheckArr(newArr);
    }
  };

  const isReplaceAll = replaceModalType === 'replace-batch';
  const isAudio = replaceModalType === 'replace-audio';

  return (
    <>
      <DragUpload
        deps={dragUploadDeps}
        onFinish={files => {
          clickActionWeblog('action_upload_drag');
          if (checkLoginStatus()) {
            return;
          }
          if (getUserInfo()?.bind_phone !== 1) {
            showBindPhoneModal();
            return;
          }
          beforeUpload(files[0], files);
        }}
      >
        <div className={classNames(styles.uploadFileList)}>
          <InfiniteLoader
            ref={listRef}
            {...others}
            isEmpty={false}
            skeleton={{ rows: 4, columns: 4 }}
          >
            {({ list }) => {
              const newList = [...fileList, ...list];
              if (newList?.length > 0) {
                return (
                  <>
                    <div
                      className={styles.uploadFileListCheckAll}
                      hidden={checkArr?.length === 0}
                    >
                      <div className={styles.checkAllLeft}>
                        <Checkbox
                          checked={checkArr?.length === newList?.length}
                          onChange={e => onChange(e, newList)}
                        />
                        <span className={styles.checkAllNum}>
                          已选 {checkArr?.length} 个
                        </span>
                        <Tooltip title="批量删除">
                          <span
                            className={styles.checkAllDel}
                            onClick={() => {
                              clickActionWeblog('action_upload_delete');

                              Modal.confirm({
                                title: '删除文件',
                                content: (
                                  <p>
                                    确定要删除选中的
                                    <span
                                      style={{
                                        fontSize: 16,
                                        color: '#8676e8',
                                        fontWeight: 'bold',
                                        padding: '0 6px',
                                      }}
                                    >
                                      {checkArr?.length}
                                    </span>
                                    个文件？
                                  </p>
                                ),
                                okText: '确定',
                                cancelText: '再想想',
                                onOk: onDelete,
                              });
                            }}
                          >
                            <XiuIcon
                              type="iconshanchu"
                              style={{ fontSize: '16px', marginRight: '4px' }}
                            />
                            删除
                          </span>
                        </Tooltip>
                      </div>
                      <span
                        className={styles.checkAllOut}
                        onClick={() => {
                          setCheckArr([]);
                          clickActionWeblog('concise21');
                        }}
                      >
                        退出
                      </span>
                    </div>
                    <div
                      aria-label={type}
                      className={styles.uploadList}
                      style={{ position: 'relative', height: '100%' }}
                    >
                      {newList.map((item, index) => (
                        <FileItem
                          key={`uploader-${type}-${item?.id}`}
                          data={item}
                          setPhoneBindingShow={setPhoneBindingShow}
                          check={checkArr.indexOf(item?.id) > -1}
                          bindCheck={bindCheck}
                          {...itemProps}
                        />
                      ))}
                    </div>
                  </>
                );
              }
              return (
                <div className={styles.uploadEmpty}>
                  <img
                    className={styles.uploadEmptyImg}
                    src={ossEditorPath(`/image/logo/kong.png`)}
                    alt=""
                  />
                  <div className={styles.uploadEmptyTxt}>
                    暂未上传内容 可点击上传 或拖拽上传
                  </div>
                  <Upload
                    multiple
                    showUploadList={false}
                    beforeUpload={beforeUpload}
                  >
                    <Button
                      type="primary"
                      onClick={e => {
                        clickUpload(e);
                      }}
                      className={styles.uploadEmptyButton}
                    >
                      点击上传
                    </Button>
                  </Upload>
                </div>
              );
            }}
          </InfiniteLoader>
        </div>
      </DragUpload>
    </>
  );
}

export default memo(forwardRef(List));
