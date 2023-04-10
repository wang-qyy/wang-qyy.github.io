import { memo, PropsWithChildren } from 'react';
import { Upload } from 'antd';
import { useCheckLoginStatus } from '@/hooks/loginChecker';
import { XiuIcon } from '@/components';
import UploadItem from './UploadItem';
import Image from './Image';
import './index.less';

interface ListProps {
  list: object[];
  uploadList: object[];
  UploadProps: (file: any) => void;
  brand_id: string | number;
  changeFileState: (file: any) => void;
}
const { Dragger } = Upload;

const BrandList = ({
  list,
  UploadProps,
  uploadList,
  brand_id,
  changeFileState,
}: PropsWithChildren<ListProps>) => {
  const { checkLoginStatus } = useCheckLoginStatus();

  return (
    <div className="brandListWarp">
      {[...uploadList, ...list].length > 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill,148px)',
            gap: 16,
            alignContent: 'start',
          }}
        >
          {uploadList?.length > 0 &&
            uploadList.map((item, index) => {
              return (
                <UploadItem
                  key={index}
                  item={item}
                  brand_id={brand_id}
                  changeFileState={changeFileState}
                />
              );
            })}
          {list.map((item: any) => (
            <Image key={`user-space-userImg-${item.id}`} data={item} />
          ))}
        </div>
      ) : (
        <Dragger
          multiple
          {...UploadProps}
          showUploadList={false}
          accept=".png,.jpeg,.jpg"
        >
          <div
            className="brandList"
            onClick={e => {
              checkLoginStatus();
            }}
          >
            <div className="brandListAdd">
              <XiuIcon type="iconxingzhuangjiehe6" />
            </div>
            <div className="brandListTitle">公司形象LOGO放这里</div>
            <div className="brandListTxt">
              拖放到此处上传图标
              <br /> 文件格式可以为 PNG、JPG格式
            </div>
          </div>
        </Dragger>
      )}
    </div>
  );
};

export default memo(BrandList);
