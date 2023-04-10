import React from 'react';
import ModifyName from '@/components/ModifyName';
import { useBrand } from '@/pages/SidePanel/Brand/BrandModal/hook/useBrand';
import { useActiveBrand } from '@/store/adapter/useGlobalStatus';
import BrandLogo from './BrandLogo';
import BrandColor from './BrandColor';
import BrandFont from './BrandFont';
import styles from './index.less';

interface ActiveBrand {
  id: string;
  title: string;
}
function BrandDetail(props: {
  activeBrand: ActiveBrand;
  updateFontCallBack: () => void;
  updateColorCallBack: () => void;
  updateLogoCallBack: () => void;
}) {
  const { modifyName, bindActiveBrand } = useBrand();
  const { updateActiveBrand }: any = useActiveBrand();
  const {
    activeBrand,
    updateFontCallBack,
    updateColorCallBack,
    updateLogoCallBack,
  } = props;

  const alterName = (val: string) => {
    modifyName(val, () => {
      bindActiveBrand((res: any) => {
        updateActiveBrand(res);
      }, '');
    });
  };
  return (
    <div className={styles.brandDetail}>
      <div className={styles.brandDetailWarp} id="brandDetailWarp">
        <div className={styles.brandDetailTitle}>
          <ModifyName
            templateTitle={activeBrand?.title}
            alterName={alterName}
            styles={styles}
          />
        </div>
        <BrandLogo
          id={activeBrand?.id}
          updateLogoCallBack={updateLogoCallBack}
        />
        <BrandColor
          id={activeBrand?.id}
          updateColorCallBack={updateColorCallBack}
        />
        <BrandFont
          id={activeBrand?.id}
          updateFontCallBack={updateFontCallBack}
        />
      </div>
    </div>
  );
}

export default BrandDetail;
