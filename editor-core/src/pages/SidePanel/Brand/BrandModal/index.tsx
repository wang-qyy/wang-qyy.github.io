import React, { useState, PropsWithChildren, useEffect } from 'react';
import NoTitleModal from '@/components/NoTitleModal';
import { XiuIcon } from '@/components';
import { useActiveBrand } from '@/store/adapter/useGlobalStatus';
import { useCheckLoginStatus } from '@/hooks/loginChecker';
import BrandList from './BrandList';
import BrandDetail from './BrandDetail';
import styles from './index.less';
import { useBrand } from './hook/useBrand';

function BrandModal(props: PropsWithChildren<any>) {
  const {
    children,
    updateFontCallBack,
    updateColorCallBack,
    updateLogoCallBack,
  } = props;
  const [visible, setVisible] = useState('');
  const { updateBranfList, bindActiveBrand } = useBrand();
  const { checkLoginStatus } = useCheckLoginStatus();

  const { activeBrand, updateActiveBrand } = useActiveBrand();
  // 是否可以切换品牌
  const [brandSwitch, _brandSwitch] = useState(false);
  // 是否显示品牌栏
  const [brandShow, _brandShow] = useState(false);

  // 品牌列表
  const [branfList, _branfList] = useState([]);

  useEffect(() => {
    if (!children) {
      updateBranfList(data => {
        if (data?.total >= 1) {
          bindActiveBrand(res => {
            updateActiveBrand(res);
          }, '');
          _brandShow(true);
          _branfList(data?.items);
          if (data?.total > 1) {
            _brandSwitch(true);
          } else {
            _brandSwitch(false);
          }
        }

        if (data?.total === 0) {
          _brandShow(false);
          _brandSwitch(false);
        }
      });
    }
  }, [activeBrand?.id]);

  return (
    <>
      <NoTitleModal
        visible={visible !== ''}
        width={visible === 'list' ? 640 : 806}
        onCancel={() => {
          setVisible('');
        }}
        centered
        footer={null}
      >
        {visible === 'list' ? (
          <BrandList branfList={branfList} setVisible={setVisible} />
        ) : (
          <BrandDetail
            activeBrand={activeBrand}
            updateFontCallBack={updateFontCallBack}
            updateColorCallBack={updateColorCallBack}
            updateLogoCallBack={updateLogoCallBack}
          />
        )}
      </NoTitleModal>

      {children ? (
        <div
          onClick={e => {
            if (!checkLoginStatus()) {
              setVisible('detail');
            }
          }}
        >
          {children}
        </div>
      ) : (
        <>
          {brandShow && (
            <div className={styles.brandModalTop}>
              <div
                className={styles.left}
                style={brandSwitch ? {} : { cursor: 'default' }}
                onClick={() => {
                  brandSwitch && setVisible('list');
                }}
              >
                <XiuIcon className={styles.leftIcon} type="pinpai-6ae70fc5" />
                <span className={styles.leftTitle}>{activeBrand?.title}</span>
                {brandSwitch && (
                  <XiuIcon className={styles.leftIcon1} type="iconxiala" />
                )}
              </div>
              <div
                className={styles.right}
                onClick={() => {
                  setVisible('detail');
                }}
              >
                编辑
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}

export default BrandModal;
