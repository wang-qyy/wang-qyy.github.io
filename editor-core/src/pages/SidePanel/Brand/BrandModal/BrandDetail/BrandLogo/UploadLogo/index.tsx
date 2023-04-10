import { Upload } from 'antd';
import { debounce, differenceBy } from 'lodash-es';
import XiuIcon from '@/components/XiuIcon';
import { VideoDimension } from '@/utils/uploader';
import styles from './index.less';

function UploadLogo(props: {
  _uploadList: (list: any) => void;
  uploadList: object[];
}) {
  const { uploadList, _uploadList } = props;

  const handleFilesChange = debounce(async (uploadFiles: File[]) => {
    const temp = differenceBy(uploadFiles, uploadList, 'uid');
    const arr = [];
    for (let i = 0; i < temp.length; i++) {
      const item = temp[i];
      const { getImageInfo } = VideoDimension(item);
      const imgInfo = await getImageInfo();
      const obj = {
        ...imgInfo,
        upId: `${item.uid}`,
        file: item,
        state: 0,
        progress: 0,
      };
      arr.push(obj);
    }

    const newArr = arr.concat(uploadList);
    _uploadList(newArr);
  }, 200);

  const UploadProps = {
    beforeUpload: (file: File, uploadFiles: File[]) => {
      handleFilesChange(uploadFiles);
      return false;
    },
  };

  return (
    <>
      <Upload
        {...UploadProps}
        multiple
        showUploadList={false}
        accept=".png,.jpeg,.jpg"
      >
        <div className={styles.uploadLogo} onClick={e => { }}>
          <div className={styles.uploadLogoIcon}>
            <XiuIcon type="iconxingzhuangjiehe6" />
          </div>
          <div className={styles.uploadLogoTxt}>点击上传你的LOGO</div>
          <div className={styles.uploadLogoHoverTxt}>
            格式：png、jpg 大小不超过10mb
          </div>
        </div>
      </Upload>
    </>
  );
}

export default UploadLogo;
