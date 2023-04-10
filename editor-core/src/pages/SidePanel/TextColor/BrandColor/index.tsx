import { useState, useEffect } from 'react';
import { useBrand } from '@/pages/SidePanel/Brand/BrandModal/hook/useBrand';
import { colorToRGBAObject } from '@kernel/utils/single';

import {
  useSvgColorsByObserver,
  useSetTemplateBackgroundColorByObserver,
  useFontColorByObserver,
} from '@hc/editor-core';

import BrandModal from '@/pages/SidePanel/Brand/BrandModal';
import { useActiveBrand } from '@/store/adapter/useGlobalStatus';
import styles from './index.less';

function BrandColor(props: { panelKey: string }) {
  const { panelKey } = props;
  const { updateColorList } = useBrand();
  const { activeBrand }: any = useActiveBrand();
  const [value, updateColor] = useSvgColorsByObserver();
  const { update } = useSetTemplateBackgroundColorByObserver();
  const [fontColor, updateFontColor] = useFontColorByObserver();

  const [colorList, _colorList] = useState([]);

  const getColorList = () => {
    updateColorList(activeBrand?.id, data => {
      _colorList(data?.items);
    });
  };

  // 点击品牌颜色
  const binClickColor = (color: string) => {
    switch (panelKey) {
      case 'tool-svg-color':
        return updateColor({
          ...value,
          [Object.keys(value)[0]]: {
            id: Object.keys(value)[0],
            color: colorToRGBAObject(color),
          },
        });
      case 'tool-template_background_color':
        return update(colorToRGBAObject(color));
      case 'tool-fontColor':
        updateFontColor(colorToRGBAObject(color));
    }
  };
  useEffect(() => {
    if (activeBrand?.id) {
      getColorList();
    }
  }, [activeBrand?.id]);

  // 判断是否显示添加品牌按钮
  const getAddBtnHidden = () => {
    if (colorList?.length == 1 && colorList[0]?.colorCount == 0) {
      return false;
    }
    if (colorList?.length > 0) {
      return true;
    }
    if (!activeBrand?.id) {
      return true;
    }
  };

  return (
    <>
      <div className={styles.brandColorTopLine} hidden={!activeBrand?.id} />
      <div className={styles.brandColor}>
        <div className={styles.brandColorTop}>
          <BrandModal updateColorCallBack={getColorList} />
        </div>
        <div className={styles.brandColorContent}>
          {colorList?.length > 0 && (
            <div className={styles.contentColors}>
              {colorList.map((item: any) => {
                return (
                  item.colors?.length > 0 && (
                    <div key={item.title} className={styles.contentColorsItem}>
                      <div className={styles.itemName}>{item.title}</div>
                      <div className={styles.brandColorContentColors}>
                        {item.colors.map((i: any, index: number) => {
                          return (
                            <div
                              key={index}
                              className={styles.colorItem}
                              style={{
                                background: i,
                              }}
                              onClick={() => {
                                binClickColor(i);
                              }}
                            />
                          );
                        })}
                      </div>
                    </div>
                  )
                );
              })}
            </div>
          )}
          <BrandModal BrandModal updateColorCallBack={getColorList}>
            <div className={styles.brandColorAdd} hidden={getAddBtnHidden()}>
              <span>+</span>添加自己的品牌颜色
            </div>
          </BrandModal>
        </div>
      </div>
    </>
  );
}

export default BrandColor;
