import { FC, useState } from 'react';
import { Upload, UploadProps } from 'antd';
import {
  updateLogoImage,
  addImageLogo,
  useGetLogoByObserver,
  observer,
} from '@hc/editor-core';
import { beforeUpload, useImgUpload } from '@/hooks/useUploadImg';

import XiuIcon from '@/components/XiuIcon';

import { getUserInfo } from '@/store/adapter/useUserInfo';
import { getCanvasInfo } from '@/store/adapter/useTemplateInfo';
import { useUserBindPhoneModal } from '@/store/adapter/useGlobalStatus';

import PhoneBinding from '@/pages/GlobalMobal/PhoneBinding';
import { clickActionWeblog } from '@/utils/webLog';

import './index.less';
import Uploaded from './uploaded';

const { Dragger } = Upload;

const UploadLogo: FC<UploadProps> = () => {
  const logo = useGetLogoByObserver();
  const [loading, setLoading] = useState(false);
  const { showBindPhoneModal } = useUserBindPhoneModal();
  // const [phoneBindingShow, setPhoneBindingShow] = useState(false);

  const { upLogoloadStat } = useImgUpload({
    setProgress: (progress: number) => {
      console.log(progress);
    },
    onSucceed: (data: any) => {
      setLoading(false);

      if (data) {
        const params = {
          picUrl: data?.fileInfo?.small_cover_path,
          resId: `f${data.file_id}`,
          ufsId: `f${data.id}`,
        };

        if (logo) {
          updateLogoImage(params);
        } else {
          addImageLogo({ ...params, ...getCanvasInfo(), scale: 50 });
        }
      }
    },
    onError: res => {
      if (res === 'bindPhone') {
        showBindPhoneModal();
      }
      setLoading(false);
    },
  });

  const uploadProps = {
    name: 'file',
    showUploadList: false,
    beforeUpload: (file: Blob) => {
      const userInfo = getUserInfo();
      if (userInfo?.bind_phone !== 1) {
        showBindPhoneModal();
        return false;
      }
      beforeUpload(file, (fileInfo: any) => {
        setLoading(true);
        upLogoloadStat(fileInfo.file);
      });
    },
  };

  if (logo) {
    return (
      <Uploaded
        picUrl={logo.attribute.picUrl}
        loading={loading}
        {...uploadProps}
      />
    );
  }

  return (
    <div className="notuploadWarpper">
      <Dragger {...uploadProps}>
        <div
          className="notuploadWarp"
          onClick={() => clickActionWeblog('action_logo_upload')}
        >
          <XiuIcon type="iconshangchuan1" className="icon" />
          <div className="text">可将图片直接拖拽到此</div>
          <div className="text1">或</div>
          <div className="button">上传图片</div>
          <div className="text2">
            支持图片格式：JPG、PNG 、GIF 图片大小：10M
          </div>
        </div>
      </Dragger>
      {/* <PhoneBinding
        phoneBindingShow={phoneBindingShow}
        setPhoneBindingShow={setPhoneBindingShow}
        loginCallback={() => {}}
      /> */}
    </div>
  );
};

export default observer(UploadLogo);
