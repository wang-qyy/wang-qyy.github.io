import { FC } from 'react';
import { useRequest } from 'ahooks';
import { getTemplateWatermark, removeAsset, observer } from '@hc/editor-core';
import { Upload, message, UploadProps, Spin } from 'antd';
import { delUserPicture } from '@/api/pictures';
import styles from './index.less';

interface Prop extends UploadProps {
  picUrl: string;
  loading: boolean;
}
const Uploaded: FC<Prop> = Props => {
  const { picUrl, loading } = Props;

  const watermarkInfo = getTemplateWatermark();

  // 删除图片
  const { run: delUserImg } = useRequest(delUserPicture, {
    manual: true,
    onSuccess: response => {
      if (Number(response.stat) === 1) {
        message.success('删除成功');
      }
    },
  });

  // 删除
  const bindDel = () => {
    removeAsset(watermarkInfo);
    // delUserImg(watermarkInfo?.attribute.resId);
  };

  return (
    <div className={styles.uploadedWarp}>
      <div className={styles.imgWarp}>
        <div className={styles.imgShow}>
          {loading ? (
            <Spin spinning={loading} />
          ) : (
            <img src={picUrl} className={styles.img} alt="" />
          )}
        </div>
        <Upload {...Props}>
          <div className={styles.replace}>替换</div>
        </Upload>

        <div className={styles.del} onClick={bindDel}>
          删除
        </div>
      </div>
    </div>
  );
};

export default observer(Uploaded);
