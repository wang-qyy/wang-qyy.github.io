import { getTemplateClassify, TemplateClassify } from '@/api/template';
import { useRequest } from 'ahooks';
import { Menu, Dropdown } from 'antd';
import classNames from 'classnames';
import React, { ReactText, useEffect, useRef, useState } from 'react';
import { XiuIcon } from '@/components';
import { getCanvasShape } from '@/utils/templateHandler';
import { sortOption } from '../options';
import FilterRow from './FilterRow';
import styles from './index.modules.less';

interface IProps {
  onFilterChange: (filters: Record<string, any>) => void;
  onOrderbyChange: (orderby: ReactText) => void;
  filterData: TemplateClassify | undefined;
}

const Filter: React.FC<IProps> = props => {
  const { onFilterChange, onOrderbyChange, filterData } = props;
  const [orderby, _orderby] = useState<ReactText>(0);

  const onSelect = (params: Record<string, any>) => {
    onFilterChange(params);
  };

  if (!filterData) return null;

  const styleList = filterData.tags.st;

  const moreList = styleList.slice(4, styleList.length - 1);
  const moreStyleActive = moreList.find(t => !!t.active);

  return (
    <div className={styles.filter}>
      {/** 分类 用途 行业 */}
      {Object.entries(filterData.classes).map(([label, list]) => (
        <FilterRow onSelect={onSelect} key={label} label={label} list={list} />
      ))}
      <div className={styles.sortRow}>
        {/** 排序 */}
        <div className={styles.sortRow}>
          <div className={styles.label}>排序</div>
          <div className={styles.list}>
            {sortOption.map(item => (
              <div
                key={item.label}
                onClick={() => {
                  onOrderbyChange(item.value);
                  _orderby(item.value);
                }}
                className={classNames(styles.item, {
                  [styles.active]: item.value === orderby,
                })}
              >
                {item.label}
              </div>
            ))}
          </div>
        </div>
        {/** 风格 */}
        <div style={{ marginLeft: 24 }} className={styles.sortRow}>
          <div className={styles.label}>风格</div>
          <div className={styles.list}>
            {styleList.slice(0, 4).map(item => (
              <div
                key={item.name}
                onClick={() => {
                  // _orderby(item.value);
                  onSelect(item.params);
                }}
                className={classNames(styles.item, {
                  [styles.active]: item.active,
                })}
              >
                {item.name}
              </div>
            ))}
            {/** 更多下拉框 */}
            <div>
              <Dropdown
                overlay={
                  <Menu>
                    {moreList.map(t => (
                      <Menu.Item
                        className={styles.menuItem}
                        onClick={() => {
                          onSelect(t.params);
                        }}
                        key={t.name}
                      >
                        {t.name}
                      </Menu.Item>
                    ))}
                  </Menu>
                }
              >
                <div
                  className={classNames(styles.item, {
                    [styles.active]: moreStyleActive?.id,
                  })}
                >
                  {moreStyleActive?.id ? moreStyleActive.name : '更多'}
                  <XiuIcon style={{ marginLeft: 3 }} type="iconarrow_right" />
                </div>
              </Dropdown>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Filter;
