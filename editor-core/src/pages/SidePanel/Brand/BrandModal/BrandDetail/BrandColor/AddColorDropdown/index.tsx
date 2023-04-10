import React, { useState, useEffect } from 'react';
import { Dropdown, Menu } from 'antd';
import { useBrand } from '@/pages/SidePanel/Brand/BrandModal/hook/useBrand';
import styles from './index.less';

function AddColorDropdown(props: any) {
  const { children, getColorList } = props;
  const [visible, _visible] = useState(false);
  const { addBrandColor, bindSystemColorList } = useBrand();
  const [colors, _colors] = useState([]);

  const systemColorList = () => {
    bindSystemColorList(1, 60, (data: any) => {
      _colors(data?.items);
    });
  };

  useEffect(() => {
    systemColorList();
  }, []);

  return (
    <Dropdown
      trigger={['click']}
      visible={visible}
      overlayClassName="addColorDropdown"
      onVisibleChange={visible => {
        _visible(visible);
      }}
      getPopupContainer={ele => ele}
      overlay={
        <Menu>
          <div
            className={styles.addColorDropdownTitle}
            onClick={() => {
              addBrandColor({ title: '调色板', colors: [] }, () => {
                getColorList();
                _visible(false);
              });
            }}
          >
            <span className={styles.leftAddIcon}>+</span>添加自定义调色板
          </div>
          <div className={styles.addColorDropdownContent}>
            {colors.map((item: any) => {
              return (
                <Menu.Item
                  key={item.id}
                  className={styles.addColorDropdownMenuItem}
                  onClick={() => {
                    addBrandColor(
                      { title: item.title, colors: item.colors },
                      () => {
                        getColorList();
                        _visible(false);
                      },
                    );
                  }}
                >
                  <div className={styles.menuItemTitle}>{item.title}</div>
                  <div className={styles.menuItemContent}>
                    {item.colors?.map((i: string, index: number) => {
                      return (
                        <div
                          key={index}
                          className={styles.colorItem}
                          style={{ background: i }}
                        />
                      );
                    })}
                  </div>
                </Menu.Item>
              );
            })}
          </div>
        </Menu>
      }
    >
      <div
        onClick={e => {
          _visible(!visible);
        }}
      >
        {children}
      </div>
    </Dropdown>
  );
}

export default AddColorDropdown;
