import { useEffect, useRef, useState } from 'react';
import { message, Upload } from 'antd';

import { useRequest } from 'ahooks';
import { XiuIcon } from '@/components';
import ColorPickerPopover from '@/components/ColorPickerPopover';
import { QrcodeInfo } from '@/kernel';
import { getUserInfo } from '@/store/adapter/useUserInfo';
import {
  useUserLoginModal,
  showBindPhoneModal,
} from '@/store/adapter/useGlobalStatus';
import { stopPropagation } from '@/utils/single';

import { beforeFileUpload } from '@/utils/uploader';
import { getFolderIdByTitle, getUploadFilesByType } from '@/api/upload';

import { useFileUpload } from '@/pages/SidePanel/Upload/handler';
import { clickActionWeblog } from '@/utils/webLog';

import { imgs } from '@/components/QrCodeCanvas/icons';

import LabelItem from '../LabelItem';
import styles from './index.less';

const StyleSet = ({
  state,
  dispatch,
}: {
  state: QrcodeInfo;
  dispatch: React.Dispatch<Partial<QrcodeInfo>>;
}) => {
  const { background, foreground } = state;
  const { showLoginModal } = useUserLoginModal();

  const folderInfo = useRef<{ folderId: string }>();

  const [uploadImgs, setUploadImgs] = useState([]);

  const { run } = useRequest(getUploadFilesByType, {
    manual: true,
    onSuccess(res) {
      const images: { resId: number; url: string; iconType: string }[] = [];

      res.items.forEach(img => {
        images.push({
          resId: img.gid,
          url: img.fileInfo.small_cover_path,
          iconType: 'custom',
        });
      });

      setUploadImgs(images);
    },
  });

  const { uploadStat } = useFileUpload({
    folder_id: folderInfo.current?.folderId,
    source_tag: 'icon',
    onSucceed(params) {
      // 刷新列表
      if (folderInfo.current) {
        run({
          page: 1,
          pageSize: 1000,
          type: 'image',
          folder_id: folderInfo.current.folderId,
        });
      }
    },
    onError(res) {
      message.error(res.msg);
    },
  });

  async function handleFileUpload(file: File) {
    // 获取上传的二维码存储文件夹ID
    if (folderInfo.current) {
      uploadStat(file, folderInfo.current.folderId);
    }
  }

  function beforeUpload(file: File) {
    clickActionWeblog('qrcode_04');

    beforeFileUpload(file, 'image', isAccept => {
      if (isAccept) {
        handleFileUpload(file);
      }
    });

    return false;
  }

  async function getFolderInfo() {
    // 获取上传的二维码存储文件夹ID
    const res = await getFolderIdByTitle('我的图标');

    if (res.code === 0) {
      const id = res.data.folder_id;
      folderInfo.current = { folderId: id };

      run({ page: 1, pageSize: 1000, type: 'image', folder_id: id });
    }
  }

  useEffect(() => {
    getFolderInfo();
  }, []);

  return (
    <div className={styles.StyleSet}>
      {/* 颜色选择 */}
      <LabelItem label="颜色">
        <ColorPickerPopover
          buttonClassName={styles.colorPicker}
          value={foreground}
          onChange={(color: typeof foreground) => {
            clickActionWeblog('qrcode_01');
            dispatch({ foreground: color });
          }}
        />
        <ColorPickerPopover
          buttonClassName={styles.colorPicker}
          style={{ padding: 12 }}
          value={background}
          onChange={(color: typeof background) => {
            clickActionWeblog('qrcode_02');

            dispatch({ background: color });
          }}
          single
        />
      </LabelItem>
      {/* logo图片 */}
      <LabelItem label="logo">
        <div className={styles.imgList}>
          <div
            className={styles.img}
            onClick={() => {
              dispatch({ rt_url: '', resId: '' });
            }}
          >
            <XiuIcon className={styles.icon} type="iconwushuju" />
          </div>
          {[...imgs, ...uploadImgs].map(img => (
            <div
              key={img.resId ?? img.iconType}
              onClick={() => {
                clickActionWeblog('qrcode_03');
                dispatch({
                  rt_url: img.url,
                  resId: img.resId,
                  iconType: img.iconType,
                });
              }}
              className={styles.img}
              style={{
                background: `url(${img.url}) #F3F5F6 center / contain no-repeat`,
              }}
            />
          ))}
          <Upload showUploadList={false} beforeUpload={beforeUpload}>
            <div
              className={styles.img}
              onClick={e => {
                const userInfo = getUserInfo();

                if (userInfo.id < 0) {
                  showLoginModal();
                  stopPropagation(e);
                } else if (!userInfo.bind_phone) {
                  showBindPhoneModal();
                  stopPropagation(e);
                }
              }}
            >
              <XiuIcon className={styles.addIcon} type="iconxingzhuangjiehe6" />
            </div>
          </Upload>
        </div>
      </LabelItem>
    </div>
  );
};

export default StyleSet;
