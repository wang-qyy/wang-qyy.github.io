import React, { useEffect, useState } from 'react';
import './index.less';
import UploadProgress from '@/pages/SidePanel/Upload/FileItem/Progress';
import { useUserBindPhoneModal } from '@/store/adapter/useGlobalStatus';
import { useFileUpload } from '@/pages/SidePanel/Brand/BrandModal/hook/logoUpload';
import Image from './Image';

function UploadItem(props: any) {
  const { item, changeFileState, brand_id } = props;
  function handleFileStateChange(info: any) {
    changeFileState(item.upId, info);
  }
  const { showBindPhoneModal } = useUserBindPhoneModal();

  const { uploadStat } = useFileUpload({
    onSucceed: res => {
      const progress = 100;
      const file = {
        ...res.fileInfo,
        state: 1,
        progress,
        id: res.id,
      };
      setTimeout(() => {
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
      cover_path: item.fileURL,
      small_cover_path: item.fileURL,
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
      <div
        className="uploadbrandLogo"
        style={{
          width: 150,
          height: 86,
          backgroundColor: '#e3e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <UploadProgress
          percent={item.progress}
          state={item.state}
          style={{ width: 150, height: 86 }}
          hidden={item.state === 1 || Object.keys(item).length < 1}
        />
        <Image
          key={`user-space-userImg-${item.id}`}
          data={{ file_id: item?.file_id, id: item?.id, logoInfo: item }}
        />
      </div>
    </>
  );
}

export default UploadItem;
