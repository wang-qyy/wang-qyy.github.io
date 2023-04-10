import React, { useEffect, useState } from 'react';
import { Dropdown, Menu } from 'antd';
import { ExclamationCircleFilled } from '@ant-design/icons';
import XiuIcon from '@/components/XiuIcon';
import { randomHexColor } from '@/utils/single';
import { useBrand } from '@/pages/SidePanel/Brand/BrandModal/hook/useBrand';
import { WarnModal } from '@/components/WarnModal';
import ModifyName from '@/components/ModifyName';
import styles from './index.less';
import ColorItem from './ColorItem';

function BrandColorItem(props: {
  item: any;
  maxColorCount: number;
  total: number;
  getColorList: () => void;
}) {
  const { item, maxColorCount, total, getColorList } = props;
  const { delBrandColor, addColor, addBrandColor, modifyPaletteName } =
    useBrand();
  const [isAdd, _isAdd] = useState(false);
  const [addShow, _addShow] = useState(true);
  const [delShow, _delShow] = useState(true);
  const [title, _title] = useState(item.title);

  // 颜色超过限制不显示添加按钮
  useEffect(() => {
    if (item.colorCount && item.colorCount >= maxColorCount) {
      _addShow(false);
    } else {
      _addShow(true);
    }
  }, [item.colorCount]);

  // 颜色超过限制不显示添加按钮
  useEffect(() => {
    if (total && total === 1) {
      _delShow(false);
    } else {
      if (total) {
        _delShow(true);
      } else {
        _delShow(false);
      }
    }
  }, [total]);

  const alterName = async (value: string) => {
    const newValue = value || '调色板';

    if (value !== title) {
      if (total < 1) {
        addBrandColor({ title: newValue, colors: [] }, () => {
          getColorList();
        });
      } else {
        modifyPaletteName(newValue, item.id, res => {
          _title(newValue);
        });
      }
    }
  };

  return (
    <div className={styles.brandColorItem}>
      <div className={styles.brandColorItemTop}>
        <div className={styles.topTitle}>
          <ModifyName
            templateTitle={title}
            alterName={alterName}
            styles={styles}
          />
        </div>
        {delShow && (
          <Dropdown
            overlayClassName="brandColorItemDropdown"
            overlay={
              <Menu>
                <Menu.Item
                  key="del"
                  onClick={() => {
                    WarnModal({
                      title: (
                        <div>
                          <ExclamationCircleFilled
                            style={{ color: '#E43114', marginRight: '10px' }}
                          />
                          确定删除调色板？
                        </div>
                      ),
                      content: '删除后无法撤销，现有设计不会受影响。',
                      button: '确定删除',
                      onOk: () => {
                        delBrandColor(item.id, () => {
                          getColorList();
                        });
                      },
                      onCancel: () => { },
                      width: 335,
                    });
                  }}
                >
                  <XiuIcon type="delete" className={styles.topTitleMenuIcon} />
                  删除调色板
                </Menu.Item>
              </Menu>
            }
          >
            <div className={styles.topBtn}>
              <XiuIcon type="huaban1" />
            </div>
          </Dropdown>
        )}
      </div>
      <div className={styles.brandColorItemBottom}>
        {item.colors.map((i: any, index: number) => {
          return (
            <ColorItem
              key={index}
              item={i}
              id={item.id}
              show={isAdd && item.colors?.length === index + 1}
              _isAdd={_isAdd}
              getColorList={getColorList}
            />
          );
        })}

        {addShow && (
          <div
            className={styles.addBtn}
            onClick={() => {
              _isAdd(true);
              if (item.id) {
                addColor(item.id, randomHexColor(), '', () => {
                  getColorList();
                });
              } else {
                addBrandColor(
                  { title: '调色板', colors: [randomHexColor()] },
                  () => {
                    getColorList();
                  },
                );
              }
            }}
          >
            <XiuIcon type="iconxingzhuangjiehe6" />
          </div>
        )}
      </div>
    </div>
  );
}

export default BrandColorItem;
