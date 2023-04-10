import { useState, useEffect } from 'react';
import XiuIcon from '@/components/XiuIcon';
import { useBrand } from '@/pages/SidePanel/Brand/BrandModal/hook/useBrand';
import AddColorDropdown from './AddColorDropdown';
import DropDown from '../DropDown';
import BrandColorItem from './BrandColorItem';

import styles from './index.less';

function BranColor(props: { id: string; updateColorCallBack: () => void }) {
  const { id, updateColorCallBack } = props;
  const { updateColorList } = useBrand();

  // 是否显示新增按钮
  const [addBtnShow, _addBtnShow] = useState(true);
  // 调色板总数
  const [colorObj, _colorObj] = useState({
    count: 0,
    items: [
      {
        id: '',
        title: '调色板',
        colors: [],
      },
    ],
    maxColorCount: 200,
    maxCount: 100,
    total: 0,
  });
  const getColorList = () => {
    updateColorList(id, data => {
      if (data.total) {
        _colorObj(data);
        if (data.total >= data.maxCount) {
          _addBtnShow(false);
        }
      } else {
        _colorObj({
          count: 0,
          items: [
            {
              id: '',
              title: '调色板',
              colors: [],
            },
          ],
          maxColorCount: 200,
          maxCount: 100,
          total: 0,
        });
        _addBtnShow(true);
      }
    });
  };

  useEffect(() => {
    if (id) {
      getColorList();
    }
  }, [id]);

  return (
    <div className={styles.brandColor}>
      <DropDown
        isOpen
        name={`品牌颜色（${colorObj?.total || 0}）`}
        right={
          addBtnShow && (
            <AddColorDropdown
              getColorList={() => {
                getColorList();
                updateColorCallBack && updateColorCallBack();
              }}
            >
              <div className={styles.rightBtn}>
                <span className={styles.rightBtnSpan}>
                  <XiuIcon type="iconxingzhuangjiehe6" />
                </span>
                新增调色板
              </div>
            </AddColorDropdown>
          )
        }
      >
        <div className={styles.brandColorWarp}>
          {colorObj?.items?.map(item => {
            return (
              <BrandColorItem
                item={item}
                key={item.id}
                getColorList={() => {
                  getColorList();
                  updateColorCallBack && updateColorCallBack();
                }}
                maxColorCount={colorObj.maxColorCount}
                total={colorObj.total}
              />
            );
          })}
        </div>
      </DropDown>
    </div>
  );
}

export default BranColor;
