import { useState } from 'react';
import {
  getTemplateWatermark,
  useWatermarkImgUrlByObserver,
  useSetWatermarkPositionByObserver,
  observer,
} from '@hc/editor-core';
import { beforeUpload, useImgUpload } from '@/hooks/useUploadImg';
import { ViolationModal } from '@/components/ViolationModal';
import { dataWatermark } from '@/utils/webLog';
import styles from './index.less';
import NotUpload from './NotUpload';
import Uploaded from './uploaded';

import Adjust from '../Adjust';
import {
  setWatermark,
  editorPositionForView,
  calcWatermarkPositionForEditor,
} from '../../../handler';

interface ReplaceImgParams {
  id: string;
  url: string;
  height: number;
  width: number;
}

const ImgWatermark = (Props: { tiledShow: boolean }) => {
  const { tiledShow } = Props;
  const watermarkInfo = getTemplateWatermark();
  const [loading, setLoading] = useState(false);
  const [imgUrl, updateImgUrl] = useWatermarkImgUrlByObserver();

  const [value] = useSetWatermarkPositionByObserver();
  const position = editorPositionForView(value);

  const replaceImg = ({ id, url: picUrl, height, width }: ReplaceImgParams) => {
    let assetWidth = width;
    let assetHeight = height;

    if (width > 200) {
      assetWidth = 200;
      assetHeight = (200 / width) * height;
    }

    let transform;
    if (imgUrl) {
      transform = calcWatermarkPositionForEditor(position, {
        width: assetWidth,
        height: assetHeight,
      });
    }

    // 添加图片
    setWatermark(
      {
        meta: {
          id: watermarkInfo?.meta.id,
          type: 'image',
        },
        attribute: {
          resId: id,
          width: width / 2,
          height: height / 2,
          picUrl,
        },
        transform,
      },
      imgUrl ? 'replace' : 'add',
    );
  };

  const { uploadWatermarkStat } = useImgUpload({
    setProgress: (progress: number) => {
      // console.log(progress);
    },
    onSucceed: (data: any) => {
      if (data.img_scan_flag === 3) {
        ViolationModal({});
        return;
      }
      // bindStatus(data.url);
      setLoading(false);
      // console.log('onSucceed', data);
      if (data.url) replaceImg(data);
    },
    onError: () => {
      console.log('上传失败');
    },
  });

  const props = {
    name: 'file',
    // multiple: true,
    showUploadList: false,
    beforeUpload: (file: Blob) => {
      dataWatermark('VideoWmEdit', 'addImg');

      beforeUpload(file, (info: any) => {
        setLoading(true);
        uploadWatermarkStat(info.file);
      });
    },
  };

  return (
    <div className={styles.warp}>
      {imgUrl ? (
        <Uploaded picUrl={imgUrl} loading={loading} {...props} />
      ) : (
        <NotUpload {...props} />
      )}
      <Adjust visible={imgUrl} tiledShow={tiledShow} />
    </div>
  );
};

export default observer(ImgWatermark);
