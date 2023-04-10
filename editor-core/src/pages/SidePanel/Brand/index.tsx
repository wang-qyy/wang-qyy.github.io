import { Button, message, Upload } from 'antd';
import { useState, useEffect } from 'react';
import { debounce, differenceBy } from 'lodash-es';
import SidePanelWrap from '@/components/SidePanelWrap';
import { useCheckLoginStatus } from '@/hooks/loginChecker';
import { useBrand } from '@/pages/SidePanel/Brand/BrandModal/hook/useBrand';
import { useActiveBrand } from '@/store/adapter/useGlobalStatus';
import { getUserId } from '@/store/adapter/useUserInfo';
import { VideoDimension } from '@/utils/uploader';
import { clickActionWeblog } from '@/utils/webLog';
import BrandList from './BrandList/index';
import BrandModal from './BrandModal/index';

import './index.less';

const Brand = () => {
  const [logoList, _logoList] = useState([]);
  const [total, _total] = useState(0);
  const [maxCount, _maxCount] = useState(0);
  const { brandLogoList, addBrand, bindActiveBrand } = useBrand();
  const { activeBrand, updateActiveBrand }: any = useActiveBrand();
  const [uploadList, _uploadList] = useState([]);
  const { checkLoginStatus } = useCheckLoginStatus();
  const userId = getUserId();

  const bindLogoList = (id: string) => {
    brandLogoList(id, res => {
      _total(res?.total);
      _maxCount(res.maxCount);
      _logoList(res?.items);
    });
  };

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
    openFileDialogOnClick: userId > -1,
    beforeUpload: (file: File, uploadFiles: File[]) => {
      if (!activeBrand?.id) {
        addBrand('未命名的品牌工具箱', (res: any) => {
          bindActiveBrand(res => {
            updateActiveBrand(res);
            handleFilesChange(uploadFiles);
          }, '');
        });
      } else {
        handleFilesChange(uploadFiles);
      }
      return false;
    },
  };

  function changeFileState(fileId: string, info: any) {
    _uploadList(prevState => {
      const files = prevState;

      const index = files.findIndex(item => item.upId === fileId);
      if (files[index]) {
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

        if (info.cover_path) {
          Object.assign(files[index], {
            file_format: info.file_format,
            cover_path: info.cover_path,
            small_cover_path: info.small_cover_path,
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
    if (activeBrand?.id) {
      _uploadList([]);
      bindLogoList(activeBrand?.id);
    }
  }, [activeBrand?.id]);

  return (
    <div className="brandLogo">
      <SidePanelWrap
        search={
          <div className="brandLogoTop">
            <div className="brandModal">
              <BrandModal
                updateLogoCallBack={() => {
                  bindLogoList(activeBrand?.id);
                }}
              />
            </div>
            <div hidden={total + uploadList?.length >= maxCount}>
              <Upload
                multiple
                {...UploadProps}
                showUploadList={false}
                accept=".png,.jpeg,.jpg,.svg"
              >
                <Button
                  className="upload-icon"
                  type="primary"
                  onClick={e => {
                    checkLoginStatus();
                  }}
                >
                  上传品牌LOGO
                </Button>
              </Upload>
            </div>
          </div>
        }
      >
        <div className="brandLogoContent">
          <BrandList
            list={logoList}
            UploadProps={UploadProps}
            uploadList={uploadList}
            brand_id={activeBrand?.id}
            changeFileState={changeFileState}
          />
        </div>
      </SidePanelWrap>
    </div>
  );
};
export default Brand;
