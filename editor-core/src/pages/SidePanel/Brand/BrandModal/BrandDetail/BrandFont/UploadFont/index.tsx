import React from 'react';
import XiuIcon from '@/components/XiuIcon';
import FontUpload from '../FontUpload';
import ShowFont from './ShowFont';
import styles from './index.less';

function UploadFont(props: { fontList: object[]; uploadSucceed: () => void }) {
  const { fontList = [], uploadSucceed } = props;

  return (
    <div className={styles.uploadFont}>
      {fontList?.length > 0 ? (
        <div className={styles.uploadFontListWarp}>
          {fontList.map((item: any) => {
            return (
              <div key={item.id} className={styles.listItem}>
                <ShowFont
                  item={item}
                  delBtnShow
                  uploadSucceed={uploadSucceed}
                />
              </div>
            );
          })}
        </div>
      ) : (
        <div className={styles.uploadFontWarp}>
          <FontUpload uploadSucceed={uploadSucceed}>
            <div className={styles.uploadWarp}>
              <XiuIcon type="shangchuan" className={styles.fontUploaIcon} />
              上传字体
            </div>
          </FontUpload>
        </div>
      )}
    </div>
  );
}

export default UploadFont;
