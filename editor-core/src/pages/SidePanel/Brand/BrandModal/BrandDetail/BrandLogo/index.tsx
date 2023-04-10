import React, { useState, useEffect } from 'react';
import { useBrand } from '@/pages/SidePanel/Brand/BrandModal/hook/useBrand';
import DropDown from '../DropDown';
import UploadLogo from './UploadLogo';
import UploadItem from './UploadItem';
import styles from './index.less';

function BranLogo(props: { id: string; updateLogoCallBack: () => void }) {
  const { id, updateLogoCallBack } = props;
  const [logoList, _logoList] = useState([]);
  const [total, _total] = useState(0);
  const [maxCount, _maxCount] = useState(0);
  const { delLogo, brandLogoList } = useBrand();
  const [uploadList, _uploadList] = useState([]);

  const bindLogoList = (id: string) => {
    brandLogoList(id, res => {
      _maxCount(res.maxCount);
      _total(res?.total);
      _logoList(res?.items);
    });
  };

  function changeFileState(fileId: string, info: any) {
    _uploadList(prevState => {
      const files = prevState;

      const index = files.findIndex(item => item.upId === fileId);
      if (files[index]) {
        if (info.duration) {
          Object.assign(files[index], {
            values: { duration: info.duration },
          });
        }
        // 上传状态
        if (info.state) {
          Object.assign(files[index], { state: info.state });
        }

        if (info.width) {
          Object.assign(files[index], {
            height: info.height,
            width: info.width,
          });
        }

        if (info.poster) {
          Object.assign(files[index], {
            cover_path: info.poster,
            small_cover_path: info.poster,
            id: info.id,
          });
        }

        if (info.progress) {
          Object.assign(files[index], {
            progress: info.progress,
          });
        }

        if (info.file_id) {
          Object.assign(files[index], { file_id: info.file_id, id: info.id });
        }
      }
      const newFiles = JSON.parse(JSON.stringify(files));
      return newFiles;
    });
  }

  useEffect(() => {
    bindLogoList(id);
  }, [id]);

  const updateLogoList = () => {
    updateLogoCallBack && updateLogoCallBack();
    bindLogoList(id);
    _uploadList([]);
  };

  return (
    <div className={styles.branLogo}>
      <DropDown name={`品牌LOGO（${total + uploadList?.length}）`} isOpen>
        <div className={styles.branLogoWarp}>
          {(!maxCount || total + uploadList?.length < maxCount) && (
            <UploadLogo uploadList={uploadList} _uploadList={_uploadList} />
          )}
          {[...uploadList, ...logoList].map((item: any, index: number) => {
            return (
              <UploadItem
                key={index}
                item={item}
                changeFileState={changeFileState}
                brand_id={id}
                updateLogoList={updateLogoList}
                updateLogoCallBack={updateLogoCallBack}
                delLogo={delLogo}
              />
            );
          })}
        </div>
      </DropDown>
    </div>
  );
}

export default BranLogo;
