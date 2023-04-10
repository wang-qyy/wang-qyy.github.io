import React, { useEffect } from 'react';
import UploadProgress from '@/pages/SidePanel/Upload/FileItem/Progress';
import { useFileUpload } from '@/pages/SidePanel/Brand/BrandModal/hook/logoUpload';
import { useUserBindPhoneModal } from '@/store/adapter/useGlobalStatus';
import { Dropdown, Menu } from 'antd';
import XiuIcon from '@/components/XiuIcon';
import { WarnModal } from '@/components/WarnModal';
import styles from './index.less';

function UploadItem(props: any) {
  const {
    item,
    changeFileState,
    brand_id,
    updateLogoList,
    delLogo,
    updateLogoCallBack,
  } = props;
  function handleFileStateChange(info: any) {
    changeFileState(item.upId, info);
  }
  const { showBindPhoneModal } = useUserBindPhoneModal();

  const { uploadStat } = useFileUpload({
    onSucceed: res => {
      const progress = 100;
      const file = {
        ...res.fileInfo,
        id: res.id,
        state: 1,
        progress,
        file_id: res.file_id,
        poster: res.fileInfo.cover_path,
        src: res.fileInfo.file_path,
      };
      setTimeout(() => {
        updateLogoCallBack();
        handleFileStateChange(file);
      }, 1000);
    },

    setProgress({ progress }) {
      handleFileStateChange({ progress, state: 3 });
    },
    onError(res, { isNotAllow, bindPhone } = {}) {
      handleFileStateChange({
        state: isNotAllow ? -2 : -1,
        progress: 100,
      });
      if (bindPhone) {
        showBindPhoneModal();
      }
    },
  });

  useEffect(() => {
    const newFileState = {
      width: item.width,
      height: item.height,
      poster: item.fileURL,
    };
    switch (item.state) {
      case 0: // 等待上传
        uploadStat(item.file, brand_id);
        Object.assign(newFileState, { state: 4 });
        handleFileStateChange(newFileState);
        break;
    }
  }, [item.state]);

  return (
    <>
      <div key={item.id} className={styles.branLogoItem}>
        <UploadProgress
          percent={item.progress}
          state={item.state}
          style={{ width: '100%', height: '100%' }}
          hidden={
            !item.state || item.state === 1 || Object.keys(item).length < 1
          }
        />
        <div className={styles.branLogoItemImg}>
          <img
            src={item?.logoInfo?.cover_path || item.fileURL}
            style={{ maxWidth: '100%', maxHeight: '100%' }}
            alt=""
          />
        </div>

        <Dropdown
          overlay={
            <Menu>
              <Menu.Item
                key="mail"
                onClick={() => {
                  WarnModal({
                    title: '确定删除已上传Logo？',
                    content: '删除后无法撤销，现有设计不会受影响。',
                    button: '确定删除',
                    onOk: () => {
                      delLogo(item.id, res => {
                        updateLogoList();
                      });
                    },
                    onCancel: () => { },
                    width: 335,
                  });
                }}
              >
                <XiuIcon
                  type="delete"
                  className={styles.branLogoItemMenuIcon}
                />
                删除LOGO
              </Menu.Item>
            </Menu>
          }
        >
          <div className={styles.branLogoItemIcon}>
            <XiuIcon type="huaban1" />
          </div>
        </Dropdown>
      </div>
    </>
  );
}

export default UploadItem;
