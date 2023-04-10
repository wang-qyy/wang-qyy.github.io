import React, { useState, useEffect } from 'react';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { getFontDetail } from '@/api/upload';
import { useBrand } from '@/pages/SidePanel/Brand/BrandModal/hook/useBrand';
import { WarnModal } from '@/components/WarnModal';
import XiuIcon from '@/components/XiuIcon';
import styles from './index.less';

function ShowFont(props: {
  item: any;
  delBtnShow: boolean;
  uploadSucceed: () => void;
}) {
  const { item, delBtnShow, uploadSucceed } = props;
  const { file_id, id } = item;
  const [uploadFontSrc, setUploadFontSrc] = useState('');
  const { delFont } = useBrand();

  // 上传字体获取显示字体链接
  useEffect(() => {
    getFontDetail(file_id).then(res => {
      if (res?.code === 0) {
        setUploadFontSrc(res.data?.fileInfo?.cover_path);
      }
    });
  }, [file_id]);
  return (
    <div className={styles['selected-fontFamily']}>
      <div className={styles.left}>
        {uploadFontSrc && <img src={uploadFontSrc} alt="text" height={22} />}
      </div>
      {delBtnShow && (
        <XiuIcon
          type="delete"
          className={styles.right}
          onClick={() => {
            WarnModal({
              title: (
                <div>
                  <ExclamationCircleFilled
                    style={{ color: '#E43114', marginRight: '10px' }}
                  />
                  确定删除已上传字体？
                </div>
              ),
              content:
                '删除后无法撤销该字体，已使用过当前字体设计模版 不会受影响。',
              button: '确定删除',
              onOk: () => {
                delFont([id], res => {
                  uploadSucceed();
                });
              },
              onCancel: () => { },
              width: 335,
            });
          }}
        />
      )}
    </div>
  );
}

export default ShowFont;
