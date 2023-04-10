import React, { useState, useEffect } from 'react';
import { Tabs } from 'antd';
import XiuIcon from '@/components/XiuIcon';
import { useBrand } from '@/pages/SidePanel/Brand/BrandModal/hook/useBrand';
import FontUpload from './FontUpload';
import DropDown from '../DropDown';
import BrandFontItem from './BrandFontItem';
import styles from './index.less';
import UploadFont from './UploadFont';

const { TabPane } = Tabs;

function BrandFont(props: { id: string; updateFontCallBack: () => void }) {
  const { id, updateFontCallBack } = props;
  const { updateFontList, bindFontDetail } = useBrand();
  const [fontDetail, _fontDetail]: any = useState();
  const [fontList, _fontList] = useState([]);
  const [activeKey, _activeKey] = useState('1');

  // 更新品牌字体详情
  const updateFontDetail = () => {
    bindFontDetail((data: any) => {
      _fontDetail(data.info);
    });
  };

  useEffect(() => {
    if (id) {
      updateFontDetail();
    }
  }, [id]);

  // 更新上传字体列表
  const uploadSucceed = () => {
    updateFontList(res => {
      _fontList(res?.items);
    });
  };

  const onChange = (key: string) => {
    _activeKey(key);
  };

  useEffect(() => {
    _activeKey('1');
    uploadSucceed();
  }, []);

  return (
    <div className={styles.brandFont}>
      <DropDown
        isOpen
        name="品牌字库"
        right={
          <FontUpload
            uploadSucceed={() => {
              uploadSucceed();
              _activeKey('2');
            }}
          >
            <div className={styles.rightBtn}>
              <span className={styles.rightBtnSpan}>
                <XiuIcon type="shangchuan" />
              </span>
              上传字体
            </div>
          </FontUpload>
        }
      >
        <div className={styles.brandFontWarp}>
          <Tabs activeKey={activeKey} onChange={onChange}>
            <TabPane tab="文字样式" key="1">
              {[
                { type: '1', item: fontDetail?.title, defaultFontSize: 62 },
                { type: '2', item: fontDetail?.subtitle, defaultFontSize: 44 },
                { type: '3', item: fontDetail?.content, defaultFontSize: 14 },
              ].map(item => {
                return (
                  <BrandFontItem
                    key={item.type}
                    type={item.type}
                    item={item.item}
                    defaultFontSize={item.defaultFontSize}
                    updateFontDetail={() => {
                      updateFontDetail();
                      updateFontCallBack && updateFontCallBack();
                    }}
                    fontList={fontList}
                  />
                );
              })}
            </TabPane>
            <TabPane tab="已上传字体" key="2">
              <UploadFont
                fontList={fontList}
                uploadSucceed={() => {
                  uploadSucceed();
                }}
              />
            </TabPane>
          </Tabs>
        </div>
      </DropDown>
    </div>
  );
}

export default BrandFont;
